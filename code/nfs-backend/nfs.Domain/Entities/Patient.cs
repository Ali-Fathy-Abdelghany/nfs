using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace nfs.Domain.Entities
{
    public class Patient
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int UserId { get; set; }

        [MaxLength(20)]
        public string? BloodType { get; set; }

        [MaxLength(500)]
        public string? MedicalConditions { get; set; } // Comma-separated or detailed

        [MaxLength(500)]
        public string? CurrentMedications { get; set; }

        [MaxLength(500)]
        public string? Allergies { get; set; }

        public string? EmergencyContactName { get; set; }

        public string? EmergencyContactPhone { get; set; }

        public string? EmergencyContactRelation { get; set; }

        [Required]
        public bool HasInsurance { get; set; } = false;

        public string? InsuranceProvider { get; set; }

        public string? InsurancePolicyNumber { get; set; }

        [MaxLength(500)]
        public string? PrimaryConcern { get; set; } // Main reason for seeking therapy

        [MaxLength(500)]
        public string? MentalHealthHistory { get; set; }

        [MaxLength(500)]
        public string? FamilyMentalHealthHistory { get; set; }

        [Required]
        public bool IsActive { get; set; } = true;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }

        // Navigation properties
        [ForeignKey("UserId")]
        public User User { get; set; }

        public ICollection<PatientMedicalHistory> MedicalHistories { get; set; } = new List<PatientMedicalHistory>();

        public ICollection<Appointment> Appointments { get; set; } = new List<Appointment>();

        public ICollection<Assessment> Assessments { get; set; } = new List<Assessment>();
    }
}
