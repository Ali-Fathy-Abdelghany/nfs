using System.Collections.Generic;
using NafsApp.Enums;

namespace NafsApp.Models
{
    public class Therapist
    {
        public int TherapistId { get; set; }
        public string? Specialization { get; set; } 
        public string? Bio { get; set; } 
        public decimal SessionPrice { get; set; }
        public bool IsVerified { get; set; }
        public string? LicenseFile { get; set; }
        public int UserId { get; set; }
        public User User { get; set; }
        public List<Session> Sessions { get; set; } = new();
    }
}