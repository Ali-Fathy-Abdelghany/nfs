using System.Threading.Tasks;
using NafsApp.DTOs;

namespace NafsApp.Services
{
    public interface IAuthService
    {
        Task<bool> RegisterAsync(RegisterDto dto);
        Task<LoginResponseDto?> LoginAsync(LoginDto dto);
        Task<bool> LogoutAsync(int userId);
        Task<LoginResponseDto?> RefreshTokenAsync(RefreshTokenDto dto);
        Task<string?> ForgotPasswordAsync(ForgotPasswordDto dto);
        Task<bool> ResetPasswordAsync(ResetPasswordDto dto);
    }
}
