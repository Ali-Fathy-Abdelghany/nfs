using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace NFS.Chat.Models;

public class TherapistReview
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = ObjectId.GenerateNewId().ToString();

    public int TherapistId { get; set; }
    public int PatientId { get; set; }
    public int? UserId { get; set; }
    public string AuthorName { get; set; } = "مراجع";
    public int Stars { get; set; }
    public string Comment { get; set; } = string.Empty;
    public bool IsAnonymous { get; set; } = true;
    public int? AppointmentId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
