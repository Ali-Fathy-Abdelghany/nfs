using System;
using System.Linq;
using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Builder;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using NafsApp.Data;
using NafsApp.Helpers;
using NafsApp.Models;
using NafsApp.Services;

namespace NafsApp
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
                ?? "Server=.;Database=NafsApp;Trusted_Connection=True;TrustServerCertificate=True;";

            builder.Services.AddDbContext<AppDbContext>(options =>
                options.UseSqlServer(connectionString));

            var jwtSection = builder.Configuration.GetSection(JwtSettings.SectionName);
            builder.Services.Configure<JwtSettings>(jwtSection);
            var jwtSettings = jwtSection.Get<JwtSettings>() ?? new JwtSettings();
            if (string.IsNullOrWhiteSpace(jwtSettings.Secret))
            {
                throw new InvalidOperationException(
                    "JWT secret is not configured. Copy appsettings.Development.json.example to appsettings.Development.json and set JwtSettings:Secret.");
            }
            var key = Encoding.UTF8.GetBytes(jwtSettings.Secret);

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
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(key),
                    ValidateIssuer = true,
                    ValidIssuer = jwtSettings.Issuer,
                    ValidateAudience = true,
                    ValidAudience = jwtSettings.Audience,
                    ValidateLifetime = true,
                    ClockSkew = TimeSpan.Zero
                };
            });

            builder.Services.AddAuthorization();

            builder.Services.AddScoped<ITokenService, TokenService>();
            builder.Services.AddScoped<IAuthService, AuthService>();
            builder.Services.AddScoped<IUserService, UserService>();
            builder.Services.AddScoped<ITherapistService, TherapistService>();
            builder.Services.AddScoped<IPatientService, PatientService>();
            builder.Services.AddScoped<IAssessmentService, AssessmentService>();

            builder.Services.AddControllers();

            builder.Services.AddCors(options =>
            {
                options.AddPolicy("AllowFrontend", policy =>
                {
                    policy.AllowAnyOrigin()
                          .AllowAnyHeader()
                          .AllowAnyMethod();
                });
            });

            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen(options =>
            {
                options.SwaggerDoc("v1", new OpenApiInfo
                {
                    Title = "Nafs API",
                    Version = "v1",
                    Description = "Authentication and user profile APIs for the Nafs application."
                });

                options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
                {
                    Name = "Authorization",
                    Type = SecuritySchemeType.Http,
                    Scheme = "bearer",
                    BearerFormat = "JWT",
                    In = ParameterLocation.Header,
                    Description = "Enter your JWT token. Example: Bearer eyJhbGciOiJIUzI1NiIs..."
                });

                options.AddSecurityRequirement(new OpenApiSecurityRequirement
                {
                    {
                        new OpenApiSecurityScheme
                        {
                            Reference = new OpenApiReference
                            {
                                Type = ReferenceType.SecurityScheme,
                                Id = "Bearer"
                            }
                        },
                        Array.Empty<string>()
                    }
                });
            });

            var app = builder.Build();

            using (var scope = app.Services.CreateScope())
            {
                var services = scope.ServiceProvider;
                try
                {
                    var db = services.GetRequiredService<AppDbContext>();

                    if (app.Environment.IsDevelopment()
                        && builder.Configuration.GetValue<bool>("RecreateDatabaseOnStartup"))
                    {
                        db.Database.EnsureDeleted();
                    }

                    db.Database.Migrate();
                    SeedDatabase(db);
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"An error occurred during database seeding: {ex.Message}");
                }
            }

            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI(options =>
                {
                    options.SwaggerEndpoint("/swagger/v1/swagger.json", "Nafs API v1");
                    options.RoutePrefix = "swagger";
                });
            }

            app.UseMiddleware<NafsApp.Middlewares.GlobalExceptionMiddleware>();
            app.UseRouting();
            app.UseCors("AllowFrontend");
            app.UseAuthentication();
            app.UseAuthorization();
            app.MapControllers();

            app.Run();
        }

        private static void SeedDatabase(AppDbContext db)
        {
            var clientRoleName = NafsApp.Enums.UserRole.CLIENT.ToString();
            var therapistRoleName = NafsApp.Enums.UserRole.THERAPIST.ToString();
            var adminRoleName = NafsApp.Enums.UserRole.ADMIN.ToString();

            if (!db.Roles.Any(r => r.RoleName == clientRoleName))
            {
                db.Roles.Add(new Role { RoleName = clientRoleName, Description = "Client User Role", CreatedAt = DateTime.UtcNow });
            }
            if (!db.Roles.Any(r => r.RoleName == therapistRoleName))
            {
                db.Roles.Add(new Role { RoleName = therapistRoleName, Description = "Therapist User Role", CreatedAt = DateTime.UtcNow });
            }
            if (!db.Roles.Any(r => r.RoleName == adminRoleName))
            {
                db.Roles.Add(new Role { RoleName = adminRoleName, Description = "Administrator User Role", CreatedAt = DateTime.UtcNow });
            }

            db.SaveChanges();

            var adminEmail = "admin@nafs.com";
            if (!db.Users.Any(u => u.Email == adminEmail))
            {
                var adminUser = new User
                {
                    FirstName = "System",
                    LastName = "Admin",
                    Email = adminEmail,
                    PasswordHash = PasswordHelper.HashPassword("Admin123!"),
                    Phone = "01000000000",
                    Gender = NafsApp.Enums.Gender.Male,
                    DateOfBirth = new DateTime(1985, 1, 1),
                    IsActive = true,
                    IsEmailVerified = true,
                    CreatedAt = DateTime.UtcNow
                };

                db.Users.Add(adminUser);
                db.SaveChanges();

                var adminRole = db.Roles.First(r => r.RoleName == adminRoleName);
                db.UserRoles.Add(new UserRoleMapping
                {
                    UserId = adminUser.UserId,
                    RoleId = adminRole.RoleId,
                    AssignedAt = DateTime.UtcNow
                });

                db.SaveChanges();
                Console.WriteLine("Database seeded successfully with roles and admin user.");
            }
        }
    }
}
