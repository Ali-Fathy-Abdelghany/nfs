namespace NFS.Application.DTOs
{
    public class UserSessionsDto
    {
        public int Id { get; set; }
        public DateTime? ActualStartTime { get; set; }
        public DateTime? ActualEndTime { get; set; }
        public string Status { get; set; } = string.Empty;
        public string DoctorName { get; set; } = string.Empty;
        public string Type { get; set; } = "أونلاين"; // or "حضور"
        public string Notes { get; set; } = string.Empty;
    }
}
