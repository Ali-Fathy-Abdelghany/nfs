using MongoDB.Driver;
using NafsApi.Models;

namespace NafsApi.Services;

public class NfsAssistantHistoryService
{
    private readonly IMongoCollection<NfsAssistantMessage> _messages;

    public NfsAssistantHistoryService(IMongoDatabase database)
    {
        _messages = database.GetCollection<NfsAssistantMessage>("NfsAssistantMessages");
    }

    public async Task SaveExchangeAsync(string userId, string conversationId, string userMessage, string assistantReply)
    {
        var now = DateTime.UtcNow;
        var messages = new[]
        {
            new NfsAssistantMessage
            {
                UserId = userId,
                ConversationId = conversationId,
                Role = "user",
                Content = userMessage,
                Timestamp = now,
            },
            new NfsAssistantMessage
            {
                UserId = userId,
                ConversationId = conversationId,
                Role = "assistant",
                Content = assistantReply,
                Timestamp = now.AddMilliseconds(1),
            },
        };

        await _messages.InsertManyAsync(messages);
    }

    public async Task<IReadOnlyList<NfsAssistantMessage>> GetConversationAsync(string userId, string conversationId)
    {
        var filter = Builders<NfsAssistantMessage>.Filter.And(
            Builders<NfsAssistantMessage>.Filter.Eq(m => m.UserId, userId),
            Builders<NfsAssistantMessage>.Filter.Eq(m => m.ConversationId, conversationId));

        return await _messages
            .Find(filter)
            .SortBy(m => m.Timestamp)
            .Limit(100)
            .ToListAsync();
    }
}
