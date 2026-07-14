using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using NFS.Application.Interfaces.Services;
using NFS.Infrastructure.Data;

namespace NFS.Infrastructure.Email;

/// <summary>
/// Background poller: every N minutes, email patients whose Confirmed appointments
/// start within ReminderHoursBefore and have not been reminded yet (ReminderSentAt).
/// Run the API (or host) continuously; poll interval defaults to 15 minutes.
/// </summary>
public class AppointmentReminderHostedService : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<AppointmentReminderHostedService> _logger;

    public AppointmentReminderHostedService(
        IServiceScopeFactory scopeFactory,
        ILogger<AppointmentReminderHostedService> logger)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("Appointment reminder service started.");

        try { await Task.Delay(TimeSpan.FromSeconds(20), stoppingToken); }
        catch (OperationCanceledException) { return; }

        while (!stoppingToken.IsCancellationRequested)
        {
            var delayMinutes = 15;
            try
            {
                delayMinutes = await ProcessRemindersAsync(stoppingToken);
            }
            catch (Exception ex) when (ex is not OperationCanceledException)
            {
                _logger.LogError(ex, "Appointment reminder sweep failed.");
            }

            try
            {
                await Task.Delay(TimeSpan.FromMinutes(delayMinutes), stoppingToken);
            }
            catch (OperationCanceledException)
            {
                break;
            }
        }
    }

    private async Task<int> ProcessRemindersAsync(CancellationToken ct)
    {
        using var scope = _scopeFactory.CreateScope();
        var notifications = scope.ServiceProvider.GetRequiredService<IEmailNotificationService>();
        var emailSender = scope.ServiceProvider.GetRequiredService<IEmailSender>();
        var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        var hours = notifications.ReminderHoursBefore;
        var pollMinutes = notifications.ReminderPollMinutes;
        var now = DateTime.UtcNow;
        var windowEnd = now.AddHours(hours);

        var candidates = await db.Appointments
            .Include(a => a.AvailabilitySlot)
            .Include(a => a.Patient)!.ThenInclude(p => p!.User)
            .Include(a => a.Therapist)!.ThenInclude(t => t!.User)
            .Where(a =>
                a.ReminderSentAt == null
                && a.AvailabilitySlot != null
                && (a.Status == "Confirmed" || a.Status == "confirmed")
                && a.AvailabilitySlot.StartTime >= now
                && a.AvailabilitySlot.StartTime <= windowEnd)
            .ToListAsync(ct);

        if (candidates.Count == 0)
        {
            _logger.LogDebug("No appointment reminders due (window={Hours}h).", hours);
            return pollMinutes;
        }

        _logger.LogInformation("Sending up to {Count} appointment reminders.", candidates.Count);

        foreach (var appt in candidates)
        {
            ct.ThrowIfCancellationRequested();
            var email = appt.Patient?.User?.Email;
            if (string.IsNullOrWhiteSpace(email))
            {
                appt.ReminderSentAt = DateTime.UtcNow;
                continue;
            }

            var patientName = $"{appt.Patient?.User?.FirstName} {appt.Patient?.User?.LastName}".Trim();
            var doctorName = $"{appt.Therapist?.User?.FirstName} {appt.Therapist?.User?.LastName}".Trim();
            var start = appt.AvailabilitySlot!.StartTime;

            var sent = await notifications.SendAppointmentReminderAsync(
                email, patientName, start, doctorName, ct);

            // On success, or when email is disabled (dev), mark reminded to avoid infinite retries
            if (sent || !emailSender.IsEnabled)
                appt.ReminderSentAt = DateTime.UtcNow;
        }

        await db.SaveChangesAsync(ct);
        return pollMinutes;
    }
}
