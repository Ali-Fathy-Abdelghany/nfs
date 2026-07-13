using System.ComponentModel.DataAnnotations;

namespace NFS.Application.DTOs;

public class CreatePaymentDto
{
    [Required]
    public int PatientId { get; set; }

    public int? DoctorId { get; set; }

    public int? AppointmentId { get; set; }

    /// <summary>Optional — if omitted, amount is taken from therapist HourlyRate.</summary>
    public decimal? Amount { get; set; }

    [MaxLength(10)]
    public string Currency { get; set; } = "EGP";

    [MaxLength(50)]
    public string? PlanType { get; set; }
}

public class ConfirmPaymentDto
{
    /// <summary>Optional card last-4 or fake token for UI display.</summary>
    [MaxLength(50)]
    public string? CardToken { get; set; }
}

public class PaymentDto
{
    public int Id { get; set; }
    public int? AppointmentId { get; set; }
    public int PatientId { get; set; }
    public int? DoctorId { get; set; }
    public decimal Amount { get; set; }
    public string Currency { get; set; } = "EGP";
    public string Status { get; set; } = "Pending";
    public string Provider { get; set; } = "FakeGateway";
    public string? ProviderReference { get; set; }
    public string? CheckoutUrl { get; set; }
    public string? PlanType { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? PaidAt { get; set; }
}

public class PaymentGatewaySession
{
    public string ProviderReference { get; set; } = string.Empty;
    public string CheckoutUrl { get; set; } = string.Empty;
}
