namespace NafsApp.Models
{
    public class PatientMedicalHistory
    {
        public int PatientMedicalHistoryId { get; set; }
        public int ClientId { get; set; }
        public Client? Client { get; set; }
        public string Notes { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.Now;
    }
}