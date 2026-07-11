using MongoDB.Driver;
using NFS.Chat.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace NFS.Chat.Repositories
{
    public class ChatRepository : IChatRepository
    {
        private readonly IMongoCollection<ChatMessage> _messages;
        private readonly IMongoCollection<ChatRoom> _rooms;

        public ChatRepository(IMongoDatabase database)
        {
            _messages = database.GetCollection<ChatMessage>("ChatMessages");
            _rooms = database.GetCollection<ChatRoom>("ChatRooms");
        }

        public async Task SaveMessageAsync(ChatMessage message)
        {
            await _messages.InsertOneAsync(message);
        }

        public async Task<IList<ChatMessage>> GetMessagesByRoomAsync(string roomId)
        {
            var filter = Builders<ChatMessage>.Filter.Eq(m => m.RoomId, roomId);
            return await _messages.Find(filter).SortBy(m => m.Timestamp).ToListAsync();
        }

        public async Task<IList<ChatMessage>> GetPrivateMessagesAsync(string userA, string userB)
        {
            var privateRoomId = string.CompareOrdinal(userA, userB) < 0
                ? $"private_{userA}_{userB}"
                : $"private_{userB}_{userA}";

            var filter = Builders<ChatMessage>.Filter.Eq(m => m.RoomId, privateRoomId);
            return await _messages.Find(filter).SortBy(m => m.Timestamp).ToListAsync();
        }

        public async Task<IList<ChatRoom>> GetAllRoomsAsync()
        {
            return await _rooms.Find(_ => true).SortByDescending(r => r.CreatedAt).ToListAsync();
        }

        public async Task<ChatRoom?> GetRoomByIdAsync(string roomId)
        {
            return await _rooms.Find(r => r.Id == roomId).FirstOrDefaultAsync();
        }

        public async Task<ChatRoom> CreateRoomAsync(ChatRoom room)
        {
            await _rooms.InsertOneAsync(room);
            return room;
        }

        public async Task<bool> AddMemberAsync(string roomId, string userId)
        {
            var filter = Builders<ChatRoom>.Filter.Eq(r => r.Id, roomId);
            var update = Builders<ChatRoom>.Update.AddToSet(r => r.MemberIds, userId);
            var result = await _rooms.UpdateOneAsync(filter, update);
            return result.ModifiedCount > 0 || result.MatchedCount > 0;
        }

        public async Task<bool> RemoveMemberAsync(string roomId, string userId)
        {
            var filter = Builders<ChatRoom>.Filter.Eq(r => r.Id, roomId);
            var update = Builders<ChatRoom>.Update.Pull(r => r.MemberIds, userId);
            var result = await _rooms.UpdateOneAsync(filter, update);
            return result.ModifiedCount > 0;
        }
    }
}
