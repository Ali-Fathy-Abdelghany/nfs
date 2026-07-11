namespace NFS.Domain.Entities
{
    public class PatientMedicalHistory
    {
        public int PatientMedicalHistoryId { get; set; }
        public int PatientId { get; set; }
        public Patient? Patient { get; set; }
        public string Notes { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
