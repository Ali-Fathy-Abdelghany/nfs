using OpenAI.Chat;
using System.ClientModel;

namespace NafsApi.Services
{
    public class NafsChatService
    {
        private readonly ChatClient _client;
        private const string SystemPrompt = @"
            أنت طبيب نفسي محترف، حكيم، وهادئ اسمك 'نفس'. 
            خصائص شخصيتك:
            1. تتحدث بلغة عربية فصحى رقيقة أو لهجة بيضاء مفهومة، بأسلوب يبعث على الطمأنينة.
            2. وظيفتك هي الاستماع بعمق، إظهار التعاطف، وتقديم توجيهات نفسية مبنية على العلاج السلوكي المعرفي (CBT).
            3. لا تقاطع المستخدم، وابدأ دائماً بجمل مثل 'أنا أسمعك جيداً'، 'أقدر شجاعتك في مشاركة هذا'.
            4. إذا شعرت بخطر (انتحار أو إيذاء)، وجه المستخدم فوراً لطلب المساعدة الطبية الطارئة مع تقديم أرقام الطوارئ في بلده.
            5. أنت لست مجرد برنامج، أنت 'نفس' الطبيب الذي يهتم بمساعدة الناس للوصول للسلام الداخلي.";

        public NafsChatService(IConfiguration config)
        {
            var apiKey = config["OpenAI:ApiKey"];
            // استخدام موديل gpt-4o للحصول على أفضل نتائج تحليل نفسي
            _client = new ChatClient("gpt-4o", apiKey);
        }

        public async Task<string> GetDoctorResponseAsync(string userMessage)
        {
            List<ChatMessage> messages = new()
            {
                new SystemChatMessage(SystemPrompt),
                new UserChatMessage(userMessage)
            };

            ChatCompletion completion = await _client.CompleteChatAsync(messages);
            return completion.Content[0].Text;
        }
    }
}