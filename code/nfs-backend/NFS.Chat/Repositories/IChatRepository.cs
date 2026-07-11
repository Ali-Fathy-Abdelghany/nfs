using NFS.Chat.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace NFS.Chat.Repositories
{
    public interface IChatRepository
    {
        Task SaveMessageAsync(ChatMessage message);
        Task<IList<ChatMessage>> GetMessagesByRoomAsync(string roomId);
        Task<IList<ChatMessage>> GetPrivateMessagesAsync(string userA, string userB);

        Task<IList<ChatRoom>> GetAllRoomsAsync();
        Task<ChatRoom?> GetRoomByIdAsync(string roomId);
        Task<ChatRoom> CreateRoomAsync(ChatRoom room);
        Task<bool> AddMemberAsync(string roomId, string userId);
        Task<bool> RemoveMemberAsync(string roomId, string userId);
    }
}
