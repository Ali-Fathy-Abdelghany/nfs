using System.Security.Claims;
using NFS.Domain.Entities;

namespace NFS.Application.Interfaces.Services
{
    public interface ITokenService
    {
        string GenerateAccessToken(User user, IEnumerable<string> roles);
        string GenerateRefreshToken();
        ClaimsPrincipal? GetPrincipalFromExpiredToken(string token);
    }
}
