using System.ComponentModel.DataAnnotations;

namespace NFS.Application.DTOs;

public class CreateAvailabilitySlotDto
{
    [Required]
    [Range(1, int.MaxValue, ErrorMessage = "DoctorId is required")]
    public int DoctorId { get; set; }

    [Required]
    public DateTime StartTime { get; set; }

    [Required]
    public DateTime EndTime { get; set; }
}
