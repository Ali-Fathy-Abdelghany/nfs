using Microsoft.EntityFrameworkCore;
using NFS.Application.DTOs;
using NFS.Application.Interfaces.Data;
using NFS.Application.Interfaces.Services;

namespace NFS.Application.Services
{
    public class UserService : IUserService
    {
        private readonly IApplicationDbContext _context;

        public UserService(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<UserProfileDto?> GetProfileAsync(int userId)
        {
            var user = await _context.Users
                .Include(u => u.UserRoles)
                    .ThenInclude(ur => ur.Role)
                .FirstOrDefaultAsync(u => u.UserId == userId);

            if (user == null) return null;

            return new UserProfileDto
            {
                UserId = user.UserId,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Email = user.Email,
                Phone = user.Phone,
                Gender = user.Gender?.ToString(),
                DateOfBirth = user.DateOfBirth,
                ProfileImageUrl = user.ProfileImageUrl,
                Country = user.Country,
                Governorate = user.Governorate,
                IsActive = user.IsActive,
                IsEmailVerified = user.IsEmailVerified,
                CreatedAt = user.CreatedAt,
                Roles = user.UserRoles.Select(ur => ur.Role!.RoleName).ToList()
            };
        }

        public async Task<bool> UpdateProfileAsync(int userId, UpdateProfileDto dto)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null) return false;

            user.FirstName = dto.FirstName;
            user.LastName = dto.LastName;
            user.Phone = dto.Phone;
            user.Gender = dto.Gender;
            user.DateOfBirth = dto.DateOfBirth;
            user.ProfileImageUrl = dto.ProfileImageUrl;
            user.Country = dto.Country;
            user.Governorate = dto.Governorate;
            user.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<IReadOnlyList<UserAvatarDto>> GetAvatarsByIdsAsync(IEnumerable<int> userIds)
        {
            var ids = userIds
                .Where(id => id > 0)
                .Distinct()
                .ToList();

            if (ids.Count == 0)
                return Array.Empty<UserAvatarDto>();

            var users = await _context.Users
                .AsNoTracking()
                .Where(u => ids.Contains(u.UserId))
                .Select(u => new UserAvatarDto
                {
                    UserId = u.UserId,
                    FirstName = u.FirstName,
                    LastName = u.LastName,
                    DisplayName = ((u.FirstName ?? "") + " " + (u.LastName ?? "")).Trim(),
                    ProfileImageUrl = u.ProfileImageUrl
                })
                .ToListAsync();

            return users;
        }
    }
}
