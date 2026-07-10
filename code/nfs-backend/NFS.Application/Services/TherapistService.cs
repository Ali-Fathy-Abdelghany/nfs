using Microsoft.EntityFrameworkCore;
using NFS.Application.DTOs;
using NFS.Application.Interfaces.Data;
using NFS.Application.Interfaces.Services;
using NFS.Domain.Entities;

namespace NFS.Application.Services
{
    public class TherapistService : ITherapistService
    {
        private readonly IApplicationDbContext _context;

        public TherapistService(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<TherapistDto>> GetAllTherapistsAsync()
        {
            return await _context.Therapists
                .Include(t => t.User)
                .Select(t => MapToDto(t))
                .ToListAsync();
        }

        public async Task<TherapistDto?> GetTherapistByIdAsync(int id)
        {
            var therapist = await _context.Therapists
                .Include(t => t.User)
                .FirstOrDefaultAsync(t => t.TherapistId == id);
            return therapist == null ? null : MapToDto(therapist);
        }

        public async Task<TherapistDto?> GetTherapistByUserIdAsync(int userId)
        {
            var therapist = await _context.Therapists
                .Include(t => t.User)
                .FirstOrDefaultAsync(t => t.UserId == userId);
            return therapist == null ? null : MapToDto(therapist);
        }

        public async Task<TherapistDto> CreateTherapistAsync(CreateTherapistDto dto)
        {
            var user = await _context.Users.FindAsync(dto.UserId)
                ?? throw new ArgumentException($"User with ID {dto.UserId} not found.");

            if (await _context.Therapists.AnyAsync(t => t.UserId == dto.UserId))
                throw new InvalidOperationException($"Therapist profile already exists for User ID {dto.UserId}.");

            var therapist = new Therapist
            {
                UserId = dto.UserId,
                Specialization = dto.Specialization,
                Bio = dto.Bio,
                ExperienceYears = dto.ExperienceYears,
                HourlyRate = dto.HourlyRate,
                Qualifications = dto.Qualifications,
                CreatedAt = DateTime.UtcNow
            };

            _context.Therapists.Add(therapist);
            await _context.SaveChangesAsync();
            therapist.User = user;
            return MapToDto(therapist);
        }

        public async Task<bool> UpdateTherapistAsync(int id, UpdateTherapistDto dto)
        {
            var therapist = await _context.Therapists.FindAsync(id);
            if (therapist == null) return false;

            therapist.Specialization = dto.Specialization;
            therapist.Bio = dto.Bio;
            therapist.ExperienceYears = dto.ExperienceYears;
            therapist.HourlyRate = dto.HourlyRate;
            therapist.Qualifications = dto.Qualifications;
            therapist.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteTherapistAsync(int id)
        {
            var therapist = await _context.Therapists.FindAsync(id);
            if (therapist == null) return false;

            _context.Therapists.Remove(therapist);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> ApproveTherapistAsync(int id)
        {
            var therapist = await _context.Therapists.FindAsync(id);
            if (therapist == null) return false;

            therapist.IsVerified = true;
            therapist.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return true;
        }

        private static TherapistDto MapToDto(Therapist t) => new()
        {
            TherapistId = t.TherapistId,
            UserId = t.UserId,
            FirstName = t.User?.FirstName ?? "",
            LastName = t.User?.LastName ?? "",
            Email = t.User?.Email ?? "",
            Phone = t.User?.Phone,
            ProfileImageUrl = t.User?.ProfileImageUrl,
            Specialization = t.Specialization,
            Bio = t.Bio,
            ExperienceYears = t.ExperienceYears,
            HourlyRate = t.HourlyRate,
            Rating = t.Rating,
            Qualifications = t.Qualifications,
            CreatedAt = t.CreatedAt
        };
    }
}
