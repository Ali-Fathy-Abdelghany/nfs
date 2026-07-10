using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NFS.Chat.Repositories;
using System.Security.Claims;

namespace NFS.API.Controllers;

[ApiController]
[Route("api/chat")]
[Authorize]
public class ChatController : ControllerBase
{
    private readonly IChatRepository _chatRepository;

    public ChatController(IChatRepository chatRepository)
    {
        _chatRepository = chatRepository;
    }

    /// <summary>
    /// Returns the message history for a group room.
    /// GET /api/chat/history/{roomId}
    /// </summary>
    [HttpGet("history/{roomId}")]
    public async Task<IActionResult> GetRoomHistory(string roomId)
    {
        if (string.IsNullOrWhiteSpace(roomId))
            return BadRequest("roomId is required.");

        var messages = await _chatRepository.GetMessagesByRoomAsync(roomId);
        return Ok(messages);
    }

    /// <summary>
    /// Returns the private message history between the calling user and another user.
    /// GET /api/chat/private/{otherUserId}
    /// </summary>
    [HttpGet("private/{otherUserId}")]
    public async Task<IActionResult> GetPrivateHistory(string otherUserId)
    {
        if (string.IsNullOrWhiteSpace(otherUserId))
            return BadRequest("otherUserId is required.");

        var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(currentUserId))
            return Unauthorized();

        var messages = await _chatRepository.GetPrivateMessagesAsync(currentUserId, otherUserId);
        return Ok(messages);
    }
}
