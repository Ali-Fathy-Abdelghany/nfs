using Microsoft.EntityFrameworkCore;
using NFS.Application.DTOs;
using NFS.Application.Interfaces.Data;
using NFS.Application.Interfaces.Services;
using NFS.Domain.Entities;
using NFS.Domain.Enums;

namespace NFS.Application.Services
{
    public class TherapistService : ITherapistService
    {
        private readonly IApplicationDbContext _context;
        private readonly IEmailNotificationService _notifications;

        public TherapistService(IApplicationDbContext context, IEmailNotificationService notifications)
        {
            _context = context;
            _notifications = notifications;
        }

        public async Task<IEnumerable<TherapistDto>> GetAllTherapistsAsync()
        {
            // Materialize first — MapToDto cannot be translated by EF to SQL.
            var therapists = await _context.Therapists
                .Include(t => t.User)
                .AsNoTracking()
                .ToListAsync();
            return therapists.Select(MapToDto).ToList();
        }

        public async Task<IEnumerable<TherapistDto>> GetPendingTherapistsAsync()
        {
            var therapists = await _context.Therapists
                .Include(t => t.User)
                .AsNoTracking()
                .Where(t => t.Status == TherapistStatus.Pending && !t.IsVerified)
                .ToListAsync();
            return therapists.Select(MapToDto).ToList();
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
                IsVerified = false,
                Status = TherapistStatus.Pending,
                CreatedAt = DateTime.UtcNow
            };

            _context.Therapists.Add(therapist);
            await _context.SaveChangesAsync();
            therapist.User = user;
            return MapToDto(therapist);
        }

        public async Task<bool> UpdateTherapistAsync(int id, UpdateTherapistDto dto)
        {
            var therapist = await _context.Therapists
                .Include(t => t.User)
                .FirstOrDefaultAsync(t => t.TherapistId == id);
            if (therapist == null) return false;

            therapist.Specialization = dto.Specialization;
            therapist.Bio = dto.Bio;
            therapist.ExperienceYears = dto.ExperienceYears;
            therapist.HourlyRate = dto.HourlyRate;
            therapist.Qualifications = dto.Qualifications;
            therapist.UpdatedAt = DateTime.UtcNow;

            // Resubmission after reject → back to pending review
            if (therapist.Status == TherapistStatus.Rejected)
            {
                therapist.Status = TherapistStatus.Pending;
                therapist.RejectionReason = null;
                therapist.IsVerified = false;
                therapist.VerifiedAt = null;
            }

            if (therapist.User != null)
            {
                if (!string.IsNullOrWhiteSpace(dto.FirstName))
                    therapist.User.FirstName = dto.FirstName.Trim();
                if (!string.IsNullOrWhiteSpace(dto.LastName))
                    therapist.User.LastName = dto.LastName.Trim();
                if (dto.Phone != null)
                    therapist.User.Phone = string.IsNullOrWhiteSpace(dto.Phone) ? null : dto.Phone.Trim();
                therapist.User.UpdatedAt = DateTime.UtcNow;
            }

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
            var therapist = await _context.Therapists
                .Include(t => t.User)
                .FirstOrDefaultAsync(t => t.TherapistId == id);
            if (therapist == null) return false;

            therapist.IsVerified = true;
            therapist.Status = TherapistStatus.Approved;
            therapist.RejectionReason = null;
            therapist.VerifiedAt = DateTime.UtcNow;
            therapist.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            if (!string.IsNullOrWhiteSpace(therapist.User?.Email))
            {
                await _notifications.SendTherapistAcceptedAsync(
                    therapist.User.Email,
                    therapist.User.FirstName);
            }

            return true;
        }

        public async Task<bool> RejectTherapistAsync(int id, string? reason)
        {
            var therapist = await _context.Therapists
                .Include(t => t.User)
                .FirstOrDefaultAsync(t => t.TherapistId == id);
            if (therapist == null) return false;

            therapist.IsVerified = false;
            therapist.Status = TherapistStatus.Rejected;
            therapist.RejectionReason = string.IsNullOrWhiteSpace(reason) ? null : reason.Trim();
            therapist.VerifiedAt = null;
            therapist.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            if (!string.IsNullOrWhiteSpace(therapist.User?.Email))
            {
                await _notifications.SendTherapistRejectedAsync(
                    therapist.User.Email,
                    therapist.User.FirstName,
                    therapist.RejectionReason);
            }

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
            IsVerified = t.IsVerified,
            Status = t.Status.ToString(),
            RejectionReason = t.RejectionReason,
            VerifiedAt = t.VerifiedAt,
            Country = t.User?.Country,
            Governorate = t.User?.Governorate,
            Gender = t.User?.Gender?.ToString(),
            DateOfBirth = t.User?.DateOfBirth,
            CreatedAt = t.CreatedAt
        };
    }
}
