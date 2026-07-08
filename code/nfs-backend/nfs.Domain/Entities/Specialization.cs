using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace nfs.Domain.Entities
{
    public class Specialization
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(100)]
        public string Name { get; set; }

        [MaxLength(500)]
        public string? Description { get; set; }

        public bool IsActive { get; set; } = true;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }

        // Navigation properties
        public ICollection<TherapistSpecialization> TherapistSpecializations { get; set; } = new List<TherapistSpecialization>();
    }
}
