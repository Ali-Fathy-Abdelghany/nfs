namespace NFS.Application.Interfaces.Services;

public interface IEmailSender
{
    /// <summary>
    /// Sends an email. Soft-fails (logs + returns false) when SMTP is not configured or send fails.
    /// </summary>
    Task<bool> SendAsync(
        string toEmail,
        string subject,
        string htmlBody,
        string? plainTextBody = null,
        CancellationToken cancellationToken = default);

    bool IsEnabled { get; }
}
