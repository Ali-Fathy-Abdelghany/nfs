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
    }
}
