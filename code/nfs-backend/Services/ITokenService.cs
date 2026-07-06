using System.Security.Claims;
using NafsApp.Models;

namespace NafsApp.Services
{
    public interface ITokenService
    {
        string GenerateAccessToken(User user, IEnumerable<string> roles);
        string GenerateRefreshToken();
        ClaimsPrincipal? GetPrincipalFromExpiredToken(string token);
    }
}
