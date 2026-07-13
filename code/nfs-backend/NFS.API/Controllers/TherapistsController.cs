using Microsoft.AspNetCore.Mvc;
using NFS.Application.DTOs;
using NFS.Application.Interfaces.Services;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace NFS.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TherapistsController : ControllerBase
    {
        private readonly ITherapistService _therapistService;

        public TherapistsController(ITherapistService therapistService)
        {
            _therapistService = therapistService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
            => Ok(await _therapistService.GetAllTherapistsAsync());

        [HttpGet("by-user/{userId}")]
        public async Task<IActionResult> GetByUser(int userId)
        {
            var therapist = await _therapistService.GetTherapistByUserIdAsync(userId);
            return therapist == null ? NotFound() : Ok(therapist);
        }

        [HttpGet("search")]
        public async Task<IActionResult> Search([FromQuery] string? q)
        {
            var list = await _therapistService.GetAllTherapistsAsync();
            if (!string.IsNullOrWhiteSpace(q))
            {
                list = list.Where(t =>
                    t.FirstName.Contains(q, StringComparison.OrdinalIgnoreCase) ||
                    t.LastName.Contains(q, StringComparison.OrdinalIgnoreCase) ||
                    (t.Bio?.Contains(q, StringComparison.OrdinalIgnoreCase) ?? false));
            }
            return Ok(list);
        }

        [HttpGet("pending")]
        public async Task<IActionResult> GetPending()
        {
            var list = await _therapistService.GetAllTherapistsAsync();
            return Ok(list.Where(t => !t.IsVerified));
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> Get(int id)
        {
            var therapist = await _therapistService.GetTherapistByIdAsync(id);
            return therapist == null ? NotFound() : Ok(therapist);
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

        [HttpPost("{id}/approve")]
        public async Task<IActionResult> Approve(int id)
        {
            var result = await _therapistService.ApproveTherapistAsync(id);
            return result ? NoContent() : NotFound();
        }
    }
}
