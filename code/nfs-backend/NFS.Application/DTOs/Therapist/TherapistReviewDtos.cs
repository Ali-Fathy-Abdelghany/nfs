using System.ComponentModel.DataAnnotations;

namespace NFS.Application.DTOs;

public class TherapistReviewDto
{
    public string Id { get; set; } = string.Empty;
    public int TherapistId { get; set; }
    public int Stars { get; set; }
    public string Comment { get; set; } = string.Empty;
    public string AuthorDisplay { get; set; } = "مراجع مجهول";
    public DateTime CreatedAt { get; set; }
}

public class TherapistReviewSummaryDto
{
    public int TherapistId { get; set; }
    public decimal AverageRating { get; set; }
    public int ReviewCount { get; set; }
}

public class CreateTherapistReviewDto
{
    [Required]
    public int PatientId { get; set; }

    public int? UserId { get; set; }

    [Range(1, 5)]
    public int Stars { get; set; }

    [MaxLength(1000)]
    public string? Comment { get; set; }

    public bool IsAnonymous { get; set; } = true;

    public string? AuthorName { get; set; }

    public int? AppointmentId { get; set; }
}
