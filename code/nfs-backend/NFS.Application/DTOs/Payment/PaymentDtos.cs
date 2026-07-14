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

    /// <summary>Extra free availability slot ids for monthly/bundle plans (excluding the primary appointment slot).</summary>
    public List<int>? AdditionalSlotIds { get; set; }
}

public class ConfirmPaymentDto
{
    /// <summary>Optional card last-4 or fake token for UI display.</summary>
    [MaxLength(50)]
    public string? CardToken { get; set; }
}

public class VerifyPaymentDto
{
    /// <summary>Paymob transaction id from redirect query (optional).</summary>
    [MaxLength(64)]
    public string? TransactionId { get; set; }
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
    public string? ClientSecret { get; set; }
    public string? PublicKey { get; set; }
    public string? PlanType { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? PaidAt { get; set; }
}

public class PaymentGatewaySession
{
    public string ProviderReference { get; set; } = string.Empty;
    public string CheckoutUrl { get; set; } = string.Empty;
    /// <summary>Paymob unified checkout client secret (optional).</summary>
    public string? ClientSecret { get; set; }
    /// <summary>Paymob public key for Pixel/iframe checkout (optional).</summary>
    public string? PublicKey { get; set; }
}
