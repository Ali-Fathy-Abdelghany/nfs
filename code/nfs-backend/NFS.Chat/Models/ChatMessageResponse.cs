using System;

namespace NFS.Chat.Models;

/// <summary>API/SignalR response shape; not persisted to Mongo.</summary>
public class ChatMessageResponse
{
    public string Id { get; set; } = string.Empty;
    public string RoomId { get; set; } = string.Empty;
    public string SenderId { get; set; } = string.Empty;
    public string RecipientId { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; }
    public string? SenderName { get; set; }
    public string? SenderAvatarUrl { get; set; }
}
