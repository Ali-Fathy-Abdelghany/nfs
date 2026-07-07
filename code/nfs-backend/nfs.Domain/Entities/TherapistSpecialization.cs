using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace nfs.Domain.Entities
{
    public class TherapistSpecialization
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int TherapistId { get; set; }

        [Required]
        public int SpecializationId { get; set; }

        [MaxLength(500)]
        public string? ExperienceDetails { get; set; }

        [Required]
        public int YearsOfSpecializationExperience { get; set; }

        public DateTime AssignedAt { get; set; } = DateTime.UtcNow;

        public bool IsActive { get; set; } = true;

        // Navigation properties
        [ForeignKey("TherapistId")]
        public Therapist Therapist { get; set; }

        [ForeignKey("SpecializationId")]
        public Specialization Specialization { get; set; }
    }
}
