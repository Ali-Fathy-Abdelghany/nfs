using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace NafsApi.Models;

public class NfsAssistantMessage
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = ObjectId.GenerateNewId().ToString();

    public string UserId { get; set; } = "anonymous";
    public string ConversationId { get; set; } = "default";
    public string Role { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
}
