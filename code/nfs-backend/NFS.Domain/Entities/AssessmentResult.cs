namespace NFS.Domain.Entities
{
    public class AssessmentResult
    {
        public int AssessmentResultId { get; set; }

        public int AssessmentId { get; set; }
        public Assessment? Assessment { get; set; }

        public int PatientId { get; set; }
        public Patient? Patient { get; set; }

        public string AnswersJson { get; set; } = string.Empty;

        public DateTime TakenAt { get; set; } = DateTime.Now;

        public string? ResultSummary { get; set; }
    }
}
