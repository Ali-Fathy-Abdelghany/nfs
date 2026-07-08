using System;

namespace NafsApp.Models
{
    public class Therapist
    {
        public int TherapistId { get; set; }
        
        public int UserId { get; set; }
        public User? User { get; set; }
        
        public required string Specialization { get; set; }
        public string? Bio { get; set; }
        public int ExperienceYears { get; set; }
        public decimal HourlyRate { get; set; }
        public decimal Rating { get; set; } = 5.0m;
        public string? Qualifications { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
    }
}
