using System.Collections.Generic;
using NafsApp.Enums;

namespace NafsApp.Models
{
    public class MedicalRecord
    {
        public int MedicalRecordId { get; set; }
        public string Notes { get; set; } = string.Empty;
        public int ClientId { get; set; }
    
        public int TherapistId { get; set; } 
        public string? Diagnosis { get; set; }
        public string? TreatmentPlan { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public DateTime UpdatedAt { get; set; } 
        public Client? Client { get; set; }
        public Therapist? Therapist { get; set; }

}}