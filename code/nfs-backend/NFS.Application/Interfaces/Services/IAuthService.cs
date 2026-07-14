using System.Threading.Tasks;
using NFS.Application.DTOs;

namespace NFS.Application.Interfaces.Services
{
    public interface IAuthService
    {
        Task<bool> RegisterAsync(RegisterDto dto);
        Task<LoginResponseDto?> LoginAsync(LoginDto dto);
        Task<bool> LogoutAsync(int userId);
        Task<LoginResponseDto?> RefreshTokenAsync(RefreshTokenDto dto);
        Task<string?> ForgotPasswordAsync(ForgotPasswordDto dto);
        Task<bool> ResetPasswordAsync(ResetPasswordDto dto);
        Task<LoginResponseDto?> ExternalLoginGoogleAsync(GoogleExternalLoginDto dto);
    }
}
