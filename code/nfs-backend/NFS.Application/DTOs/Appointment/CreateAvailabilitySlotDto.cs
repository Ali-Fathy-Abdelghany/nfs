using System.ComponentModel.DataAnnotations;

namespace NFS.Application.DTOs;

public class CreateAvailabilitySlotDto
{
    [Required]
    public int DoctorId { get; set; }

    [Required]
    public DateTime StartTime { get; set; }

    [Required]
    public DateTime EndTime { get; set; }
}
