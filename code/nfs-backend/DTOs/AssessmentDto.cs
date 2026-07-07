using System;

namespace NafsApp.DTOs
{
    public class AssessmentDto
    {
        public int AssessmentId { get; set; }
        public int PatientId { get; set; }
        public string PatientName { get; set; } = null!;
        public string Title { get; set; } = null!;
        public string AnswersJson { get; set; } = null!;
        public int? Score { get; set; }
        public DateTime CompletedAt { get; set; }
    }
}
