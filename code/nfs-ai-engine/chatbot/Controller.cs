using Microsoft.AspNetCore.Mvc;
using NafsApi.Models;
using NafsApi.Services;

namespace NafsApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ChatController : ControllerBase
    {
        private readonly NafsChatService _nafsService;
        private readonly NfsAssistantHistoryService _historyService;
        private readonly ILogger<ChatController> _logger;

        public ChatController(
            NafsChatService nafsService,
            NfsAssistantHistoryService historyService,
            ILogger<ChatController> logger)
        {
            _nafsService = nafsService;
            _historyService = historyService;
            _logger = logger;
        }

        [HttpPost("talk-to-nafs")]
        public async Task<ActionResult<ChatResponse>> PostMessage([FromBody] ChatRequest request)
        {
            if (string.IsNullOrEmpty(request.Message))
                return BadRequest("الرسالة لا يمكن أن تكون فارغة");

            try
            {
                var reply = await _nafsService.GetDoctorResponseAsync(request.Message);
                var userId = string.IsNullOrWhiteSpace(request.UserId) ? "anonymous" : request.UserId.Trim();
                var conversationId = string.IsNullOrWhiteSpace(request.ConversationId)
                    ? $"nfs_{userId}"
                    : request.ConversationId.Trim();

                try
                {
                    await _historyService.SaveExchangeAsync(userId, conversationId, request.Message, reply);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Failed to store NFS assistant exchange in MongoDB.");
                }

                return Ok(new ChatResponse { Reply = reply, ConversationId = conversationId });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "NFS assistant request failed.");
                return StatusCode(500, new ChatResponse
                {
                    Reply = $"تعذر الاتصال بمزود الذكاء الاصطناعي: {ex.Message}",
                    Status = "error"
                });
            }
        }

        [HttpGet("history")]
        public async Task<IActionResult> GetHistory([FromQuery] string userId, [FromQuery] string? conversationId)
        {
            var resolvedUserId = string.IsNullOrWhiteSpace(userId) ? "anonymous" : userId.Trim();
            var resolvedConversationId = string.IsNullOrWhiteSpace(conversationId)
                ? $"nfs_{resolvedUserId}"
                : conversationId.Trim();

            var messages = await _historyService.GetConversationAsync(resolvedUserId, resolvedConversationId);
            return Ok(new
            {
                conversationId = resolvedConversationId,
                messages = messages.Select(m => new
                {
                    id = m.Id,
                    role = m.Role,
                    text = m.Content,
                    timestamp = m.Timestamp,
                })
            });
        }
    }
}