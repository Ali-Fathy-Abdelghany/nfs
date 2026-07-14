using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace NafsApi.Services
{
    public class NafsChatService
    {
        private static readonly JsonSerializerOptions JsonOptions = new()
        {
            DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        };

        private readonly HttpClient _httpClient;
        private readonly ILogger<NafsChatService> _logger;
        private readonly string _apiKey;
        private readonly string _model;
        private const string SystemPrompt = @"
            أنت طبيب نفسي محترف، حكيم، وهادئ اسمك 'نفس'. 
            خصائص شخصيتك:
            1. تتحدث بلغة عربية فصحى رقيقة أو لهجة بيضاء مفهومة، بأسلوب يبعث على الطمأنينة.
            2. وظيفتك هي الاستماع بعمق، إظهار التعاطف، وتقديم توجيهات نفسية مبنية على العلاج السلوكي المعرفي (CBT).
            3. لا تقاطع المستخدم، وابدأ دائماً بجمل مثل 'أنا أسمعك جيداً'، 'أقدر شجاعتك في مشاركة هذا'.
            4. إذا شعرت بخطر (انتحار أو إيذاء)، وجه المستخدم فوراً لطلب المساعدة الطبية الطارئة مع تقديم أرقام الطوارئ في بلده.
            5. أنت لست مجرد برنامج، أنت 'نفس' الطبيب الذي يهتم بمساعدة الناس للوصول للسلام الداخلي.";

        public NafsChatService(IConfiguration config, HttpClient httpClient, ILogger<NafsChatService> logger)
        {
            _apiKey = config["Gemini:ApiKey"] ?? config["GEMINI_API_KEY"] ?? string.Empty;
            _model = config["Gemini:Model"] ?? "gemini-2.5-flash";
            if (string.IsNullOrWhiteSpace(_apiKey))
            {
                throw new InvalidOperationException("Gemini API key is missing. Set Gemini__ApiKey in .env.");
            }

            _httpClient = httpClient;
            _logger = logger;
            _httpClient.BaseAddress = new Uri("https://generativelanguage.googleapis.com/v1beta/");
        }

        public async Task<string> GetDoctorResponseAsync(string userMessage)
        {
            var request = new GeminiGenerateRequest(
                new GeminiContent([new GeminiPart(SystemPrompt)]),
                [
                    new GeminiContent([new GeminiPart(userMessage)], "user")
                ]);

            var endpoint = $"models/{Uri.EscapeDataString(_model)}:generateContent?key={Uri.EscapeDataString(_apiKey)}";
            using var response = await _httpClient.PostAsJsonAsync(endpoint, request, JsonOptions);
            if (!response.IsSuccessStatusCode)
            {
                var error = await response.Content.ReadAsStringAsync();
                if ((int)response.StatusCode == 429)
                {
                    _logger.LogWarning("Gemini quota/rate-limit response for model {Model}: {ErrorBody}", _model, error);
                    return GetQuotaFallbackResponse(userMessage);
                }

                if ((int)response.StatusCode == 404)
                {
                    _logger.LogWarning("Gemini model is unavailable for model {Model}: {ErrorBody}", _model, error);
                    return GetQuotaFallbackResponse(userMessage);
                }

                _logger.LogError("Gemini request failed for model {Model} with status {StatusCode}: {ErrorBody}", _model, (int)response.StatusCode, error);
                throw new InvalidOperationException($"Gemini request failed ({(int)response.StatusCode}): {error}");
            }

            var completion = await response.Content.ReadFromJsonAsync<GeminiGenerateResponse>(JsonOptions);
            var text = completion?.Candidates?.FirstOrDefault()?.Content?.Parts?.FirstOrDefault()?.Text;
            if (string.IsNullOrWhiteSpace(text))
            {
                throw new InvalidOperationException("Gemini response did not include text content.");
            }

            return text;
        }

        private static string GetQuotaFallbackResponse(string userMessage)
        {
            var normalized = userMessage.Trim();
            if (normalized.Contains("قلق", StringComparison.OrdinalIgnoreCase) ||
                normalized.Contains("توتر", StringComparison.OrdinalIgnoreCase) ||
                normalized.Contains("panic", StringComparison.OrdinalIgnoreCase))
            {
                return """
                    أنا أسمعك جيداً، ويبدو أن هناك توتراً يحتاج لتهدئة لطيفة الآن.

                    جرب هذه الخطوات لمدة دقيقة:
                    1. خذ شهيقاً ببطء من الأنف 4 ثوان.
                    2. احبس النفس بهدوء ثانيتين.
                    3. أخرج الزفير ببطء 6 ثوان.
                    4. سمِّ 3 أشياء تراها حولك وشيئين تسمعهما وشيئاً تلمسه.

                    ملاحظة: الرد الحالي محلي مؤقت لأن حد استخدام Gemini لهذا المشروع تم تجاوزه.
                    """;
            }

            return """
                أنا هنا معك. خذ لحظة هادئة، واكتب ما تشعر به في جملة قصيرة: ما أكثر فكرة تضغط عليك الآن؟

                يمكنك أيضاً تجربة تمرين بسيط: تنفس ببطء، ثم اسأل نفسك: هل أحتاج حلاً فورياً، أم فقط مساحة آمنة أرتب فيها أفكاري؟

                ملاحظة: الرد الحالي محلي مؤقت لأن حد استخدام Gemini لهذا المشروع تم تجاوزه.
                """;
        }

        private sealed record GeminiGenerateRequest(
            GeminiContent SystemInstruction,
            IReadOnlyList<GeminiContent> Contents);

        private sealed record GeminiContent(
            IReadOnlyList<GeminiPart> Parts,
            string? Role = null);

        private sealed record GeminiPart(string Text);

        private sealed record GeminiGenerateResponse(IReadOnlyList<GeminiCandidate>? Candidates);

        private sealed record GeminiCandidate(GeminiContent? Content);
    }
}