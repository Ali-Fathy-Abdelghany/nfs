using MongoDB.Driver;
using NFS.Chat.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace NFS.Chat.Repositories
{
    public class ChatRepository : IChatRepository
    {
        private readonly IMongoDatabase _database;
        private readonly IMongoCollection<ChatMessage> _collection;

        public ChatRepository(IMongoDatabase database)
        {
            _database = database;
            // Collection name can be "ChatMessages"
            _collection = _database.GetCollection<ChatMessage>("ChatMessages");
        }

        public async Task SaveMessageAsync(ChatMessage message)
        {
            await _collection.InsertOneAsync(message);
        }

        public async Task<IList<ChatMessage>> GetMessagesByRoomAsync(string roomId)
        {
            var filter = Builders<ChatMessage>.Filter.Eq(m => m.RoomId, roomId);
            var result = await _collection.Find(filter).SortBy(m => m.Timestamp).ToListAsync();
            return result;
        }

        public async Task<IList<ChatMessage>> GetPrivateMessagesAsync(string userA, string userB)
        {
            var filter = Builders<ChatMessage>.Filter.And(
                Builders<ChatMessage>.Filter.Eq(m => m.RoomId, $"private_{(userA.CompareTo(userB) < 0 ? userA + "_" + userB : userB + "_" + userA)}"),
                Builders<ChatMessage>.Filter.Or(
                    Builders<ChatMessage>.Filter.Eq(m => m.SenderId, userA),
                    Builders<ChatMessage>.Filter.Eq(m => m.SenderId, userB)
                )
            );
            var result = await _collection.Find(filter).SortBy(m => m.Timestamp).ToListAsync();
            return result;
        }
    }
}
