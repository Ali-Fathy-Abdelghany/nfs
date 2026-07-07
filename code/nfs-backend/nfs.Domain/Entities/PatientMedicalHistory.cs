using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace nfs.Domain.Entities
{
    public class PatientMedicalHistory
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int PatientId { get; set; }

        [Required]
        [MaxLength(200)]
        public string Condition { get; set; }

        [MaxLength(500)]
        public string? Description { get; set; }

        public DateTime DiagnosedDate { get; set; }

        public DateTime? ResolvedDate { get; set; }

        [MaxLength(500)]
        public string? Treatment { get; set; }

        [MaxLength(500)]
        public string? Medications { get; set; }

        [MaxLength(100)]
        public string? Severity { get; set; } // Mild, Moderate, Severe

        [MaxLength(200)]
        public string? ReferencingDoctor { get; set; }

        public bool IsOngoing { get; set; } = false;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }

        // Navigation properties
        [ForeignKey("PatientId")]
        public Patient Patient { get; set; }
    }
}
