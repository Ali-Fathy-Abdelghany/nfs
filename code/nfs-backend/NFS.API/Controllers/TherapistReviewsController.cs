using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NFS.Application.DTOs;
using NFS.Application.Interfaces.Data;
using NFS.Application.Interfaces.Repositories;

namespace NFS.API.Controllers;

[ApiController]
[Route("api/therapists/{therapistId:int}/reviews")]
public class TherapistReviewsController : ControllerBase
{
    private readonly ITherapistReviewRepository _reviews;
    private readonly IApplicationDbContext _db;

    public TherapistReviewsController(ITherapistReviewRepository reviews, IApplicationDbContext db)
    {
        _reviews = reviews;
        _db = db;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<TherapistReviewDto>>> GetReviews(
        int therapistId,
        [FromQuery] int? limit = null)
    {
        var therapistExists = await _db.Therapists.AnyAsync(t => t.TherapistId == therapistId);
        if (!therapistExists) return NotFound(new { message = "المعالج غير موجود" });

        var list = await _reviews.GetByTherapistIdAsync(therapistId, limit);
        return Ok(list.Select(MapToDto));
    }

    [HttpGet("summary")]
    public async Task<ActionResult<TherapistReviewSummaryDto>> GetSummary(int therapistId)
    {
        var therapistExists = await _db.Therapists.AnyAsync(t => t.TherapistId == therapistId);
        if (!therapistExists) return NotFound(new { message = "المعالج غير موجود" });

        var (average, count) = await _reviews.GetAggregateAsync(therapistId);
        return Ok(new TherapistReviewSummaryDto
        {
            TherapistId = therapistId,
            AverageRating = average,
            ReviewCount = count
        });
    }

    [HttpPost]
    public async Task<ActionResult<TherapistReviewDto>> CreateReview(
        int therapistId,
        [FromBody] CreateTherapistReviewDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var therapist = await _db.Therapists.FirstOrDefaultAsync(t => t.TherapistId == therapistId);
        if (therapist == null)
            return NotFound(new { message = "المعالج غير موجود" });

        var patientExists = await _db.Patients.AnyAsync(p => p.PatientId == dto.PatientId);
        if (!patientExists)
            return BadRequest(new { message = "المريض غير موجود" });

        var existing = await _reviews.GetByPatientAndTherapistAsync(dto.PatientId, therapistId);
        if (existing != null)
            return Conflict(new { message = "لقد قيّمت هذا المعالج مسبقاً" });

        var authorName = string.IsNullOrWhiteSpace(dto.AuthorName) ? "مراجع" : dto.AuthorName.Trim();
        var created = await _reviews.AddAsync(new TherapistReviewRecord
        {
            TherapistId = therapistId,
            PatientId = dto.PatientId,
            UserId = dto.UserId,
            AuthorName = authorName,
            Stars = dto.Stars,
            Comment = string.IsNullOrWhiteSpace(dto.Comment) ? "" : dto.Comment.Trim(),
            IsAnonymous = dto.IsAnonymous,
            AppointmentId = dto.AppointmentId,
            CreatedAt = DateTime.UtcNow
        });

        var (average, _) = await _reviews.GetAggregateAsync(therapistId);
        therapist.Rating = average;
        therapist.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        return Ok(MapToDto(created));
    }

    [HttpDelete("{reviewId}")]
    public async Task<IActionResult> DeleteReview(int therapistId, string reviewId)
    {
        var existing = await _reviews.GetByIdAsync(reviewId);
        if (existing == null || existing.TherapistId != therapistId)
            return NotFound(new { message = "التقييم غير موجود" });

        var deleted = await _reviews.DeleteAsync(reviewId);
        if (!deleted)
            return NotFound(new { message = "التقييم غير موجود" });

        var therapist = await _db.Therapists.FirstOrDefaultAsync(t => t.TherapistId == therapistId);
        if (therapist != null)
        {
            var (average, count) = await _reviews.GetAggregateAsync(therapistId);
            therapist.Rating = count == 0 ? 0 : average;
            therapist.UpdatedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync();
        }

        return NoContent();
    }

    private static TherapistReviewDto MapToDto(TherapistReviewRecord r) => new()
    {
        Id = r.Id,
        TherapistId = r.TherapistId,
        Stars = r.Stars,
        Comment = r.Comment,
        AuthorDisplay = r.IsAnonymous ? "مراجع مجهول" : r.AuthorName,
        CreatedAt = r.CreatedAt
    };
}
