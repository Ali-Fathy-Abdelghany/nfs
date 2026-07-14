using System.Text.Json;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using NFS.Application.DTOs;
using NFS.Application.Interfaces.Services;
using NFS.Application.Options;
using NFS.Application.Services;
using NFS.Domain.Entities;
using NFS.Infrastructure.Data;

namespace NFS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PaymentsController : ControllerBase
{
    private readonly ApplicationDbContext _db;
    private readonly IPaymentGateway _gateway;
    private readonly PaymobOptions _paymob;
    private readonly ILogger<PaymentsController> _logger;

    public PaymentsController(
        ApplicationDbContext db,
        IPaymentGateway gateway,
        IOptions<PaymobOptions> paymob,
        ILogger<PaymentsController> logger)
    {
        _db = db;
        _gateway = gateway;
        _paymob = paymob.Value;
        _logger = logger;
    }

    [HttpPost("create")]
    public async Task<IActionResult> Create([FromBody] CreatePaymentDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var patientExists = await _db.Patients.AnyAsync(p => p.PatientId == dto.PatientId);
        if (!patientExists)
            return BadRequest(new { message = "Patient not found" });

        decimal amount = dto.Amount ?? 0;
        if (amount <= 0 && dto.DoctorId.HasValue)
        {
            var therapist = await _db.Therapists.FindAsync(dto.DoctorId.Value);
            if (therapist == null)
                return BadRequest(new { message = "Doctor not found" });
            amount = therapist.HourlyRate;
        }

        if (amount <= 0)
            return BadRequest(new { message = "Amount is required (or provide DoctorId with hourly rate)" });

        if (dto.AppointmentId.HasValue)
        {
            var appointmentExists = await _db.Appointments.AnyAsync(a => a.Id == dto.AppointmentId.Value);
            if (!appointmentExists)
                return BadRequest(new { message = "Appointment not found" });
        }

        var isMonthly = string.Equals(dto.PlanType, "monthly", StringComparison.OrdinalIgnoreCase);
        var additionalSlotIds = (dto.AdditionalSlotIds ?? new List<int>())
            .Where(id => id > 0)
            .Distinct()
            .ToList();

        if (isMonthly)
        {
            if (additionalSlotIds.Count != 3)
                return BadRequest(new { message = "باقة الأربع جلسات تتطلب اختيار ٣ مواعيد إضافية" });
            if (!dto.DoctorId.HasValue)
                return BadRequest(new { message = "DoctorId is required for bundle payments" });
        }
        else if (additionalSlotIds.Count > 0)
        {
            return BadRequest(new { message = "AdditionalSlotIds are only allowed for monthly plan" });
        }

        var usePaymob = _paymob.IsConfigured && _gateway is PaymobPaymentGateway;
        var payment = new Payment
        {
            PatientId = dto.PatientId,
            DoctorId = dto.DoctorId,
            AppointmentId = dto.AppointmentId,
            Amount = amount,
            Currency = string.IsNullOrWhiteSpace(dto.Currency) ? "EGP" : dto.Currency.Trim().ToUpperInvariant(),
            Status = "Pending",
            Provider = usePaymob ? "Paymob" : "FakeGateway",
            PlanType = dto.PlanType,
            CreatedAt = DateTime.UtcNow
        };

        if (isMonthly)
        {
            try
            {
                var extraAppointmentIds = await CreateBundleAppointmentsAsync(
                    dto.PatientId,
                    dto.DoctorId!.Value,
                    additionalSlotIds,
                    dto.AppointmentId);
                payment.ExtraAppointmentIds = string.Join(",", extraAppointmentIds);
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { message = ex.Message });
            }
        }

        _db.Payments.Add(payment);
        await _db.SaveChangesAsync();

        try
        {
            var session = await _gateway.CreateCheckoutSessionAsync(payment.Amount, payment.Currency, payment.Id);
            payment.ProviderReference = session.ProviderReference;
            payment.CheckoutUrl = session.CheckoutUrl;
            await _db.SaveChangesAsync();
            return Ok(MapToDto(payment, session.ClientSecret, session.PublicKey));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to create checkout session for payment {PaymentId}", payment.Id);
            payment.Status = "Failed";
            await _db.SaveChangesAsync();
            return BadRequest(new { message = "Failed to create payment session", detail = ex.Message });
        }
    }

    [HttpPost("{id}/confirm")]
    public async Task<IActionResult> Confirm(int id, [FromBody] ConfirmPaymentDto? dto)
    {
        var payment = await _db.Payments.FindAsync(id);
        if (payment == null)
            return NotFound(new { message = "Payment not found" });

        if (string.Equals(payment.Status, "Paid", StringComparison.OrdinalIgnoreCase))
        {
            // Idempotent: still confirm/link appointment if an older Paid row never did.
            await MarkPaidAsync(payment);
            return Ok(MapToDto(payment));
        }

        // Paymob: use verify endpoint / return / webhook — never trust client confirm alone.
        if (string.Equals(payment.Provider, "Paymob", StringComparison.OrdinalIgnoreCase))
        {
            return BadRequest(new
            {
                message = "Paymob payments must be verified via return/webhook or POST /api/payments/{id}/verify."
            });
        }

        if (string.IsNullOrWhiteSpace(payment.ProviderReference))
            return BadRequest(new { message = "Payment has no provider reference" });

        var ok = await _gateway.ConfirmPaymentAsync(payment.ProviderReference);
        if (!ok)
            return BadRequest(new { message = "Gateway confirmation failed" });

        await MarkPaidAsync(payment);
        return Ok(MapToDto(payment));
    }

    /// <summary>
    /// Sync payment status from Paymob (transaction inquiry). Used after browser return when webhook may be delayed/unreachable.
    /// </summary>
    [HttpPost("{id:int}/verify")]
    public async Task<IActionResult> Verify(int id, [FromBody] VerifyPaymentDto? dto)
    {
        var payment = await _db.Payments.FindAsync(id);
        if (payment == null)
            return NotFound(new { message = "Payment not found" });

        if (string.Equals(payment.Status, "Paid", StringComparison.OrdinalIgnoreCase))
        {
            await MarkPaidAsync(payment);
            return Ok(MapToDto(payment));
        }

        if (!string.Equals(payment.Provider, "Paymob", StringComparison.OrdinalIgnoreCase))
            return Ok(MapToDto(payment));

        var merchantOrderId = $"nfs_payment_{payment.Id}";
        _logger.LogInformation(
            "Paymob verify requested for payment {PaymentId} ref={Ref} merchant={Merchant} tx={Tx}",
            payment.Id, payment.ProviderReference, merchantOrderId, dto?.TransactionId);

        var verified = await _gateway.VerifyWithProviderAsync(
            payment.ProviderReference,
            merchantOrderId,
            dto?.TransactionId);

        if (verified == true)
        {
            await MarkPaidAsync(payment);
            _logger.LogInformation("Paymob verify marked payment {PaymentId} Paid (appointmentId={AppointmentId})",
                payment.Id, payment.AppointmentId);
            return Ok(MapToDto(payment));
        }

        if (verified == false && !string.Equals(payment.Status, "Paid", StringComparison.OrdinalIgnoreCase))
        {
            payment.Status = "Failed";
            await _db.SaveChangesAsync();
            _logger.LogWarning("Paymob verify marked payment {PaymentId} Failed", payment.Id);
        }
        else
        {
            _logger.LogWarning(
                "Paymob verify inconclusive for payment {PaymentId}; status remains {Status}",
                payment.Id, payment.Status);
        }

        return Ok(MapToDto(payment));
    }

    /// <summary>Paymob server-to-server TRANSACTION callback (HMAC in query string).</summary>
    [AllowAnonymous]
    [HttpPost("paymob/webhook")]
    public async Task<IActionResult> PaymobWebhook([FromQuery] string? hmac)
    {
        if (!_paymob.IsConfigured)
            return StatusCode(503, new { message = "Paymob is not configured" });

        using var doc = await JsonDocument.ParseAsync(Request.Body);
        if (!doc.RootElement.TryGetProperty("obj", out var obj))
            return BadRequest(new { message = "Missing obj" });

        if (!PaymobHmacValidator.ValidateTransactionObject(obj, hmac ?? string.Empty, _paymob.Hmac))
        {
            _logger.LogWarning("Paymob webhook rejected: invalid HMAC");
            return Unauthorized(new { message = "Invalid HMAC" });
        }

        var success = obj.TryGetProperty("success", out var s) &&
                      (s.ValueKind == JsonValueKind.True ||
                       string.Equals(s.ToString(), "true", StringComparison.OrdinalIgnoreCase));

        var payment = await FindPaymentFromPaymobObjectAsync(obj);
        if (payment == null)
        {
            _logger.LogWarning("Paymob webhook: payment not found for payload");
            return Ok(new { received = true, matched = false });
        }

        if (success)
            await MarkPaidAsync(payment);
        else if (!string.Equals(payment.Status, "Paid", StringComparison.OrdinalIgnoreCase))
        {
            payment.Status = "Failed";
            await _db.SaveChangesAsync();
        }

        return Ok(new { received = true, paymentId = payment.Id, status = payment.Status });
    }

    /// <summary>
    /// Paymob browser redirect after checkout.
    /// Confirms via HMAC when present; otherwise inquiries Paymob by transaction/order id so localhost works without webhook.
    /// </summary>
    [AllowAnonymous]
    [HttpGet("paymob/return")]
    public async Task<IActionResult> PaymobReturn([FromQuery] int? paymentId, [FromQuery] string? hmac)
    {
        var frontend = (_paymob.FrontendBaseUrl ?? "http://localhost:5173").TrimEnd('/');
        var query = Request.Query.ToDictionary(
            kv => kv.Key,
            kv => kv.Value.ToString(),
            StringComparer.OrdinalIgnoreCase);

        var hmacOk = !string.IsNullOrWhiteSpace(hmac)
                     && PaymobHmacValidator.ValidateRedirectQuery(query, hmac, _paymob.Hmac);

        var success = string.Equals(Request.Query["success"].ToString(), "true", StringComparison.OrdinalIgnoreCase);
        var transactionId = FirstQuery(query, "id", "transaction_id");

        Payment? payment = null;
        if (paymentId.HasValue)
            payment = await _db.Payments.FindAsync(paymentId.Value);

        if (payment == null && query.TryGetValue("merchant_order_id", out var merchantRef))
            payment = await FindBySpecialReferenceAsync(merchantRef);

        if (payment == null && query.TryGetValue("order", out var orderRef))
            payment = await _db.Payments.FirstOrDefaultAsync(p => p.ProviderReference == orderRef);
        if (payment == null && query.TryGetValue("order_id", out var orderIdRef))
            payment = await _db.Payments.FirstOrDefaultAsync(p => p.ProviderReference == orderIdRef);

        if (payment != null)
        {
            if (string.Equals(payment.Status, "Paid", StringComparison.OrdinalIgnoreCase))
            {
                // Already Paid (e.g. webhook) — still ensure appointment is Confirmed.
                await MarkPaidAsync(payment);
            }
            else if (hmacOk && success)
            {
                _logger.LogInformation("Paymob return: HMAC ok + success for payment {PaymentId}", payment.Id);
                await MarkPaidAsync(payment);
            }
            else if (success || !string.IsNullOrWhiteSpace(transactionId))
            {
                // Do not trust success alone — inquire Paymob when HMAC is missing/invalid (common on local without perfect query encoding).
                var merchantOrderId = $"nfs_payment_{payment.Id}";
                _logger.LogInformation(
                    "Paymob return: HMAC={HmacOk} success={Success}; verifying payment {PaymentId} tx={Tx}",
                    hmacOk, success, payment.Id, transactionId);

                var verified = await _gateway.VerifyWithProviderAsync(
                    payment.ProviderReference,
                    merchantOrderId,
                    string.IsNullOrWhiteSpace(transactionId) ? null : transactionId);

                if (verified == true)
                    await MarkPaidAsync(payment);
                else if (verified == false)
                {
                    payment.Status = "Failed";
                    await _db.SaveChangesAsync();
                }
                else if (!hmacOk)
                {
                    _logger.LogWarning(
                        "Paymob return: HMAC invalid/missing and inquiry inconclusive for payment {PaymentId}, success={Success}, tx={Tx}",
                        payment.Id, success, transactionId);
                }
            }
            else if (!hmacOk)
            {
                _logger.LogWarning("Paymob return: HMAC invalid/missing for payment {PaymentId}", payment.Id);
            }
        }

        var idPart = payment?.Id.ToString() ?? paymentId?.ToString() ?? string.Empty;
        var paidFlag = payment != null && string.Equals(payment.Status, "Paid", StringComparison.OrdinalIgnoreCase) ? "1" : "0";
        var txPart = string.IsNullOrWhiteSpace(transactionId) ? string.Empty : $"&tx={Uri.EscapeDataString(transactionId)}";
        var redirect = $"{frontend}/payments?paymentId={Uri.EscapeDataString(idPart)}&paid={paidFlag}{txPart}";
        return Redirect(redirect);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var payment = await _db.Payments.FindAsync(id);
        if (payment == null)
            return NotFound(new { message = "Payment not found" });

        if (string.Equals(payment.Status, "Paid", StringComparison.OrdinalIgnoreCase))
            await MarkPaidAsync(payment);

        return Ok(MapToDto(payment));
    }

    [HttpGet("patient/{patientId:int}")]
    public async Task<IActionResult> GetByPatient(int patientId)
    {
        var payments = await _db.Payments
            .Where(p => p.PatientId == patientId)
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync();

        return Ok(payments.Select(p => MapToDto(p)));
    }

    private async Task MarkPaidAsync(Payment payment)
    {
        if (string.Equals(payment.Status, "Paid", StringComparison.OrdinalIgnoreCase))
        {
            await EnsureAppointmentConfirmedAsync(payment);
            await _db.SaveChangesAsync();
            return;
        }

        payment.Status = "Paid";
        payment.PaidAt = DateTime.UtcNow;
        await EnsureAppointmentConfirmedAsync(payment);
        await _db.SaveChangesAsync();
    }

    /// <summary>
    /// Paid checkouts auto-confirm the linked appointment (no doctor accept/reject).
    /// If appointmentId was not stored on the payment (legacy booking flow), link the
    /// patient's latest Pending appointment for the same doctor.
    /// </summary>
    private async Task EnsureAppointmentConfirmedAsync(Payment payment)
    {
        Appointment? appointment = null;

        if (payment.AppointmentId.HasValue)
            appointment = await _db.Appointments.FindAsync(payment.AppointmentId.Value);

        if (appointment == null && payment.DoctorId.HasValue)
        {
            appointment = await _db.Appointments
                .Where(a => a.PatientId == payment.PatientId
                            && a.DoctorId == payment.DoctorId.Value
                            && a.Status != "Cancelled"
                            && a.Status != "Completed")
                .OrderByDescending(a => a.CreatedAt)
                .FirstOrDefaultAsync();

            if (appointment != null)
            {
                payment.AppointmentId = appointment.Id;
                _logger.LogInformation(
                    "Linked payment {PaymentId} to appointment {AppointmentId} (patient={PatientId}, doctor={DoctorId})",
                    payment.Id, appointment.Id, payment.PatientId, payment.DoctorId);
            }
        }

        if (appointment == null)
        {
            _logger.LogWarning(
                "Payment {PaymentId} marked Paid but no appointment to confirm (patient={PatientId}, doctor={DoctorId})",
                payment.Id, payment.PatientId, payment.DoctorId);
            return;
        }

        if (!string.Equals(appointment.Status, "Cancelled", StringComparison.OrdinalIgnoreCase)
            && !string.Equals(appointment.Status, "Completed", StringComparison.OrdinalIgnoreCase))
        {
            appointment.Status = "Confirmed";
            _logger.LogInformation(
                "Auto-confirmed appointment {AppointmentId} after payment {PaymentId}",
                appointment.Id, payment.Id);
        }

        await ConfirmExtraAppointmentsAsync(payment);
    }

    private async Task ConfirmExtraAppointmentsAsync(Payment payment)
    {
        if (string.IsNullOrWhiteSpace(payment.ExtraAppointmentIds))
            return;

        var ids = payment.ExtraAppointmentIds
            .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
            .Select(s => int.TryParse(s, out var id) ? id : 0)
            .Where(id => id > 0)
            .Distinct()
            .ToList();

        if (ids.Count == 0) return;

        var extras = await _db.Appointments.Where(a => ids.Contains(a.Id)).ToListAsync();
        foreach (var extra in extras)
        {
            if (string.Equals(extra.Status, "Cancelled", StringComparison.OrdinalIgnoreCase)
                || string.Equals(extra.Status, "Completed", StringComparison.OrdinalIgnoreCase))
                continue;

            extra.Status = "Confirmed";
            _logger.LogInformation(
                "Auto-confirmed bundle appointment {AppointmentId} after payment {PaymentId}",
                extra.Id, payment.Id);
        }
    }

    private async Task<List<int>> CreateBundleAppointmentsAsync(
        int patientId,
        int doctorId,
        List<int> slotIds,
        int? primaryAppointmentId)
    {
        int? primarySlotId = null;
        if (primaryAppointmentId.HasValue)
        {
            var primary = await _db.Appointments.FindAsync(primaryAppointmentId.Value);
            primarySlotId = primary?.SlotId;
        }

        var slots = new List<AvailabilitySlot>();
        foreach (var slotId in slotIds)
        {
            if (primarySlotId.HasValue && slotId == primarySlotId.Value)
                throw new InvalidOperationException("لا يمكن اختيار نفس موعد الجلسة الأولى مرة أخرى");

            var slot = await _db.AvailabilitySlots.FindAsync(slotId)
                ?? throw new InvalidOperationException("أحد المواعيد المختارة غير موجود");

            if (slot.DoctorId != doctorId)
                throw new InvalidOperationException("الموعد لا يتبع هذا الطبيب");

            if (slot.IsBooked)
                throw new InvalidOperationException("أحد المواعيد أصبح محجوزاً، اختر مواعيد أخرى");

            var overlapping = await _db.Appointments
                .Include(a => a.AvailabilitySlot)
                .AnyAsync(a =>
                    a.DoctorId == doctorId
                    && a.Status != "Cancelled"
                    && a.AvailabilitySlot != null
                    && a.AvailabilitySlot.StartTime < slot.EndTime
                    && a.AvailabilitySlot.EndTime > slot.StartTime);

            if (overlapping)
                throw new InvalidOperationException("يوجد تداخل مع موعد آخر للطبيب");

            // Disallow overlap between selected bundle slots themselves
            foreach (var other in slots)
            {
                if (slot.StartTime < other.EndTime && slot.EndTime > other.StartTime)
                    throw new InvalidOperationException("المواعيد الإضافية متداخلة مع بعضها");
            }

            slots.Add(slot);
        }

        var createdIds = new List<int>();
        foreach (var slot in slots)
        {
            var appointment = new Appointment
            {
                PatientId = patientId,
                DoctorId = doctorId,
                SlotId = slot.Id,
                Status = "Pending",
                CreatedAt = DateTime.UtcNow
            };
            _db.Appointments.Add(appointment);
            slot.IsBooked = true;
            await _db.SaveChangesAsync();
            createdIds.Add(appointment.Id);
        }

        return createdIds;
    }

    private async Task<Payment?> FindPaymentFromPaymobObjectAsync(JsonElement obj)
    {
        string? merchantOrderId = null;
        if (obj.TryGetProperty("order", out var order))
        {
            if (order.TryGetProperty("merchant_order_id", out var m))
                merchantOrderId = m.GetString() ?? m.ToString();
            else if (order.TryGetProperty("id", out var oid))
            {
                var byRef = await _db.Payments.FirstOrDefaultAsync(p =>
                    p.ProviderReference == oid.ToString());
                if (byRef != null)
                    return byRef;
            }
        }

        if (!string.IsNullOrWhiteSpace(merchantOrderId))
        {
            var bySpecial = await FindBySpecialReferenceAsync(merchantOrderId);
            if (bySpecial != null)
                return bySpecial;
        }

        if (obj.TryGetProperty("merchant_order_id", out var topMerchant))
        {
            var byTop = await FindBySpecialReferenceAsync(topMerchant.GetString() ?? topMerchant.ToString());
            if (byTop != null)
                return byTop;
        }

        return null;
    }

    private async Task<Payment?> FindBySpecialReferenceAsync(string? specialReference)
    {
        if (string.IsNullOrWhiteSpace(specialReference))
            return null;

        if (specialReference.StartsWith("nfs_payment_", StringComparison.OrdinalIgnoreCase)
            && int.TryParse(specialReference["nfs_payment_".Length..], out var id))
        {
            return await _db.Payments.FindAsync(id);
        }

        if (int.TryParse(specialReference, out var plainId))
            return await _db.Payments.FindAsync(plainId);

        return await _db.Payments.FirstOrDefaultAsync(p => p.ProviderReference == specialReference);
    }

    private static string? FirstQuery(IReadOnlyDictionary<string, string> query, params string[] keys)
    {
        foreach (var key in keys)
        {
            if (query.TryGetValue(key, out var v) && !string.IsNullOrWhiteSpace(v))
                return v;
        }
        return null;
    }

    private static PaymentDto MapToDto(Payment p, string? clientSecret = null, string? publicKey = null) => new()
    {
        Id = p.Id,
        AppointmentId = p.AppointmentId,
        PatientId = p.PatientId,
        DoctorId = p.DoctorId,
        Amount = p.Amount,
        Currency = p.Currency,
        Status = p.Status,
        Provider = p.Provider,
        ProviderReference = p.ProviderReference,
        CheckoutUrl = p.CheckoutUrl,
        ClientSecret = clientSecret,
        PublicKey = publicKey,
        PlanType = p.PlanType,
        CreatedAt = p.CreatedAt,
        PaidAt = p.PaidAt
    };
}
