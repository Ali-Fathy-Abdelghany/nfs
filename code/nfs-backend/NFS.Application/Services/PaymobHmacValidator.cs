using System.Globalization;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;

namespace NFS.Application.Services;

/// <summary>
/// Paymob transaction HMAC (SHA-512) for POST webhooks and GET redirect callbacks.
/// </summary>
public static class PaymobHmacValidator
{
    public static bool ValidateTransactionObject(JsonElement obj, string receivedHmac, string hmacSecret)
    {
        if (string.IsNullOrWhiteSpace(receivedHmac) || string.IsNullOrWhiteSpace(hmacSecret))
            return false;

        var orderId = GetNested(obj, "order", "id");
        var source = obj.TryGetProperty("source_data", out var sd) ? sd : default;

        var fields = new[]
        {
            Get(obj, "amount_cents"),
            Get(obj, "created_at"),
            Get(obj, "currency"),
            Get(obj, "error_occured"),
            Get(obj, "has_parent_transaction"),
            Get(obj, "id"),
            Get(obj, "integration_id"),
            Get(obj, "is_3d_secure"),
            Get(obj, "is_auth"),
            Get(obj, "is_capture"),
            Get(obj, "is_refunded"),
            Get(obj, "is_standalone_payment"),
            Get(obj, "is_voided"),
            orderId,
            Get(obj, "owner"),
            Get(obj, "pending"),
            Get(source, "pan"),
            Get(source, "sub_type"),
            Get(source, "type"),
            Get(obj, "success"),
        };

        return TimingSafeEquals(ComputeHmac(hmacSecret, string.Concat(fields)), receivedHmac);
    }

    public static bool ValidateRedirectQuery(IReadOnlyDictionary<string, string> query, string receivedHmac, string hmacSecret)
    {
        if (string.IsNullOrWhiteSpace(receivedHmac) || string.IsNullOrWhiteSpace(hmacSecret))
            return false;

        // Paymob may URL-encode spaces in created_at as '+' — try both raw and normalized.
        if (ValidateRedirectQueryCore(query, receivedHmac, hmacSecret, normalizePlusAsSpace: false))
            return true;
        return ValidateRedirectQueryCore(query, receivedHmac, hmacSecret, normalizePlusAsSpace: true);
    }

    private static bool ValidateRedirectQueryCore(
        IReadOnlyDictionary<string, string> query,
        string receivedHmac,
        string hmacSecret,
        bool normalizePlusAsSpace)
    {
        string Q(string key)
        {
            if (!query.TryGetValue(key, out var v) || v is null)
                return string.Empty;
            return normalizePlusAsSpace ? v.Replace('+', ' ') : v;
        }

        var fields = new[]
        {
            Q("amount_cents"),
            Q("created_at"),
            Q("currency"),
            Q("error_occured"),
            Q("has_parent_transaction"),
            Q("id"),
            Q("integration_id"),
            Q("is_3d_secure"),
            Q("is_auth"),
            Q("is_capture"),
            Q("is_refunded"),
            Q("is_standalone_payment"),
            Q("is_voided"),
            // Paymob redirect query uses "order"; some docs/examples use "order_id".
            FirstNonEmpty(Q("order"), Q("order_id")),
            Q("owner"),
            Q("pending"),
            Q("source_data.pan").Length > 0 ? Q("source_data.pan") : Q("source_data_pan"),
            Q("source_data.sub_type").Length > 0 ? Q("source_data.sub_type") : Q("source_data_sub_type"),
            Q("source_data.type").Length > 0 ? Q("source_data.type") : Q("source_data_type"),
            Q("success"),
        };

        return TimingSafeEquals(ComputeHmac(hmacSecret, string.Concat(fields)), receivedHmac);
    }

    public static string ComputeHmac(string secret, string payload)
    {
        using var hmac = new HMACSHA512(Encoding.UTF8.GetBytes(secret));
        var hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(payload));
        return Convert.ToHexString(hash).ToLowerInvariant();
    }

    private static string FirstNonEmpty(params string[] values)
    {
        foreach (var v in values)
        {
            if (!string.IsNullOrEmpty(v))
                return v;
        }
        return string.Empty;
    }

    private static bool TimingSafeEquals(string a, string b)
    {
        var left = Encoding.UTF8.GetBytes(a.ToLowerInvariant());
        var right = Encoding.UTF8.GetBytes(b.ToLowerInvariant());
        if (left.Length != right.Length)
            return false;
        return CryptographicOperations.FixedTimeEquals(left, right);
    }

    private static string Get(JsonElement el, string name)
    {
        if (el.ValueKind is JsonValueKind.Undefined or JsonValueKind.Null)
            return string.Empty;
        if (!el.TryGetProperty(name, out var prop))
            return string.Empty;

        return prop.ValueKind switch
        {
            JsonValueKind.True => "true",
            JsonValueKind.False => "false",
            JsonValueKind.Number => prop.TryGetInt64(out var l)
                ? l.ToString(CultureInfo.InvariantCulture)
                : prop.GetRawText(),
            JsonValueKind.String => prop.GetString() ?? string.Empty,
            _ => prop.ToString()
        };
    }

    private static string GetNested(JsonElement el, string parent, string child)
    {
        if (el.ValueKind is JsonValueKind.Undefined or JsonValueKind.Null)
            return string.Empty;
        if (!el.TryGetProperty(parent, out var p))
            return string.Empty;
        return Get(p, child);
    }
}
