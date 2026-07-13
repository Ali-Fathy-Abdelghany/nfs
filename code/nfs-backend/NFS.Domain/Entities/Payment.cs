using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace NFS.Domain.Entities;

public class Payment
{
    [Key]
    public int Id { get; set; }

    public int? AppointmentId { get; set; }

    [ForeignKey(nameof(AppointmentId))]
    public Appointment? Appointment { get; set; }

    [Required]
    public int PatientId { get; set; }

    [ForeignKey(nameof(PatientId))]
    public Patient? Patient { get; set; }

    public int? DoctorId { get; set; }

    [ForeignKey(nameof(DoctorId))]
    public Therapist? Doctor { get; set; }

    [Required]
    [Column(TypeName = "decimal(18,2)")]
    public decimal Amount { get; set; }

    [Required]
    [MaxLength(10)]
    public string Currency { get; set; } = "EGP";

    [Required]
    [MaxLength(30)]
    public string Status { get; set; } = "Pending";

    [Required]
    [MaxLength(50)]
    public string Provider { get; set; } = "FakeGateway";

    [MaxLength(100)]
    public string? ProviderReference { get; set; }

    [MaxLength(500)]
    public string? CheckoutUrl { get; set; }

    [MaxLength(50)]
    public string? PlanType { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? PaidAt { get; set; }
}
