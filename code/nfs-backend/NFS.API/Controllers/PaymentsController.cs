using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NFS.Application.DTOs;
using NFS.Application.Interfaces.Services;
using NFS.Domain.Entities;
using NFS.Infrastructure.Data;

namespace NFS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PaymentsController : ControllerBase
{
    private readonly ApplicationDbContext _db;
    private readonly IPaymentGateway _gateway;

    public PaymentsController(ApplicationDbContext db, IPaymentGateway gateway)
    {
        _db = db;
        _gateway = gateway;
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

        var payment = new Payment
        {
            PatientId = dto.PatientId,
            DoctorId = dto.DoctorId,
            AppointmentId = dto.AppointmentId,
            Amount = amount,
            Currency = string.IsNullOrWhiteSpace(dto.Currency) ? "EGP" : dto.Currency.Trim().ToUpperInvariant(),
            Status = "Pending",
            Provider = "FakeGateway",
            PlanType = dto.PlanType,
            CreatedAt = DateTime.UtcNow
        };

        _db.Payments.Add(payment);
        await _db.SaveChangesAsync();

        var session = await _gateway.CreateCheckoutSessionAsync(payment.Amount, payment.Currency, payment.Id);
        payment.ProviderReference = session.ProviderReference;
        payment.CheckoutUrl = session.CheckoutUrl;
        await _db.SaveChangesAsync();

        return Ok(MapToDto(payment));
    }

    [HttpPost("{id}/confirm")]
    public async Task<IActionResult> Confirm(int id, [FromBody] ConfirmPaymentDto? dto)
    {
        var payment = await _db.Payments.FindAsync(id);
        if (payment == null)
            return NotFound(new { message = "Payment not found" });

        if (string.Equals(payment.Status, "Paid", StringComparison.OrdinalIgnoreCase))
            return Ok(MapToDto(payment));

        if (string.IsNullOrWhiteSpace(payment.ProviderReference))
            return BadRequest(new { message = "Payment has no provider reference" });

        var ok = await _gateway.ConfirmPaymentAsync(payment.ProviderReference);
        if (!ok)
            return BadRequest(new { message = "Gateway confirmation failed" });

        payment.Status = "Paid";
        payment.PaidAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        // Mark related appointment confirmed when present
        if (payment.AppointmentId.HasValue)
        {
            var appointment = await _db.Appointments.FindAsync(payment.AppointmentId.Value);
            if (appointment != null &&
                !string.Equals(appointment.Status, "Cancelled", StringComparison.OrdinalIgnoreCase))
            {
                appointment.Status = "Confirmed";
                await _db.SaveChangesAsync();
            }
        }

        return Ok(MapToDto(payment));
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var payment = await _db.Payments.FindAsync(id);
        if (payment == null)
            return NotFound(new { message = "Payment not found" });
        return Ok(MapToDto(payment));
    }

    [HttpGet("patient/{patientId}")]
    public async Task<IActionResult> GetByPatient(int patientId)
    {
        var payments = await _db.Payments
            .Where(p => p.PatientId == patientId)
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync();

        return Ok(payments.Select(MapToDto));
    }

    private static PaymentDto MapToDto(Payment p) => new()
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
        PlanType = p.PlanType,
        CreatedAt = p.CreatedAt,
        PaidAt = p.PaidAt
    };
}
