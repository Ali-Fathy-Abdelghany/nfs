using System.Globalization;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using NFS.Application.DTOs;
using NFS.Application.Interfaces.Services;
using NFS.Application.Options;

namespace NFS.Application.Services;

/// <summary>
/// Paymob Egypt Accept Intention API + unified checkout redirect.
/// Falls back is handled in DI when PaymobOptions.IsConfigured is false.
/// </summary>
public class PaymobPaymentGateway : IPaymentGateway
{
    private readonly HttpClient _http;
    private readonly PaymobOptions _options;
    private readonly ILogger<PaymobPaymentGateway> _logger;

    public PaymobPaymentGateway(HttpClient http, IOptions<PaymobOptions> options, ILogger<PaymobPaymentGateway> logger)
    {
        _http = http;
        _options = options.Value;
        _logger = logger;
        _http.BaseAddress = new Uri(_options.BaseUrl.TrimEnd('/') + "/");
        // Do NOT set DefaultRequestHeaders.Authorization here.
        // Intention uses Secret Token; auth-token + transaction_inquiry use API-key auth_token in body.
        // A global Token header breaks those legacy Accept endpoints.
    }

    public async Task<PaymentGatewaySession> CreateCheckoutSessionAsync(decimal amount, string currency, int paymentId)
    {
        if (!_options.IsConfigured)
            throw new InvalidOperationException("Paymob is not configured.");

        if (!int.TryParse(_options.IntegrationId.Trim(), NumberStyles.Integer, CultureInfo.InvariantCulture, out var integrationId))
            throw new InvalidOperationException("PAYMOB_INTEGRATION_ID must be a numeric integration id.");

        var amountCents = (int)Math.Round(amount * 100m, MidpointRounding.AwayFromZero);
        if (amountCents <= 0)
            throw new ArgumentOutOfRangeException(nameof(amount), "Amount must be greater than zero.");

        var callbackBase = (_options.CallbackBaseUrl ?? string.Empty).TrimEnd('/');
        if (string.IsNullOrWhiteSpace(callbackBase))
            throw new InvalidOperationException("PAYMOB_CALLBACK_BASE_URL is required for Paymob webhooks/redirects.");

        var specialReference = $"nfs_payment_{paymentId}";
        var notificationUrl = $"{callbackBase}/api/payments/paymob/webhook";
        var redirectionUrl = $"{callbackBase}/api/payments/paymob/return?paymentId={paymentId}";

        var body = new Dictionary<string, object?>
        {
            ["amount"] = amountCents,
            ["currency"] = string.IsNullOrWhiteSpace(currency) ? "EGP" : currency.Trim().ToUpperInvariant(),
            ["payment_methods"] = new[] { integrationId },
            ["special_reference"] = specialReference,
            ["notification_url"] = notificationUrl,
            ["redirection_url"] = redirectionUrl,
            ["items"] = new[]
            {
                new Dictionary<string, object?>
                {
                    ["name"] = $"Nafs payment #{paymentId}",
                    ["amount"] = amountCents,
                    ["description"] = "Therapy session payment",
                    ["quantity"] = 1
                }
            },
            ["billing_data"] = new Dictionary<string, object?>
            {
                ["apartment"] = "NA",
                ["first_name"] = "Nafs",
                ["last_name"] = "User",
                ["street"] = "NA",
                ["building"] = "NA",
                ["phone_number"] = "01000000000",
                ["city"] = "Cairo",
                ["country"] = "EG",
                ["email"] = "payments@nafs.local",
                ["floor"] = "NA",
                ["state"] = "NA"
            }
        };

        using var request = new HttpRequestMessage(HttpMethod.Post, "v1/intention/");
        request.Headers.Authorization = new AuthenticationHeaderValue("Token", _options.SecretKey);
        request.Content = new StringContent(JsonSerializer.Serialize(body), Encoding.UTF8, "application/json");

        using var response = await _http.SendAsync(request);
        var responseText = await response.Content.ReadAsStringAsync();
        if (!response.IsSuccessStatusCode)
            throw new InvalidOperationException($"Paymob intention failed ({(int)response.StatusCode}): {Truncate(responseText, 400)}");

        using var doc = JsonDocument.Parse(responseText);
        var root = doc.RootElement;
        var clientSecret = root.TryGetProperty("client_secret", out var cs)
            ? cs.GetString()
            : null;

        if (string.IsNullOrWhiteSpace(clientSecret))
            throw new InvalidOperationException("Paymob intention response missing client_secret.");

        var orderId = root.TryGetProperty("intention_order_id", out var oid)
            ? oid.ToString()
            : (root.TryGetProperty("id", out var idEl) ? idEl.ToString() : specialReference);

        var checkoutUrl =
            $"{_options.BaseUrl.TrimEnd('/')}/unifiedcheckout/?publicKey={Uri.EscapeDataString(_options.PublicKey)}&clientSecret={Uri.EscapeDataString(clientSecret)}";

        return new PaymentGatewaySession
        {
            ProviderReference = orderId,
            CheckoutUrl = checkoutUrl,
            ClientSecret = clientSecret,
            PublicKey = _options.PublicKey
        };
    }

    public Task<bool> ConfirmPaymentAsync(string providerReference)
    {
        // Client-side confirm must not mark Paymob payments paid; use verify / return / webhook.
        return Task.FromResult(false);
    }

    public async Task<bool?> VerifyWithProviderAsync(string? providerReference, string? merchantOrderId, string? transactionId)
    {
        if (!_options.IsConfigured)
        {
            _logger.LogWarning("Paymob verify skipped: Paymob is not configured");
            return null;
        }

        try
        {
            if (!string.IsNullOrWhiteSpace(transactionId))
            {
                var byTx = await GetTransactionByIdAsync(transactionId.Trim());
                if (byTx.HasValue)
                {
                    _logger.LogInformation("Paymob verify by transactionId={TransactionId} => {Result}", transactionId, byTx);
                    return byTx;
                }
            }

            if (!string.IsNullOrWhiteSpace(merchantOrderId))
            {
                var byMerchant = await InquireTransactionAsync(merchantOrderId: merchantOrderId.Trim(), orderId: null);
                if (byMerchant.HasValue)
                {
                    _logger.LogInformation("Paymob verify by merchant_order_id={MerchantOrderId} => {Result}", merchantOrderId, byMerchant);
                    return byMerchant;
                }
            }

            if (!string.IsNullOrWhiteSpace(providerReference))
            {
                var byOrder = await InquireTransactionAsync(merchantOrderId: null, orderId: providerReference.Trim());
                if (byOrder.HasValue)
                {
                    _logger.LogInformation("Paymob verify by order_id={OrderId} => {Result}", providerReference, byOrder);
                    return byOrder;
                }

                // Intention order id is sometimes usable as GET transaction path only after charge;
                // also try providerReference as transaction id when redirect omitted tx.
                var byRefAsTx = await GetTransactionByIdAsync(providerReference.Trim());
                if (byRefAsTx.HasValue)
                {
                    _logger.LogInformation("Paymob verify providerReference-as-tx={Id} => {Result}", providerReference, byRefAsTx);
                    return byRefAsTx;
                }
            }

            _logger.LogWarning(
                "Paymob verify inconclusive (no success flag) for tx={TransactionId} merchant={MerchantOrderId} order={OrderId}",
                transactionId, merchantOrderId, providerReference);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex,
                "Paymob verify exception for tx={TransactionId} merchant={MerchantOrderId} order={OrderId}",
                transactionId, merchantOrderId, providerReference);
        }

        return null;
    }

    private async Task<bool?> GetTransactionByIdAsync(string transactionId)
    {
        // Intention / post-pay APIs: Authorization Token <secret key>
        using var request = new HttpRequestMessage(HttpMethod.Get, $"api/acceptance/transactions/{Uri.EscapeDataString(transactionId)}");
        request.Headers.Authorization = new AuthenticationHeaderValue("Token", _options.SecretKey);

        using var response = await _http.SendAsync(request);
        var text = await response.Content.ReadAsStringAsync();
        if (!response.IsSuccessStatusCode)
        {
            // Fallback: legacy auth_token query (API key token)
            var authToken = await GetAuthTokenAsync();
            if (!string.IsNullOrWhiteSpace(authToken))
            {
                using var legacy = new HttpRequestMessage(
                    HttpMethod.Get,
                    $"api/acceptance/transactions/{Uri.EscapeDataString(transactionId)}?token={Uri.EscapeDataString(authToken)}");
                using var legacyRes = await _http.SendAsync(legacy);
                var legacyText = await legacyRes.Content.ReadAsStringAsync();
                if (!legacyRes.IsSuccessStatusCode)
                {
                    _logger.LogWarning(
                        "Paymob GET transaction {Id} failed secret={SecretStatus} token={TokenStatus}: {Body}",
                        transactionId, (int)response.StatusCode, (int)legacyRes.StatusCode, Truncate(legacyText, 240));
                    return null;
                }

                return ParseSuccessFlag(legacyText);
            }

            _logger.LogWarning("Paymob GET transaction {Id} returned {Status}: {Body}",
                transactionId, (int)response.StatusCode, Truncate(text, 240));
            return null;
        }

        return ParseSuccessFlag(text);
    }

    private async Task<bool?> InquireTransactionAsync(string? merchantOrderId, string? orderId)
    {
        var authToken = await GetAuthTokenAsync();
        if (string.IsNullOrWhiteSpace(authToken))
        {
            _logger.LogWarning("Paymob transaction_inquiry skipped: no auth token (is PAYMOB_API_KEY set?)");
            return null;
        }

        var body = new Dictionary<string, object?> { ["auth_token"] = authToken };
        if (!string.IsNullOrWhiteSpace(merchantOrderId))
            body["merchant_order_id"] = merchantOrderId;
        if (!string.IsNullOrWhiteSpace(orderId))
        {
            // Paymob expects numeric order_id when possible
            if (long.TryParse(orderId, NumberStyles.Integer, CultureInfo.InvariantCulture, out var numericOrder))
                body["order_id"] = numericOrder;
            else
                body["order_id"] = orderId;
        }

        using var request = new HttpRequestMessage(HttpMethod.Post, "api/ecommerce/orders/transaction_inquiry");
        // No Authorization header — auth_token is in the body for this Accept endpoint.
        request.Content = new StringContent(JsonSerializer.Serialize(body), Encoding.UTF8, "application/json");

        using var response = await _http.SendAsync(request);
        var text = await response.Content.ReadAsStringAsync();
        if (!response.IsSuccessStatusCode)
        {
            _logger.LogWarning("Paymob transaction_inquiry returned {Status} (merchant={Merchant} order={Order}): {Body}",
                (int)response.StatusCode, merchantOrderId, orderId, Truncate(text, 240));
            return null;
        }

        return ParseSuccessFlag(text);
    }

    private async Task<string?> GetAuthTokenAsync()
    {
        if (string.IsNullOrWhiteSpace(_options.ApiKey))
        {
            _logger.LogWarning("PAYMOB_API_KEY not set; cannot run auth-token inquiry path");
            return null;
        }

        using var request = new HttpRequestMessage(HttpMethod.Post, "api/auth/tokens");
        // No Secret Token header — this endpoint only accepts api_key in body.
        request.Content = new StringContent(
            JsonSerializer.Serialize(new { api_key = _options.ApiKey }),
            Encoding.UTF8,
            "application/json");

        using var response = await _http.SendAsync(request);
        var text = await response.Content.ReadAsStringAsync();
        if (!response.IsSuccessStatusCode)
        {
            _logger.LogWarning("Paymob auth token failed ({Status}): {Body}", (int)response.StatusCode, Truncate(text, 200));
            return null;
        }

        using var doc = JsonDocument.Parse(text);
        if (doc.RootElement.TryGetProperty("token", out var token))
            return token.GetString();

        _logger.LogWarning("Paymob auth token response missing token field");
        return null;
    }

    private static bool? ParseSuccessFlag(string json)
    {
        using var doc = JsonDocument.Parse(json);
        var root = doc.RootElement;

        if (TryReadSuccess(root, out var direct))
            return direct;

        foreach (var name in new[] { "transaction", "obj", "data" })
        {
            if (root.TryGetProperty(name, out var nested) && TryReadSuccess(nested, out var inner))
                return inner;
        }

        return null;
    }

    private static bool TryReadSuccess(JsonElement el, out bool success)
    {
        success = false;
        if (el.ValueKind is JsonValueKind.Undefined or JsonValueKind.Null)
            return false;

        if (el.TryGetProperty("success", out var s))
        {
            success = s.ValueKind == JsonValueKind.True
                      || string.Equals(s.ToString(), "true", StringComparison.OrdinalIgnoreCase);
            return true;
        }

        // Some inquiry payloads expose only pending / paid_at style fields.
        if (el.TryGetProperty("pending", out var pending))
        {
            var isPending = pending.ValueKind == JsonValueKind.True
                            || string.Equals(pending.ToString(), "true", StringComparison.OrdinalIgnoreCase);
            if (!isPending && el.TryGetProperty("error_occured", out var err))
            {
                var error = err.ValueKind == JsonValueKind.True
                            || string.Equals(err.ToString(), "true", StringComparison.OrdinalIgnoreCase);
                if (!error)
                {
                    success = true;
                    return true;
                }
            }
        }

        return false;
    }

    private static string Truncate(string value, int max)
        => string.IsNullOrEmpty(value) || value.Length <= max ? value : value[..max] + "...";
}
