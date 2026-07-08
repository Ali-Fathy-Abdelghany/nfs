using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace nfs.Domain.Entities
{
    public class Therapist
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int UserId { get; set; }

        [Required]
        [MaxLength(50)]
        public string LicenseNumber { get; set; }

        [Required]
        public DateTime LicenseIssueDate { get; set; }

        [Required]
        public DateTime LicenseExpiryDate { get; set; }

        [Required]
        [MaxLength(20)]
        public string VerificationStatus { get; set; } = "Pending"; // Pending, Approved, Rejected

        public string? VerificationNotes { get; set; }

        public DateTime? VerifiedAt { get; set; }

        public int? VerifiedByUserId { get; set; }

        [Required]
        public int YearsOfExperience { get; set; }

        [MaxLength(500)]
        public string? Bio { get; set; }

        [MaxLength(100)]
        public string? Qualifications { get; set; }

        [Required]
        public bool IsAvailable { get; set; } = true;

        public string? OfficeAddress { get; set; }

        public string? OfficePhone { get; set; }

        [Required]
        public decimal HourlyRate { get; set; }

        public string? Languages { get; set; } // Comma-separated languages

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }

        public bool IsActive { get; set; } = true;

        // Navigation properties
        [ForeignKey("UserId")]
        public User User { get; set; }

        public ICollection<TherapistSpecialization> Specializations { get; set; } = new List<TherapistSpecialization>();

        public ICollection<Appointment> Appointments { get; set; } = new List<Appointment>();

        public ICollection<AvailabilitySlot> AvailabilitySlots { get; set; } = new List<AvailabilitySlot>();
    }
}
