using Microsoft.AspNetCore.Mvc;
using NFS.Application.DTOs;

using NFS.Application.Interfaces;

namespace NFS.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SessionsController : ControllerBase
    {
        private readonly ISessionRepository _sessionRepository;

        public SessionsController(ISessionRepository sessionRepository)
        {
            _sessionRepository = sessionRepository;
        }

        [HttpPost("start")]
        public async Task<IActionResult> StartSession([FromBody] StartSessionDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var session = await _sessionRepository.StartSessionAsync(dto.AppointmentId);

            return Ok(new
            {
                message = "Session started successfully",
                sessionId = session.Id,
                status = session.Status
            });
        }

        [HttpPost("end")]
        public async Task<IActionResult> EndSession([FromBody] EndSessionDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await _sessionRepository.EndSessionAsync(dto.SessionId, dto.NotesContent);
            if (!result)
                return NotFound(new { message = "Session not found" });

            return Ok(new { message = "Session ended and notes saved successfully" });
        }
    // New endpoint: Get sessions for a specific user
    [HttpGet("user/{userId}")]
    public async Task<IActionResult> GetSessionsByUser(int userId)
    {
        // Ideally we'd get userId from JWT, but it's passed as route param for now
        var sessions = await _sessionRepository.GetSessionsByUserAsync(userId);
        return Ok(sessions);
    }

    }
}