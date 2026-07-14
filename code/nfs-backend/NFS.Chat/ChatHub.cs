using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using NFS.Application.Interfaces.Services;
using NFS.Chat.Models;
using NFS.Chat.Repositories;
using System.Security.Claims;
using System.Threading.Tasks;

namespace NFS.Chat;

[Authorize]
public class ChatHub : Hub
{
    private readonly IChatRepository _chatRepository;
    private readonly IUserService _userService;

    public ChatHub(IChatRepository chatRepository, IUserService userService)
    {
        _chatRepository = chatRepository;
        _userService = userService;
    }

    public async Task JoinGroup(string groupId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, groupId);
    }

    public async Task LeaveGroup(string groupId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, groupId);
    }

    public async Task SendMessageToGroup(string groupId, string message)
    {
        var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "anonymous";
        var chatMessage = new ChatMessage
        {
            RoomId = groupId,
            SenderId = userId,
            Content = message,
            Timestamp = DateTime.UtcNow
        };
        await _chatRepository.SaveMessageAsync(chatMessage);
        var payload = await ToResponseAsync(chatMessage);
        await Clients.Group(groupId).SendAsync("ReceiveGroupMessage", payload);
    }

    public async Task SendPrivateMessage(string receiverUserId, string message)
    {
        var senderUserId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "anonymous";
        var privateRoomId = GetPrivateRoomId(senderUserId, receiverUserId);
        var chatMessage = new ChatMessage
        {
            RoomId = privateRoomId,
            SenderId = senderUserId,
            RecipientId = receiverUserId,
            Content = message,
            Timestamp = DateTime.UtcNow
        };
        await _chatRepository.SaveMessageAsync(chatMessage);
        var payload = await ToResponseAsync(chatMessage);
        await Clients.User(receiverUserId).SendAsync("ReceivePrivateMessage", payload);
        await Clients.Caller.SendAsync("ReceivePrivateMessage", payload);
    }

    private async Task<ChatMessageResponse> ToResponseAsync(ChatMessage message)
    {
        string? senderName = null;
        string? senderAvatarUrl = null;

        if (int.TryParse(message.SenderId, out var userId))
        {
            var avatars = await _userService.GetAvatarsByIdsAsync(new[] { userId });
            var avatar = avatars.FirstOrDefault();
            if (avatar != null)
            {
                senderName = string.IsNullOrWhiteSpace(avatar.DisplayName) ? null : avatar.DisplayName;
                senderAvatarUrl = avatar.ProfileImageUrl;
            }
        }

        return new ChatMessageResponse
        {
            Id = message.Id,
            RoomId = message.RoomId,
            SenderId = message.SenderId,
            RecipientId = message.RecipientId,
            Content = message.Content,
            Timestamp = message.Timestamp,
            SenderName = senderName,
            SenderAvatarUrl = senderAvatarUrl
        };
    }

    private string GetPrivateRoomId(string userA, string userB)
    {
        return string.CompareOrdinal(userA, userB) < 0 ? $"private_{userA}_{userB}" : $"private_{userB}_{userA}";
    }
}
