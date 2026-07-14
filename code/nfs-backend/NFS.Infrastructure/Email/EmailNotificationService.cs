using System.Net;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using NFS.Application.Interfaces.Services;
using NFS.Application.Options;

namespace NFS.Infrastructure.Email;

/// <summary>Builds Arabic/English notification emails for Nafs.</summary>
public class EmailNotificationService : IEmailNotificationService
{
    private readonly IEmailSender _emailSender;
    private readonly EmailOptions _emailOptions;
    private readonly string _frontendBaseUrl;
    private readonly ILogger<EmailNotificationService> _logger;

    public EmailNotificationService(
        IEmailSender emailSender,
        IOptions<EmailOptions> emailOptions,
        IConfiguration configuration,
        ILogger<EmailNotificationService> logger)
    {
        _emailSender = emailSender;
        _emailOptions = emailOptions.Value;
        _frontendBaseUrl = (configuration["FRONTEND_BASE_URL"]
            ?? configuration["Paymob:FrontendBaseUrl"]
            ?? "http://localhost:5173").TrimEnd('/');
        _logger = logger;
    }

    public Task<bool> SendTherapistAcceptedAsync(string toEmail, string firstName, CancellationToken ct = default)
    {
        var name = string.IsNullOrWhiteSpace(firstName) ? "الطبيب" : firstName;
        var subject = "نفس — تم قبول طلب انضمامك";
        var html = $"""
            <div dir="rtl" style="font-family:Tahoma,Arial,sans-serif;line-height:1.7;color:#181C1D">
              <h2 style="color:#2A5C58">مرحباً د. {WebUtility.HtmlEncode(name)}</h2>
              <p>يسعدنا إبلاغك بأن طلب انضمامك كمعالج/طبيب على منصة <strong>نفس</strong> قد تم <strong>قبوله</strong>.</p>
              <p>يمكنك الآن تسجيل الدخول والبدء في استقبال المواعيد.</p>
              <p><a href="{_frontendBaseUrl}/login" style="color:#316764">تسجيل الدخول</a></p>
              <p style="color:#707978;font-size:12px">فريق نفس</p>
            </div>
            """;
        return _emailSender.SendAsync(toEmail, subject, html, cancellationToken: ct);
    }

    public Task<bool> SendTherapistRejectedAsync(
        string toEmail,
        string firstName,
        string? reason,
        CancellationToken ct = default)
    {
        var name = string.IsNullOrWhiteSpace(firstName) ? "الطبيب" : firstName;
        var reasonBlock = string.IsNullOrWhiteSpace(reason)
            ? "<p>لم يتم ذكر سبب تفصيلي. يمكنك التواصل مع الإدارة للمزيد من المعلومات.</p>"
            : $"<p><strong>السبب:</strong> {WebUtility.HtmlEncode(reason.Trim())}</p>";

        var subject = "نفس — تحديث طلب الانضمام";
        var html = $"""
            <div dir="rtl" style="font-family:Tahoma,Arial,sans-serif;line-height:1.7;color:#181C1D">
              <h2 style="color:#2A5C58">مرحباً د. {WebUtility.HtmlEncode(name)}</h2>
              <p>نأسف لإبلاغك بأن طلب انضمامك على منصة <strong>نفس</strong> لم يتم قبوله حالياً.</p>
              {reasonBlock}
              <p>يمكنك تصحيح البيانات وإعادة تقديم الطلب لاحقاً إن أمكن.</p>
              <p style="color:#707978;font-size:12px">فريق نفس</p>
            </div>
            """;
        return _emailSender.SendAsync(toEmail, subject, html, cancellationToken: ct);
    }

    public Task<bool> SendPasswordResetAsync(string toEmail, string resetToken, CancellationToken ct = default)
    {
        var link = $"{_frontendBaseUrl}/reset-password?token={Uri.EscapeDataString(resetToken)}";
        var subject = "نفس — إعادة تعيين كلمة المرور";
        var html = $"""
            <div dir="rtl" style="font-family:Tahoma,Arial,sans-serif;line-height:1.7;color:#181C1D">
              <h2 style="color:#2A5C58">إعادة تعيين كلمة المرور</h2>
              <p>استلمنا طلباً لإعادة تعيين كلمة المرور لحسابك على منصة <strong>نفس</strong>.</p>
              <p>اضغط على الرابط التالي (صالح لمدة 15 دقيقة):</p>
              <p><a href="{link}" style="color:#316764;font-weight:bold">تعيين كلمة مرور جديدة</a></p>
              <p style="color:#707978;font-size:12px;word-break:break-all">{WebUtility.HtmlEncode(link)}</p>
              <p style="color:#707978;font-size:12px">إذا لم تطلب ذلك، تجاهل هذه الرسالة.</p>
            </div>
            """;
        return _emailSender.SendAsync(toEmail, subject, html, cancellationToken: ct);
    }

    public Task<bool> SendAppointmentReminderAsync(
        string toEmail,
        string recipientName,
        DateTime startUtc,
        string? doctorName,
        CancellationToken ct = default)
    {
        var localHint = startUtc.ToString("yyyy-MM-dd HH:mm") + " UTC";
        var who = string.IsNullOrWhiteSpace(doctorName) ? "موعدك" : $"موعدك مع د. {doctorName}";
        var subject = "نفس — تذكير بموعد قادم";
        var html = $"""
            <div dir="rtl" style="font-family:Tahoma,Arial,sans-serif;line-height:1.7;color:#181C1D">
              <h2 style="color:#2A5C58">تذكير بالموعد</h2>
              <p>مرحباً {WebUtility.HtmlEncode(recipientName ?? "")}</p>
              <p>هذا تذكير بأن <strong>{WebUtility.HtmlEncode(who)}</strong> قريب.</p>
              <p><strong>الوقت:</strong> {WebUtility.HtmlEncode(localHint)}</p>
              <p><a href="{_frontendBaseUrl}/sessions" style="color:#316764">عرض الجلسات</a></p>
              <p style="color:#707978;font-size:12px">فريق نفس</p>
            </div>
            """;
        return _emailSender.SendAsync(toEmail, subject, html, cancellationToken: ct);
    }

    public int ReminderHoursBefore => Math.Clamp(_emailOptions.ReminderHoursBefore, 1, 168);
    public int ReminderPollMinutes => Math.Clamp(_emailOptions.ReminderPollMinutes, 5, 120);
}
