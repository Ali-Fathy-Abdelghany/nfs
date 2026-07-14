namespace NFS.Application.Options;

public class PaymobOptions
{
    public const string SectionName = "Paymob";

    public string SecretKey { get; set; } = string.Empty;
    public string PublicKey { get; set; } = string.Empty;
    public string ApiKey { get; set; } = string.Empty;
    public string Hmac { get; set; } = string.Empty;
    public string IntegrationId { get; set; } = string.Empty;
    public string BaseUrl { get; set; } = "https://accept.paymob.com";
    /// <summary>Public base URL of this API (ngrok/tunnel in local dev) for Paymob webhooks.</summary>
    public string CallbackBaseUrl { get; set; } = string.Empty;
    /// <summary>Frontend origin used after Paymob redirects back.</summary>
    public string FrontendBaseUrl { get; set; } = "http://localhost:5173";

    public bool IsConfigured =>
        !string.IsNullOrWhiteSpace(SecretKey)
        && !string.IsNullOrWhiteSpace(PublicKey)
        && !string.IsNullOrWhiteSpace(IntegrationId)
        && !string.IsNullOrWhiteSpace(Hmac);
}
