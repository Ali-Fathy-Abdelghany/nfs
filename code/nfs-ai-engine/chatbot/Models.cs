namespace NafsApi.Models
{
    public class ChatRequest
    {
        public string Message { get; set; } = string.Empty;
        // يمكن إضافة UserId هنا لدعم الذاكرة لاحقاً
    }

    public class ChatResponse
    {
        public string Reply { get; set; } = string.Empty;
        public string Status { get; set; } = "success";
    }
}