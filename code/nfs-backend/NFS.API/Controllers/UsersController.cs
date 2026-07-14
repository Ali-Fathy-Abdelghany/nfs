using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NFS.Application.DTOs;
using NFS.Application.Interfaces.Services;

namespace NFS.API.Controllers
{
    [ApiController]
    [Route("users")]
    [Authorize]
    public class UsersController : ControllerBase
    {
        private readonly IUserService _userService;

        public UsersController(IUserService userService)
        {
            _userService = userService;
        }

        [HttpGet("profile")]
        public async Task<IActionResult> GetProfile()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
            {
                return Unauthorized();
            }

            var profile = await _userService.GetProfileAsync(userId);
            if (profile == null) return NotFound(new { Message = "Profile not found." });

            return Ok(profile);
        }

        [HttpPut("profile")]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
            {
                return Unauthorized();
            }

            var result = await _userService.UpdateProfileAsync(userId, dto);
            if (!result) return BadRequest(new { Message = "Unable to update profile." });

            return Ok(new { Message = "Profile updated successfully." });
        }

        /// <summary>Public display avatars for chat / lists (profile image + name only).</summary>
        [HttpPost("avatars")]
        public async Task<IActionResult> GetAvatars([FromBody] int[]? userIds)
        {
            if (userIds == null || userIds.Length == 0)
                return Ok(Array.Empty<object>());

            var avatars = await _userService.GetAvatarsByIdsAsync(userIds.Take(100));
            return Ok(avatars);
        }
    }
}
