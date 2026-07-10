namespace NFS.Domain.Entities
{
    public class Assessment
    {
        public int AssessmentId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int PatientId { get; set; }
        public Patient? Patient { get; set; }
        public string? AnswersJson { get; set; }
        public int? Score { get; set; }
        public DateTime CompletedAt { get; set; }
        public int? TherapistId { get; set; }
        public Therapist? Therapist { get; set; }
        public ICollection<AssessmentResult> Results { get; set; } = new List<AssessmentResult>();
    }
}
