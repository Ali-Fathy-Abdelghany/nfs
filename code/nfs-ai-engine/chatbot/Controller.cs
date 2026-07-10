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

        public ChatController(NafsChatService nafsService)
        {
            _nafsService = nafsService;
        }

        [HttpPost("talk-to-nafs")]
        public async Task<ActionResult<ChatResponse>> PostMessage([FromBody] ChatRequest request)
        {
            if (string.IsNullOrEmpty(request.Message))
                return BadRequest("الرسالة لا يمكن أن تكون فارغة");

            try
            {
                var reply = await _nafsService.GetDoctorResponseAsync(request.Message);
                return Ok(new ChatResponse { Reply = reply });
            }
            catch (Exception ex)
            {
                // تسجيل الخطأ داخلياً وإرجاع رسالة مهذبة
                return StatusCode(500, new ChatResponse { Reply = "عذراً، أحتاج لبرهة من الوقت لأجمع أفكاري. حاول مجدداً.", Status = "error" });
            }
        }
    }
}