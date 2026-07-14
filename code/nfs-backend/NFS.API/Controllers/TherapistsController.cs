using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NFS.Application.DTOs;
using NFS.Application.Interfaces.Repositories;
using NFS.Application.Interfaces.Services;

namespace NFS.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TherapistsController : ControllerBase
    {
        private readonly ITherapistService _therapistService;
        private readonly ITherapistReviewRepository _reviews;

        public TherapistsController(ITherapistService therapistService, ITherapistReviewRepository reviews)
        {
            _therapistService = therapistService;
            _reviews = reviews;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var list = (await _therapistService.GetAllTherapistsAsync()).ToList();
            await EnrichReviewCountsAsync(list);
            return Ok(list);
        }

        [HttpGet("by-user/{userId}")]
        public async Task<IActionResult> GetByUser(int userId)
        {
            var therapist = await _therapistService.GetTherapistByUserIdAsync(userId);
            if (therapist == null) return NotFound();
            await EnrichReviewCountsAsync(new[] { therapist });
            return Ok(therapist);
        }

        [HttpGet("search")]
        public async Task<IActionResult> Search([FromQuery] string? q)
        {
            var list = (await _therapistService.GetAllTherapistsAsync())
                .Where(t => t.IsVerified)
                .ToList();
            if (!string.IsNullOrWhiteSpace(q))
            {
                list = list.Where(t =>
                    t.FirstName.Contains(q, StringComparison.OrdinalIgnoreCase) ||
                    t.LastName.Contains(q, StringComparison.OrdinalIgnoreCase) ||
                    (t.Bio?.Contains(q, StringComparison.OrdinalIgnoreCase) ?? false)).ToList();
            }
            await EnrichReviewCountsAsync(list);
            return Ok(list);
        }

        [Authorize(Roles = "ADMIN")]
        [HttpGet("pending")]
        public async Task<IActionResult> GetPending()
        {
            var list = (await _therapistService.GetPendingTherapistsAsync()).ToList();
            await EnrichReviewCountsAsync(list);
            return Ok(list);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> Get(int id)
        {
            var therapist = await _therapistService.GetTherapistByIdAsync(id);
            if (therapist == null) return NotFound();
            await EnrichReviewCountsAsync(new[] { therapist });
            return Ok(therapist);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateTherapistDto dto)
        {
            var result = await _therapistService.UpdateTherapistAsync(id, dto);
            return result ? NoContent() : NotFound();
        }

        [HttpPost]
        public async Task<IActionResult> Register([FromBody] CreateTherapistDto dto)
        {
            try
            {
                var therapist = await _therapistService.CreateTherapistAsync(dto);
                return CreatedAtAction(nameof(Get), new { id = therapist.TherapistId }, therapist);
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }

        [Authorize(Roles = "ADMIN")]
        [HttpPost("{id}/approve")]
        public async Task<IActionResult> Approve(int id)
        {
            var result = await _therapistService.ApproveTherapistAsync(id);
            return result ? NoContent() : NotFound();
        }

        [Authorize(Roles = "ADMIN")]
        [HttpPost("{id}/reject")]
        public async Task<IActionResult> Reject(int id, [FromBody] RejectTherapistDto? dto)
        {
            var result = await _therapistService.RejectTherapistAsync(id, dto?.Reason);
            return result ? NoContent() : NotFound();
        }

        private async Task EnrichReviewCountsAsync(IEnumerable<TherapistDto> therapists)
        {
            var list = therapists as IList<TherapistDto> ?? therapists.ToList();
            if (list.Count == 0) return;

            var counts = await _reviews.GetCountsAsync(list.Select(t => t.TherapistId));
            foreach (var t in list)
                t.ReviewCount = counts.TryGetValue(t.TherapistId, out var c) ? c : 0;
        }
    }
}
