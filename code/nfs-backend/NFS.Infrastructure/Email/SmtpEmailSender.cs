using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using MimeKit;
using NFS.Application.Interfaces.Services;
using NFS.Application.Options;

namespace NFS.Infrastructure.Email;

public class SmtpEmailSender : IEmailSender
{
    private readonly EmailOptions _options;
    private readonly ILogger<SmtpEmailSender> _logger;

    public SmtpEmailSender(IOptions<EmailOptions> options, ILogger<SmtpEmailSender> logger)
    {
        _options = options.Value;
        _logger = logger;
    }

    public bool IsEnabled => _options.IsConfigured;

    public async Task<bool> SendAsync(
        string toEmail,
        string subject,
        string htmlBody,
        string? plainTextBody = null,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(toEmail))
        {
            _logger.LogWarning("Email skipped: empty recipient. Subject={Subject}", subject);
            return false;
        }

        if (!_options.Enabled)
        {
            _logger.LogInformation(
                "Email disabled (Email__Enabled=false). Skipping send to {To}. Subject={Subject}",
                toEmail, subject);
            return false;
        }

        if (!_options.IsConfigured)
        {
            _logger.LogWarning(
                "Email SMTP not configured (set Email__SmtpHost, Email__FromAddress, etc.). Skipping send to {To}. Subject={Subject}",
                toEmail, subject);
            return false;
        }

        try
        {
            var message = new MimeMessage();
            message.From.Add(new MailboxAddress(
                string.IsNullOrWhiteSpace(_options.FromName) ? "Nafs" : _options.FromName,
                _options.FromAddress));
            message.To.Add(MailboxAddress.Parse(toEmail.Trim()));
            message.Subject = subject;

            var builder = new BodyBuilder
            {
                HtmlBody = htmlBody,
                TextBody = plainTextBody ?? StripRoughHtml(htmlBody)
            };
            message.Body = builder.ToMessageBody();

            using var client = new SmtpClient();
            var secure = _options.SmtpPort == 465
                ? SecureSocketOptions.SslOnConnect
                : SecureSocketOptions.StartTlsWhenAvailable;

            await client.ConnectAsync(_options.SmtpHost, _options.SmtpPort, secure, cancellationToken);

            if (!string.IsNullOrWhiteSpace(_options.SmtpUser))
            {
                await client.AuthenticateAsync(_options.SmtpUser, _options.SmtpPass ?? string.Empty, cancellationToken);
            }

            await client.SendAsync(message, cancellationToken);
            await client.DisconnectAsync(true, cancellationToken);

            _logger.LogInformation("Email sent to {To}. Subject={Subject}", toEmail, subject);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send email to {To}. Subject={Subject}", toEmail, subject);
            return false;
        }
    }

    private static string StripRoughHtml(string html)
    {
        if (string.IsNullOrEmpty(html)) return string.Empty;
        return System.Text.RegularExpressions.Regex
            .Replace(html, "<[^>]+>", " ")
            .Replace("&nbsp;", " ")
            .Trim();
    }
}
