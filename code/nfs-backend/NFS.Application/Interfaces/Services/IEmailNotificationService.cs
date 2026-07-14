namespace NFS.Application.Interfaces.Services;

public interface IEmailNotificationService
{
    Task<bool> SendTherapistAcceptedAsync(string toEmail, string firstName, CancellationToken ct = default);
    Task<bool> SendTherapistRejectedAsync(string toEmail, string firstName, string? reason, CancellationToken ct = default);
    Task<bool> SendPasswordResetAsync(string toEmail, string resetToken, CancellationToken ct = default);
    Task<bool> SendAppointmentReminderAsync(
        string toEmail,
        string recipientName,
        DateTime startUtc,
        string? doctorName,
        CancellationToken ct = default);

    int ReminderHoursBefore { get; }
    int ReminderPollMinutes { get; }
}
