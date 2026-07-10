using System;
using System.Collections.Generic;

namespace NFS.Domain.Entities
{
    public class Patient
    {
        public int PatientId { get; set; }
        
        public int UserId { get; set; }
        public User? User { get; set; }
        
        public string? EmergencyContactName { get; set; }
        public string? EmergencyContactPhone { get; set; }
        public string? MedicalHistory { get; set; }
        public string? Notes { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }

        // Navigation properties
        public ICollection<AssessmentResult> AssessmentResults { get; set; }
            = new List<AssessmentResult>();
    }
}
