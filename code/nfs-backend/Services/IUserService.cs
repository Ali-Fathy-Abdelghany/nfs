using System.Threading.Tasks;
using NafsApp.DTOs;

namespace NafsApp.Services
{
    public interface IUserService
    {
        Task<UserProfileDto?> GetProfileAsync(int userId);
        Task<bool> UpdateProfileAsync(int userId, UpdateProfileDto dto);
    }
}
