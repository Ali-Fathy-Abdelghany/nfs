using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using MongoDB.Driver;
using NFS.Application.Helpers;
using NFS.Application.Interfaces;
using NFS.Application.Interfaces.Data;
using NFS.Application.Interfaces.Services;
using NFS.Application.Options;
using NFS.Application.Services;
using EmailOptions = NFS.Application.Options.EmailOptions;
using NFS.Chat;
using NFS.Chat.Extensions;
using NFS.Chat.Repositories;
using NFS.Infrastructure.Data;
using NFS.Infrastructure.Email;
using NFS.Infrastructure.Repositories;
using NFS.Infrastructure.Services;
using System.Text;

// Load NFS.API/.env into process environment before configuration is built.
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

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

// Swagger configuration with JWT Support
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo { Title = "NFS API", Version = "v1" });
    c.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Example: \"Bearer {token}\"",
        Name = "Authorization",
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });
    c.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
    {
        {
            new Microsoft.OpenApi.Models.OpenApiSecurityScheme
            {
                Reference = new Microsoft.OpenApi.Models.OpenApiReference
                {
                    Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

// DbContext (ConnectionStrings__DefaultConnection from .env)
var sqlConnection = builder.Configuration.GetConnectionString("DefaultConnection");
if (string.IsNullOrWhiteSpace(sqlConnection))
    throw new InvalidOperationException("ConnectionStrings:DefaultConnection is missing. Set ConnectionStrings__DefaultConnection in .env.");

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(sqlConnection)
        // Handwritten migrations sometimes lag the ModelSnapshot; schema is also
        // ensured in DbSeeder. Do not fail MigrateAsync on this warning alone.
        .ConfigureWarnings(w =>
            w.Ignore(Microsoft.EntityFrameworkCore.Diagnostics.RelationalEventId.PendingModelChangesWarning)));

// Map IApplicationDbContext to ApplicationDbContext
builder.Services.AddScoped<IApplicationDbContext>(provider =>
    provider.GetRequiredService<ApplicationDbContext>());

// Register JWT Settings Options
builder.Services.Configure<JwtSettings>(builder.Configuration.GetSection("JwtSettings"));

builder.Services.Configure<GoogleAuthOptions>(opts =>
{
    opts.ClientId = builder.Configuration["OAuth:Google:ClientId"] ?? string.Empty;
});

builder.Services.Configure<LiveKitOptions>(opts =>
{
    opts.Url = builder.Configuration["LIVEKIT_URL"] ?? string.Empty;
    opts.ApiKey = builder.Configuration["LIVEKIT_API_KEY"] ?? string.Empty;
    opts.ApiSecret = builder.Configuration["LIVEKIT_API_SECRET"] ?? string.Empty;
});

// JWT Authentication (JwtSettings__Secret from .env)
var secretKey = builder.Configuration["JwtSettings:Secret"];
if (string.IsNullOrWhiteSpace(secretKey))
    throw new InvalidOperationException("JwtSettings:Secret is missing. Set JwtSettings__Secret in .env.");
var key = Encoding.UTF8.GetBytes(secretKey);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false;
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = builder.Configuration["JwtSettings:Issuer"] ?? "NafsApp",
        ValidAudience = builder.Configuration["JwtSettings:Audience"] ?? "NafsAppUsers",
        IssuerSigningKey = new SymmetricSecurityKey(key)
    };
    // SignalR WebSocket connections cannot set custom headers, so the JWT is
    // passed as a query-string parameter instead.
    options.Events = new JwtBearerEvents
    {
        OnMessageReceived = context =>
        {
            var accessToken = context.Request.Query["access_token"];
            var path = context.HttpContext.Request.Path;
            if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/chatHub"))
            {
                context.Token = accessToken;
            }
            return Task.CompletedTask;
        }
    };
});

// Paymob options from flat env vars (PAYMOB_*)
builder.Services.Configure<PaymobOptions>(opts =>
{
    opts.SecretKey = builder.Configuration["PAYMOB_SECRET_KEY"] ?? string.Empty;
    opts.PublicKey = builder.Configuration["PAYMOB_PUBLIC_KEY"] ?? string.Empty;
    opts.ApiKey = builder.Configuration["PAYMOB_API_KEY"] ?? string.Empty;
    opts.Hmac = builder.Configuration["PAYMOB_HMAC"] ?? string.Empty;
    opts.IntegrationId = (builder.Configuration["PAYMOB_INTEGRATION_ID"] ?? string.Empty).Trim();
    opts.BaseUrl = builder.Configuration["PAYMOB_BASE_URL"]
        ?? builder.Configuration["Paymob:BaseUrl"]
        ?? "https://accept.paymob.com";
    opts.CallbackBaseUrl = builder.Configuration["PAYMOB_CALLBACK_BASE_URL"] ?? string.Empty;
    opts.FrontendBaseUrl = builder.Configuration["FRONTEND_BASE_URL"] ?? "http://localhost:5173";
});

// Register Repositories
builder.Services.AddScoped<IAppointmentRepository, AppointmentRepository>();
builder.Services.AddScoped<ISessionRepository, SessionRepository>();

// Email (SMTP) — Email__* from .env; soft-fails when not configured
builder.Services.Configure<EmailOptions>(opts =>
{
    opts.SmtpHost = builder.Configuration["Email:SmtpHost"] ?? string.Empty;
    opts.SmtpPort = int.TryParse(builder.Configuration["Email:SmtpPort"], out var port) ? port : 587;
    opts.SmtpUser = builder.Configuration["Email:SmtpUser"] ?? string.Empty;
    opts.SmtpPass = builder.Configuration["Email:SmtpPass"] ?? string.Empty;
    opts.FromAddress = builder.Configuration["Email:FromAddress"] ?? string.Empty;
    opts.FromName = builder.Configuration["Email:FromName"] ?? "Nafs";
    opts.Enabled = !bool.TryParse(builder.Configuration["Email:Enabled"], out var enabled) || enabled;
    opts.ReminderHoursBefore = int.TryParse(builder.Configuration["Email:ReminderHoursBefore"], out var hrs) ? hrs : 24;
    opts.ReminderPollMinutes = int.TryParse(builder.Configuration["Email:ReminderPollMinutes"], out var mins) ? mins : 15;
});
builder.Services.AddScoped<IEmailSender, SmtpEmailSender>();
builder.Services.AddScoped<IEmailNotificationService, EmailNotificationService>();
builder.Services.AddHostedService<AppointmentReminderHostedService>();

// Register Services
builder.Services.AddScoped<ITokenService, TokenService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<ITherapistService, TherapistService>();
builder.Services.AddScoped<IPatientService, PatientService>();
builder.Services.AddScoped<IAssessmentService, AssessmentService>();
builder.Services.AddScoped<ILiveKitMeetingService, LiveKitMeetingService>();

// Paymob when keys exist; otherwise FakePaymentGateway for local/dev without credentials.
builder.Services.AddHttpClient<PaymobPaymentGateway>();
builder.Services.AddScoped<FakePaymentGateway>();
builder.Services.AddScoped<IPaymentGateway>(sp =>
{
    var paymob = sp.GetRequiredService<Microsoft.Extensions.Options.IOptions<PaymobOptions>>().Value;
    return paymob.IsConfigured
        ? sp.GetRequiredService<PaymobPaymentGateway>()
        : sp.GetRequiredService<FakePaymentGateway>();
});

var mongoSection = builder.Configuration.GetSection("MongoSettings");
if (string.IsNullOrWhiteSpace(mongoSection["ConnectionString"]))
    throw new InvalidOperationException("MongoSettings:ConnectionString is missing. Set MongoSettings__ConnectionString in .env.");
builder.Services.AddChatServices(mongoSection);

// CORS — SetIsOriginAllowed is required alongside AllowCredentials for SignalR WebSockets.
// AllowAnyOrigin() + AllowCredentials() is forbidden by ASP.NET Core and throws at runtime.
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", b => b
        .SetIsOriginAllowed(_ => true)
        .AllowAnyMethod()
        .AllowAnyHeader()
        .AllowCredentials());
});

var app = builder.Build();

var paymobOpts = app.Services.GetRequiredService<Microsoft.Extensions.Options.IOptions<PaymobOptions>>().Value;
var startupLogger = app.Services.GetRequiredService<ILoggerFactory>().CreateLogger("Startup");
if (paymobOpts.IsConfigured)
    startupLogger.LogInformation("Payment gateway: Paymob (Intention API + unified checkout).");
else
    startupLogger.LogWarning("Payment gateway: FakePaymentGateway (Paymob keys missing — set PAYMOB_* in .env to enable real payments).");

var emailOpts = app.Services.GetRequiredService<Microsoft.Extensions.Options.IOptions<EmailOptions>>().Value;
if (emailOpts.IsConfigured)
    startupLogger.LogInformation("Email: SMTP enabled ({Host}:{Port}). Appointment reminders every {Mins} min.",
        emailOpts.SmtpHost, emailOpts.SmtpPort, emailOpts.ReminderPollMinutes);
else
    startupLogger.LogWarning(
        "Email: SMTP not configured or disabled — accept/reject and password reset will still work in DB, but no emails will be sent. Set Email__SmtpHost, Email__FromAddress, Email__SmtpUser, Email__SmtpPass in .env.");

var googleOpts = app.Services.GetRequiredService<Microsoft.Extensions.Options.IOptions<GoogleAuthOptions>>().Value;
if (googleOpts.IsConfigured)
    startupLogger.LogInformation("Google OAuth: ClientId configured.");
else
    startupLogger.LogWarning("Google OAuth: not configured — set OAuth__Google__ClientId in .env to enable Google sign-in.");

var liveKitOpts = app.Services.GetRequiredService<Microsoft.Extensions.Options.IOptions<LiveKitOptions>>().Value;
if (liveKitOpts.IsConfigured)
    startupLogger.LogInformation("LiveKit: video meetings enabled ({Url}).", liveKitOpts.Url);
else
    startupLogger.LogWarning("LiveKit: not configured — set LIVEKIT_URL, LIVEKIT_API_KEY, and LIVEKIT_API_SECRET in .env.");

// Seed SQL Database (users, roles, therapist/patient profiles)
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<ApplicationDbContext>();
        await DbSeeder.SeedAsync(context);
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "An error occurred during database seeding.");
    }
}

// Seed MongoDB chat messages (group rooms + DM between first two users)
try
{
    var chatRepository = app.Services.GetRequiredService<IChatRepository>();
    var mongoDatabase = app.Services.GetRequiredService<IMongoDatabase>();
    await ChatSeeder.SeedAsync(chatRepository, mongoDatabase);
}
catch (Exception ex)
{
    var logger = app.Services.GetRequiredService<ILogger<Program>>();
    logger.LogError(ex, "An error occurred during chat seeding.");
}

// Seed MongoDB therapist reviews + sync SQL Rating
try
{
    using var scope = app.Services.CreateScope();
    var mongoDatabase = scope.ServiceProvider.GetRequiredService<IMongoDatabase>();
    var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    var reviews = scope.ServiceProvider.GetRequiredService<NFS.Application.Interfaces.Repositories.ITherapistReviewRepository>();
    await TherapistReviewSeeder.SeedAsync(mongoDatabase, db, reviews);
}
catch (Exception ex)
{
    var logger = app.Services.GetRequiredService<ILogger<Program>>();
    logger.LogError(ex, "An error occurred during therapist review seeding.");
}

if (app.Environment.IsDevelopment() || true) // Enable swagger for testing in all environments
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "NFS Quiz API v1");
        c.RoutePrefix = "swagger";
    });
}

app.UseHttpsRedirection();

app.UseCors("AllowAll");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapHub<ChatHub>("/chatHub");

app.Run();
