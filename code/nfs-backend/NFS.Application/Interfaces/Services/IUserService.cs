using NFS.Application.DTOs;

namespace NFS.Application.Interfaces.Services
{
    public interface IUserService
    {
        Task<UserProfileDto?> GetProfileAsync(int userId);
        Task<bool> UpdateProfileAsync(int userId, UpdateProfileDto dto);
    }
}
