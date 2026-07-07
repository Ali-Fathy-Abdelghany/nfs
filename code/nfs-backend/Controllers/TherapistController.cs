using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NafsApp.DTOs;
using NafsApp.Services;

namespace NafsApp.Controllers
{
    [ApiController]
    [Route("therapists")]
    [Authorize]
    public class TherapistController : ControllerBase
    {
        private readonly ITherapistService _therapistService;

        public TherapistController(ITherapistService therapistService)
        {
            _therapistService = therapistService;
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetAll()
        {
            var therapists = await _therapistService.GetAllTherapistsAsync();
            return Ok(therapists);
        }

        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetById(int id)
        {
            var therapist = await _therapistService.GetTherapistByIdAsync(id);
            if (therapist == null) return NotFound(new { Message = "Therapist profile not found." });
            return Ok(therapist);
        }

        [HttpGet("user/{userId}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetByUserId(int userId)
        {
            var therapist = await _therapistService.GetTherapistByUserIdAsync(userId);
            if (therapist == null) return NotFound(new { Message = "Therapist profile not found for this user." });
            return Ok(therapist);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateTherapistDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            try
            {
                var therapist = await _therapistService.CreateTherapistAsync(dto);
                return CreatedAtAction(nameof(GetById), new { id = therapist.TherapistId }, therapist);
            }
            catch (ArgumentException ex)
            {
                return NotFound(new { Message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateTherapistDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var result = await _therapistService.UpdateTherapistAsync(id, dto);
            if (!result) return NotFound(new { Message = "Therapist profile not found or update failed." });

            return Ok(new { Message = "Therapist profile updated successfully." });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _therapistService.DeleteTherapistAsync(id);
            if (!result) return NotFound(new { Message = "Therapist profile not found." });

            return Ok(new { Message = "Therapist profile deleted successfully." });
        }
    }
}
