using NafsApi.Services;
using MongoDB.Driver;

var envPathCandidates = new[]
{
    Path.Combine(Directory.GetCurrentDirectory(), ".env"),
    Path.Combine(AppContext.BaseDirectory, ".env"),
    Path.GetFullPath(Path.Combine(AppContext.BaseDirectory, "..", "..", "..", ".env")),
};
foreach (var candidate in envPathCandidates)
{
    if (File.Exists(candidate))
    {
        DotNetEnv.Env.Load(candidate);
        break;
    }
}

var builder = WebApplication.CreateBuilder(args);

// إضافة الخدمات
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// تسجيل خدمة 'نفس' كـ Singleton أو Scoped
builder.Services.AddHttpClient<NafsChatService>();

var mongoSection = builder.Configuration.GetSection("MongoSettings");
var mongoConnectionString = mongoSection["ConnectionString"];
var mongoDatabaseName = mongoSection["Database"] ?? "ChatDb";
if (string.IsNullOrWhiteSpace(mongoConnectionString))
{
    throw new InvalidOperationException("MongoSettings:ConnectionString is missing. Set MongoSettings__ConnectionString in .env.");
}

builder.Services.AddSingleton<IMongoClient>(_ => new MongoClient(mongoConnectionString));
builder.Services.AddSingleton(sp => sp.GetRequiredService<IMongoClient>().GetDatabase(mongoDatabaseName));
builder.Services.AddSingleton<NfsAssistantHistoryService>();

// تفعيل الـ CORS إذا كنت ستستخدمه مع React أو Angular
builder.Services.AddCors(options => {
    options.AddPolicy("AllowAll", b => b.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowAll");
app.UseAuthorization();
app.MapControllers();

app.Run();