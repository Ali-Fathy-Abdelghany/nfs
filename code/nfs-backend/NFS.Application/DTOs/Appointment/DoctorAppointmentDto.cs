namespace NFS.Application.DTOs;

public class DoctorAppointmentDto
{
    public int Id { get; set; }
    public int PatientId { get; set; }
    public string PatientName { get; set; } = string.Empty;
    public string? PatientImageUrl { get; set; }
    public string? PatientNotes { get; set; }
    public int DoctorId { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime? ScheduledStartTime { get; set; }
    public DateTime? ScheduledEndTime { get; set; }
    public DateTime CreatedAt { get; set; }
    public int? SessionId { get; set; }
    public DateTime? ActualStartTime { get; set; }
    public DateTime? ActualEndTime { get; set; }
    public string Notes { get; set; } = string.Empty;
    public string Type { get; set; } = "أونلاين";
}
