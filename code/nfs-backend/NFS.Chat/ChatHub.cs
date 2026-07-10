using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using NFS.Chat.Models;
using NFS.Chat.Repositories;
using System.Security.Claims;
using System.Threading.Tasks;

namespace NFS.Chat;

[Authorize]
public class ChatHub : Hub
{
    private readonly IChatRepository _chatRepository;

    public ChatHub(IChatRepository chatRepository)
    {
        _chatRepository = chatRepository;
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
        await Clients.Group(groupId).SendAsync("ReceiveGroupMessage", chatMessage);
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
        // Send to both participants if they are connected
        await Clients.User(receiverUserId).SendAsync("ReceivePrivateMessage", chatMessage);
        await Clients.Caller.SendAsync("ReceivePrivateMessage", chatMessage);
    }

    private string GetPrivateRoomId(string userA, string userB)
    {
        // Deterministic ordering to have same room ID for both participants
        return string.CompareOrdinal(userA, userB) < 0 ? $"private_{userA}_{userB}" : $"private_{userB}_{userA}";
    }
}
