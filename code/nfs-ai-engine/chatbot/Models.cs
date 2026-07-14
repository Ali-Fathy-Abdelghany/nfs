namespace NafsApi.Models
{
    public class ChatRequest
    {
        public string Message { get; set; } = string.Empty;
        public string UserId { get; set; } = "anonymous";
        public string ConversationId { get; set; } = "default";
    }

    public class ChatResponse
    {
        public string Reply { get; set; } = string.Empty;
        public string Status { get; set; } = "success";
        public string ConversationId { get; set; } = "default";
    }
}