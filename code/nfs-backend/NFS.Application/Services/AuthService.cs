using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using NFS.Application.DTOs;
using NFS.Application.Helpers;
using NFS.Application.Interfaces.Data;
using NFS.Application.Interfaces.Services;
using NFS.Application.Options;
using NFS.Domain.Entities;
using Google.Apis.Auth;

namespace NFS.Application.Services
{
    public class AuthService : IAuthService
    {
        private const string GoogleProvider = "Google";

        private readonly IApplicationDbContext _context;
        private readonly ITokenService _tokenService;
        private readonly IEmailNotificationService _notifications;
        private readonly GoogleAuthOptions _googleOptions;
        private readonly ILogger<AuthService> _logger;

        public AuthService(
            IApplicationDbContext context,
            ITokenService tokenService,
            IEmailNotificationService notifications,
            IOptions<GoogleAuthOptions> googleOptions,
            ILogger<AuthService> logger)
        {
            _context = context;
            _tokenService = tokenService;
            _notifications = notifications;
            _googleOptions = googleOptions.Value;
            _logger = logger;
        }

        public async Task<bool> RegisterAsync(RegisterDto dto)
        {
            var emailLower = dto.Email.ToLower().Trim();
            var exists = await _context.Users.AnyAsync(u => u.Email.ToLower() == emailLower);
            if (exists) return false;

            var user = new User
            {
                FirstName = dto.FirstName,
                LastName = dto.LastName,
                Email = emailLower,
                PasswordHash = PasswordHelper.HashPassword(dto.Password),
                Phone = dto.Phone,
                Gender = dto.Gender,
                DateOfBirth = dto.DateOfBirth,
                ProfileImageUrl = dto.ProfileImageUrl,
                Country = dto.Country,
                Governorate = dto.Governorate,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            var roleName = dto.Role.ToString();
            var role = await _context.Roles.FirstOrDefaultAsync(r => r.RoleName == roleName)
                ?? await _context.Roles.FirstOrDefaultAsync(r => r.RoleName == "CLIENT");

            if (role != null)
            {
                _context.UserRoles.Add(new UserRoleMapping
                {
                    UserId = user.UserId,
                    RoleId = role.RoleId,
                    AssignedAt = DateTime.UtcNow
                });
                await _context.SaveChangesAsync();
            }

            return true;
        }

        public async Task<LoginResponseDto?> LoginAsync(LoginDto dto)
        {
            var emailLower = dto.Email.ToLower().Trim();
            var user = await _context.Users
                .Include(u => u.UserRoles)
                    .ThenInclude(ur => ur.Role)
                .FirstOrDefaultAsync(u => u.Email.ToLower() == emailLower);

            if (user == null || !user.IsActive) return null;
            if (string.IsNullOrEmpty(user.PasswordHash)
                || !PasswordHelper.VerifyPassword(dto.Password, user.PasswordHash))
                return null;

            return await IssueLoginResponseAsync(user);
        }

        public async Task<LoginResponseDto?> ExternalLoginGoogleAsync(GoogleExternalLoginDto dto)
        {
            if (!_googleOptions.IsConfigured)
            {
                _logger.LogError("Google OAuth is not configured. Set OAuth__Google__ClientId in .env.");
                return null;
            }

            GoogleJsonWebSignature.Payload payload;
            try
            {
                var settings = new GoogleJsonWebSignature.ValidationSettings
                {
                    Audience = new[] { _googleOptions.ClientId }
                };
                payload = await GoogleJsonWebSignature.ValidateAsync(dto.IdToken, settings);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Google ID token validation failed.");
                return null;
            }

            if (string.IsNullOrWhiteSpace(payload.Subject))
            {
                _logger.LogWarning("Google ID token missing subject.");
                return null;
            }

            if (payload.EmailVerified != true || string.IsNullOrWhiteSpace(payload.Email))
            {
                _logger.LogWarning("Google account email is missing or not verified.");
                return null;
            }

            var emailLower = payload.Email.ToLower().Trim();
            var providerKey = payload.Subject;

            var linked = await _context.ExternalLogins
                .Include(e => e.User!)
                    .ThenInclude(u => u!.UserRoles)
                        .ThenInclude(ur => ur.Role)
                .FirstOrDefaultAsync(e => e.Provider == GoogleProvider && e.ProviderKey == providerKey);

            User? user = linked?.User;

            if (user == null)
            {
                user = await _context.Users
                    .Include(u => u.UserRoles)
                        .ThenInclude(ur => ur.Role)
                    .FirstOrDefaultAsync(u => u.Email.ToLower() == emailLower);

                if (user != null)
                {
                    if (!user.IsActive) return null;

                    _context.ExternalLogins.Add(new ExternalLogin
                    {
                        Provider = GoogleProvider,
                        ProviderKey = providerKey,
                        UserId = user.UserId,
                        CreatedAt = DateTime.UtcNow
                    });

                    if (!user.IsEmailVerified)
                        user.IsEmailVerified = true;

                    if (string.IsNullOrWhiteSpace(user.ProfileImageUrl) && !string.IsNullOrWhiteSpace(payload.Picture))
                        user.ProfileImageUrl = payload.Picture;

                    user.UpdatedAt = DateTime.UtcNow;
                    await _context.SaveChangesAsync();
                }
                else
                {
                    user = await CreateGoogleClientUserAsync(payload, emailLower, providerKey);
                }
            }
            else if (!user.IsActive)
            {
                return null;
            }

            // Ensure roles are loaded for newly created / linked paths
            if (user.UserRoles == null || !user.UserRoles.Any() || user.UserRoles.Any(ur => ur.Role == null))
            {
                user = await _context.Users
                    .Include(u => u.UserRoles)
                        .ThenInclude(ur => ur.Role)
                    .FirstAsync(u => u.UserId == user.UserId);
            }

            return await IssueLoginResponseAsync(user);
        }

        public async Task<bool> LogoutAsync(int userId)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null) return false;

            user.RefreshToken = null;
            user.RefreshTokenExpiryTime = null;
            user.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<LoginResponseDto?> RefreshTokenAsync(RefreshTokenDto dto)
        {
            var principal = _tokenService.GetPrincipalFromExpiredToken(dto.AccessToken);
            if (principal == null) return null;

            var userIdClaim = principal.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId)) return null;

            var user = await _context.Users
                .Include(u => u.UserRoles)
                    .ThenInclude(ur => ur.Role)
                .FirstOrDefaultAsync(u => u.UserId == userId);

            if (user == null || user.RefreshToken != dto.RefreshToken || user.RefreshTokenExpiryTime <= DateTime.UtcNow)
                return null;

            return await IssueLoginResponseAsync(user);
        }

        public async Task<string?> ForgotPasswordAsync(ForgotPasswordDto dto)
        {
            var emailLower = dto.Email.ToLower().Trim();
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == emailLower);
            if (user == null) return null;

            var resetToken = Guid.NewGuid().ToString("N");
            user.PasswordResetToken = resetToken;
            user.PasswordResetTokenExpiry = DateTime.UtcNow.AddMinutes(15);
            user.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            var sent = await _notifications.SendPasswordResetAsync(user.Email, resetToken);
            if (!sent)
            {
                _logger.LogWarning(
                    "Password reset email was not sent for {Email}. Token is stored; check Email__* SMTP settings.",
                    user.Email);
            }

            return resetToken;
        }

        public async Task<bool> ResetPasswordAsync(ResetPasswordDto dto)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u =>
                u.PasswordResetToken == dto.Token &&
                u.PasswordResetTokenExpiry > DateTime.UtcNow);

            if (user == null) return false;

            user.PasswordHash = PasswordHelper.HashPassword(dto.NewPassword);
            user.PasswordResetToken = null;
            user.PasswordResetTokenExpiry = null;
            user.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return true;
        }

        private async Task<User> CreateGoogleClientUserAsync(
            GoogleJsonWebSignature.Payload payload,
            string emailLower,
            string providerKey)
        {
            var given = payload.GivenName?.Trim();
            var family = payload.FamilyName?.Trim();
            var fullName = payload.Name?.Trim();

            string firstName;
            string lastName;
            if (!string.IsNullOrWhiteSpace(given))
            {
                firstName = given;
                lastName = string.IsNullOrWhiteSpace(family) ? given : family;
            }
            else if (!string.IsNullOrWhiteSpace(fullName))
            {
                var parts = fullName.Split(' ', StringSplitOptions.RemoveEmptyEntries);
                firstName = parts[0];
                lastName = parts.Length > 1 ? string.Join(' ', parts.Skip(1)) : parts[0];
            }
            else
            {
                firstName = emailLower.Split('@')[0];
                lastName = firstName;
            }

            // Unusable random hash so email/password login fails until the user sets a password.
            var user = new User
            {
                FirstName = firstName,
                LastName = lastName,
                Email = emailLower,
                PasswordHash = PasswordHelper.HashPassword(Guid.NewGuid().ToString("N") + Guid.NewGuid().ToString("N")),
                ProfileImageUrl = payload.Picture,
                IsActive = true,
                IsEmailVerified = true,
                CreatedAt = DateTime.UtcNow
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            var role = await _context.Roles.FirstOrDefaultAsync(r => r.RoleName == "CLIENT");
            if (role != null)
            {
                _context.UserRoles.Add(new UserRoleMapping
                {
                    UserId = user.UserId,
                    RoleId = role.RoleId,
                    AssignedAt = DateTime.UtcNow
                });
            }

            _context.ExternalLogins.Add(new ExternalLogin
            {
                Provider = GoogleProvider,
                ProviderKey = providerKey,
                UserId = user.UserId,
                CreatedAt = DateTime.UtcNow
            });

            await _context.SaveChangesAsync();

            user = await _context.Users
                .Include(u => u.UserRoles)
                    .ThenInclude(ur => ur.Role)
                .FirstAsync(u => u.UserId == user.UserId);

            return user;
        }

        private async Task<LoginResponseDto> IssueLoginResponseAsync(User user)
        {
            var roles = user.UserRoles.Select(ur => ur.Role!.RoleName).ToList();
            var accessToken = _tokenService.GenerateAccessToken(user, roles);
            var refreshToken = _tokenService.GenerateRefreshToken();

            user.RefreshToken = refreshToken;
            user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(7);
            user.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            var patientId = await _context.Patients
                .Where(p => p.UserId == user.UserId)
                .Select(p => (int?)p.PatientId)
                .FirstOrDefaultAsync();
            var therapistId = await _context.Therapists
                .Where(t => t.UserId == user.UserId)
                .Select(t => (int?)t.TherapistId)
                .FirstOrDefaultAsync();

            return new LoginResponseDto
            {
                AccessToken = accessToken,
                RefreshToken = refreshToken,
                Expiry = DateTime.UtcNow.AddMinutes(60),
                UserId = user.UserId,
                Email = user.Email,
                FirstName = user.FirstName,
                LastName = user.LastName,
                ProfileImageUrl = user.ProfileImageUrl,
                Roles = roles,
                PatientId = patientId,
                TherapistId = therapistId
            };
        }
    }
}
