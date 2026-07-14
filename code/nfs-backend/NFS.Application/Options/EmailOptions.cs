namespace NFS.Application.Options;

public class EmailOptions
{
    public const string SectionName = "Email";

    public string SmtpHost { get; set; } = string.Empty;
    public int SmtpPort { get; set; } = 587;
    public string SmtpUser { get; set; } = string.Empty;
    public string SmtpPass { get; set; } = string.Empty;
    public string FromAddress { get; set; } = string.Empty;
    public string FromName { get; set; } = "Nafs";
    /// <summary>When false, emails are skipped (logged as no-op).</summary>
    public bool Enabled { get; set; } = true;
    /// <summary>Send appointment reminders this many hours before the slot starts.</summary>
    public int ReminderHoursBefore { get; set; } = 24;
    /// <summary>How often the reminder background job runs (minutes).</summary>
    public int ReminderPollMinutes { get; set; } = 15;

    /// <summary>True when SMTP can authenticate (host + from + user + pass for providers like Gmail).</summary>
    public bool IsConfigured =>
        Enabled
        && !string.IsNullOrWhiteSpace(SmtpHost)
        && !string.IsNullOrWhiteSpace(FromAddress)
        && !string.IsNullOrWhiteSpace(SmtpUser)
        && !string.IsNullOrWhiteSpace(SmtpPass)
        && SmtpPort > 0;
}
