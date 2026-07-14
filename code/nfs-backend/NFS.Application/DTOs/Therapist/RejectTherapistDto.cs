using System.ComponentModel.DataAnnotations;

namespace NFS.Application.DTOs;

public class RejectTherapistDto
{
    [MaxLength(1000)]
    public string? Reason { get; set; }
}
