namespace NFS.Application.DTOs;

public class PatientAppointmentDto
{
    public int Id { get; set; }
    public int PatientId { get; set; }
    public int DoctorId { get; set; }
    public string DoctorName { get; set; } = string.Empty;
    public string? DoctorImageUrl { get; set; }
    public string Status { get; set; } = string.Empty;
    /// <summary>True when a Paid payment is linked (or matched) to this appointment.</summary>
    public bool IsPaid { get; set; }
    public DateTime? ScheduledStartTime { get; set; }
    public DateTime? ScheduledEndTime { get; set; }
    public DateTime CreatedAt { get; set; }
    public int? SessionId { get; set; }
    public DateTime? ActualStartTime { get; set; }
    public DateTime? ActualEndTime { get; set; }
    public string Notes { get; set; } = string.Empty;
    public string Type { get; set; } = "أونلاين";
}
