namespace NafsApp.Models
{
    public class AssessmentResult
    {
        public int AssessmentResultId { get; set; }
        public int AssessmentId { get; set; }
        public Assessment? Assessment { get; set; }

        public int ClientId { get; set; }
        public Client? Client { get; set; }

        public string AnswersJson { get; set; } = string.Empty; // store answers as JSON
        public DateTime TakenAt { get; set; } = DateTime.Now;
        public string? ResultSummary { get; set; }
    }
}