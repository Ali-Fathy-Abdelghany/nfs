using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NFS.Application.Interfaces.Services;
using NFS.Chat.Models;
using NFS.Chat.Repositories;
using System.Security.Claims;

namespace NFS.API.Controllers;

[ApiController]
[Route("api/chat")]
[Authorize]
public class ChatController : ControllerBase
{
    private readonly IChatRepository _chatRepository;
    private readonly IUserService _userService;

    public ChatController(IChatRepository chatRepository, IUserService userService)
    {
        _chatRepository = chatRepository;
        _userService = userService;
    }

    [HttpGet("rooms")]
    public async Task<IActionResult> GetRooms()
    {
        var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(currentUserId))
            return Unauthorized();

        var rooms = await _chatRepository.GetAllRoomsAsync();
        var response = rooms.Select(r => ToRoomResponse(r, currentUserId));
        return Ok(response);
    }

    [HttpPost("rooms")]
    public async Task<IActionResult> CreateRoom([FromBody] CreateChatRoomRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
            return BadRequest(new { message = "Room name is required." });

        var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(currentUserId))
            return Unauthorized();

        var roomId = $"room_{Guid.NewGuid():N}"[..16];
        var room = new ChatRoom
        {
            Id = roomId,
            Name = request.Name.Trim(),
            Description = request.Description?.Trim() ?? string.Empty,
            Avatar = string.IsNullOrWhiteSpace(request.Avatar) ? "🌱" : request.Avatar.Trim(),
            CreatedBy = currentUserId,
            MemberIds = new List<string> { currentUserId },
            CreatedAt = DateTime.UtcNow
        };

        var created = await _chatRepository.CreateRoomAsync(room);
        return CreatedAtAction(nameof(GetRooms), new { id = created.Id }, ToRoomResponse(created, currentUserId));
    }

    [HttpPost("rooms/{roomId}/join")]
    public async Task<IActionResult> JoinRoom(string roomId)
    {
        var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(currentUserId))
            return Unauthorized();

        var room = await _chatRepository.GetRoomByIdAsync(roomId);
        if (room == null)
            return NotFound(new { message = "Room not found." });

        await _chatRepository.AddMemberAsync(roomId, currentUserId);
        var updated = await _chatRepository.GetRoomByIdAsync(roomId);
        return Ok(ToRoomResponse(updated!, currentUserId));
    }

    [HttpPost("rooms/{roomId}/leave")]
    public async Task<IActionResult> LeaveRoom(string roomId)
    {
        var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(currentUserId))
            return Unauthorized();

        var room = await _chatRepository.GetRoomByIdAsync(roomId);
        if (room == null)
            return NotFound(new { message = "Room not found." });

        await _chatRepository.RemoveMemberAsync(roomId, currentUserId);
        var updated = await _chatRepository.GetRoomByIdAsync(roomId);
        return Ok(ToRoomResponse(updated!, currentUserId));
    }

    [HttpGet("history/{roomId}")]
    public async Task<IActionResult> GetRoomHistory(string roomId)
    {
        if (string.IsNullOrWhiteSpace(roomId))
            return BadRequest("roomId is required.");

        var messages = await _chatRepository.GetMessagesByRoomAsync(roomId);
        return Ok(await EnrichMessagesAsync(messages));
    }

    [HttpGet("private/{otherUserId}")]
    public async Task<IActionResult> GetPrivateHistory(string otherUserId)
    {
        if (string.IsNullOrWhiteSpace(otherUserId))
            return BadRequest("otherUserId is required.");

        var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(currentUserId))
            return Unauthorized();

        var messages = await _chatRepository.GetPrivateMessagesAsync(currentUserId, otherUserId);
        return Ok(await EnrichMessagesAsync(messages));
    }

    private async Task<List<ChatMessageResponse>> EnrichMessagesAsync(IEnumerable<ChatMessage> messages)
    {
        var list = messages.ToList();
        var senderIds = list
            .Select(m => m.SenderId)
            .Where(id => int.TryParse(id, out _))
            .Select(int.Parse)
            .Distinct()
            .ToList();

        var avatars = await _userService.GetAvatarsByIdsAsync(senderIds);
        var byId = avatars.ToDictionary(a => a.UserId);

        return list.Select(m =>
        {
            byId.TryGetValue(int.TryParse(m.SenderId, out var sid) ? sid : 0, out var avatar);
            return new ChatMessageResponse
            {
                Id = m.Id,
                RoomId = m.RoomId,
                SenderId = m.SenderId,
                RecipientId = m.RecipientId,
                Content = m.Content,
                Timestamp = m.Timestamp,
                SenderName = string.IsNullOrWhiteSpace(avatar?.DisplayName) ? null : avatar.DisplayName,
                SenderAvatarUrl = avatar?.ProfileImageUrl
            };
        }).ToList();
    }

    private static ChatRoomResponse ToRoomResponse(ChatRoom room, string currentUserId)
    {
        return new ChatRoomResponse
        {
            Id = room.Id,
            Name = room.Name,
            Description = room.Description,
            Avatar = room.Avatar,
            MembersCount = room.MemberIds?.Count ?? 0,
            Joined = room.MemberIds?.Contains(currentUserId) ?? false,
            CreatedAt = room.CreatedAt
        };
    }
}
