namespace NafsApp.Models
{
    public class Assessment
    {
        public int AssessmentId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int TherapistId { get; set; }
        public Therapist? Therapist { get; set; }
        public List<AssessmentResult> Results { get; set; } = new();
    }
}