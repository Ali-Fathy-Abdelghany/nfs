using System;

namespace NafsApp.Models
{
    public class Assessment
    {
        public int AssessmentId { get; set; }
        
        public int PatientId { get; set; }
        public Patient? Patient { get; set; }
        
        public required string Title { get; set; }
        public required string AnswersJson { get; set; }
        public int? Score { get; set; }
        public DateTime CompletedAt { get; set; } = DateTime.UtcNow;
    }
}
