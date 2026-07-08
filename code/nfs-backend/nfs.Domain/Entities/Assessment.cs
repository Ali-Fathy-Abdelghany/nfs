using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace nfs.Domain.Entities
{
    public class Assessment
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int PatientId { get; set; }

        [Required]
        public int? TherapistId { get; set; }

        [Required]
        [MaxLength(100)]
        public string AssessmentType { get; set; } // PHQ-9, GAD-7, PTSD, etc.

        [MaxLength(500)]
        public string? Description { get; set; }

        [Required]
        public DateTime AssessmentDate { get; set; } = DateTime.UtcNow;

        public DateTime? CompletedDate { get; set; }

        [MaxLength(20)]
        public string Status { get; set; } = "Pending"; // Pending, In Progress, Completed

        [MaxLength(500)]
        public string? Observations { get; set; }

        [MaxLength(500)]
        public string? Recommendations { get; set; }

        public int? TotalScore { get; set; }

        [MaxLength(100)]
        public string? ScoreInterpretation { get; set; } // Normal, Mild, Moderate, Severe

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }

        // Navigation properties
        [ForeignKey("PatientId")]
        public Patient Patient { get; set; }

        [ForeignKey("TherapistId")]
        public Therapist Therapist { get; set; }

        public ICollection<AssessmentResult> Results { get; set; } = new List<AssessmentResult>();
    }
}
