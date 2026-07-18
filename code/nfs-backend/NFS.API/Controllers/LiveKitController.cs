using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NFS.Application.Interfaces.Services;

namespace NFS.API.Controllers
{
    [ApiController]
    [Authorize]
    [Route("api/livekit")]
    public class LiveKitController : ControllerBase
    {
        private readonly ILiveKitMeetingService _meetingService;

        public LiveKitController(ILiveKitMeetingService meetingService)
        {
            _meetingService = meetingService;
        }

        [HttpPost("appointments/{appointmentId:int}/token")]
        public async Task<IActionResult> CreateToken(
            int appointmentId,
            CancellationToken cancellationToken)
        {
            var rawUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(rawUserId, out var userId))
                return Unauthorized();

            try
            {
                var result = await _meetingService.CreateMeetingTokenAsync(
                    appointmentId,
                    userId,
                    cancellationToken);

                return result == null ? Forbid() : Ok(result);
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { message = ex.Message });
            }
        }
    }
}
