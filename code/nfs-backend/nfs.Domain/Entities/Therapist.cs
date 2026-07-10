using System;
using System.Collections.Generic;

namespace NFS.Domain.Entities
{
    public class Therapist
    {
        public int TherapistId { get; set; }
        public int UserId { get; set; }
        public User? User { get; set; }

        public string Specialization { get; set; } = string.Empty;
        public string? Bio { get; set; }
        public int ExperienceYears { get; set; }
        public decimal HourlyRate { get; set; }
        public decimal Rating { get; set; }
        public string? Qualifications { get; set; }
        public bool IsVerified { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }

        public ICollection<TherapistSpecialization> TherapistSpecializations { get; set; } = new List<TherapistSpecialization>();
    }
}
