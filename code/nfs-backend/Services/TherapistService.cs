<<<<<<< HEAD
using nfs.Application.DTOs;
using nfs.Domain.Entities;
using nfs.Infrastructure.Repositories;
=======
>>>>>>> 357c55b89764eb08da5a380662001a6eb1d85477
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
<<<<<<< HEAD

namespace nfs.Application.Services
{
    public interface ITherapistService
    {
        Task<TherapistProfileDto> RegisterTherapistAsync(TherapistRegistrationDto dto);
        Task<TherapistProfileDto> GetTherapistProfileAsync(int therapistId);
        Task<TherapistProfileDto> GetTherapistProfileByUserIdAsync(int userId);
        Task<List<TherapistSearchDto>> GetAllTherapistsAsync();
        Task<List<TherapistSearchDto>> GetApprovedTherapistsAsync();
        Task<List<TherapistSearchDto>> GetPendingTherapistsAsync();
        Task<List<TherapistSearchDto>> SearchTherapistsAsync(string? name, int? specializationId, decimal? maxHourlyRate, bool? isAvailable);
        Task<List<TherapistSearchDto>> GetTherapistsBySpecializationAsync(int specializationId);
        Task<TherapistProfileDto> UpdateTherapistProfileAsync(int therapistId, TherapistUpdateProfileDto dto);
        Task<bool> ApproveTherapistAsync(int therapistId, int approvedByUserId);
        Task<bool> RejectTherapistAsync(int therapistId, string rejectionReason);
        Task<bool> UpdateAvailabilityAsync(int therapistId, bool isAvailable);
        Task<bool> DeleteTherapistAsync(int therapistId);
        Task<List<TherapistSearchDto>> GetAvailableTherapistsAsync();
    }

    public class TherapistService : ITherapistService
    {
        private readonly ITherapistRepository _therapistRepository;
        private readonly IUserService _userService;

        public TherapistService(ITherapistRepository therapistRepository, IUserService userService)
        {
            _therapistRepository = therapistRepository;
            _userService = userService;
        }

        public async Task<TherapistProfileDto> RegisterTherapistAsync(TherapistRegistrationDto dto)
        {
            // Verify license expiry date is in the future
            if (dto.LicenseExpiryDate <= DateTime.UtcNow)
                throw new InvalidOperationException("License has already expired.");

            // Create user account first (handled by UserService)
            // This is a simplified version - actual implementation would integrate with UserService

            var therapist = new Therapist
            {
                UserId = 0, // This would be set after user creation
                LicenseNumber = dto.LicenseNumber,
                LicenseIssueDate = dto.LicenseIssueDate,
                LicenseExpiryDate = dto.LicenseExpiryDate,
                VerificationStatus = "Pending",
                YearsOfExperience = dto.YearsOfExperience,
                Bio = dto.Bio,
                Qualifications = dto.Qualifications,
                OfficeAddress = dto.OfficeAddress,
                OfficePhone = dto.OfficePhone,
                HourlyRate = dto.HourlyRate,
                Languages = dto.Languages,
                IsAvailable = true,
                IsActive = true
            };

            var createdTherapist = await _therapistRepository.AddTherapistAsync(therapist);
            return MapToTherapistProfileDto(createdTherapist);
        }

        public async Task<TherapistProfileDto> GetTherapistProfileAsync(int therapistId)
        {
            var therapist = await _therapistRepository.GetTherapistByIdAsync(therapistId);
            if (therapist == null)
                throw new KeyNotFoundException($"Therapist with ID {therapistId} not found.");

            return MapToTherapistProfileDto(therapist);
        }

        public async Task<TherapistProfileDto> GetTherapistProfileByUserIdAsync(int userId)
        {
            var therapist = await _therapistRepository.GetTherapistByUserIdAsync(userId);
            if (therapist == null)
                throw new KeyNotFoundException($"Therapist for user {userId} not found.");

            return MapToTherapistProfileDto(therapist);
        }

        public async Task<List<TherapistSearchDto>> GetAllTherapistsAsync()
        {
            var therapists = await _therapistRepository.GetAllTherapistsAsync();
            return therapists.Select(MapToTherapistSearchDto).ToList();
        }

        public async Task<List<TherapistSearchDto>> GetApprovedTherapistsAsync()
        {
            var therapists = await _therapistRepository.GetApprovedTherapistsAsync();
            return therapists.Select(MapToTherapistSearchDto).ToList();
        }

        public async Task<List<TherapistSearchDto>> GetPendingTherapistsAsync()
        {
            var therapists = await _therapistRepository.GetPendingTherapistsAsync();
            return therapists.Select(MapToTherapistSearchDto).ToList();
        }

        public async Task<List<TherapistSearchDto>> SearchTherapistsAsync(string? name, int? specializationId, decimal? maxHourlyRate, bool? isAvailable)
        {
            var therapists = await _therapistRepository.SearchTherapistsAsync(name, specializationId, maxHourlyRate, isAvailable);
            return therapists.Select(MapToTherapistSearchDto).ToList();
        }

        public async Task<List<TherapistSearchDto>> GetTherapistsBySpecializationAsync(int specializationId)
        {
            var therapists = await _therapistRepository.GetTherapistsBySpecializationAsync(specializationId);
            return therapists.Select(MapToTherapistSearchDto).ToList();
        }

        public async Task<TherapistProfileDto> UpdateTherapistProfileAsync(int therapistId, TherapistUpdateProfileDto dto)
        {
            var therapist = await _therapistRepository.GetTherapistByIdAsync(therapistId);
            if (therapist == null)
                throw new KeyNotFoundException($"Therapist with ID {therapistId} not found.");

            if (!string.IsNullOrEmpty(dto.FirstName))
                therapist.User.FirstName = dto.FirstName;

            if (!string.IsNullOrEmpty(dto.LastName))
                therapist.User.LastName = dto.LastName;

            if (!string.IsNullOrEmpty(dto.Phone))
                therapist.User.Phone = dto.Phone;

            if (dto.Bio != null)
                therapist.Bio = dto.Bio;

            if (dto.Qualifications != null)
                therapist.Qualifications = dto.Qualifications;

            if (dto.IsAvailable.HasValue)
                therapist.IsAvailable = dto.IsAvailable.Value;

            if (dto.OfficeAddress != null)
                therapist.OfficeAddress = dto.OfficeAddress;

            if (dto.OfficePhone != null)
                therapist.OfficePhone = dto.OfficePhone;

            if (dto.HourlyRate.HasValue)
                therapist.HourlyRate = dto.HourlyRate.Value;

            if (dto.Languages != null)
                therapist.Languages = dto.Languages;

            var updatedTherapist = await _therapistRepository.UpdateTherapistAsync(therapist);
            return MapToTherapistProfileDto(updatedTherapist);
        }

        public async Task<bool> ApproveTherapistAsync(int therapistId, int approvedByUserId)
        {
            var therapist = await _therapistRepository.GetTherapistByIdAsync(therapistId);
            if (therapist == null)
                throw new KeyNotFoundException($"Therapist with ID {therapistId} not found.");

            return await _therapistRepository.ApproveTherapistAsync(therapistId, approvedByUserId);
        }

        public async Task<bool> RejectTherapistAsync(int therapistId, string rejectionReason)
        {
            var therapist = await _therapistRepository.GetTherapistByIdAsync(therapistId);
            if (therapist == null)
                throw new KeyNotFoundException($"Therapist with ID {therapistId} not found.");

            return await _therapistRepository.RejectTherapistAsync(therapistId, rejectionReason);
        }

        public async Task<bool> UpdateAvailabilityAsync(int therapistId, bool isAvailable)
        {
            var therapist = await _therapistRepository.GetTherapistByIdAsync(therapistId);
            if (therapist == null)
                throw new KeyNotFoundException($"Therapist with ID {therapistId} not found.");

            return await _therapistRepository.UpdateAvailabilityAsync(therapistId, isAvailable);
        }

        public async Task<bool> DeleteTherapistAsync(int therapistId)
        {
            var therapist = await _therapistRepository.GetTherapistByIdAsync(therapistId);
            if (therapist == null)
                throw new KeyNotFoundException($"Therapist with ID {therapistId} not found.");

            return await _therapistRepository.DeleteTherapistAsync(therapistId);
        }

        public async Task<List<TherapistSearchDto>> GetAvailableTherapistsAsync()
        {
            var therapists = await _therapistRepository.GetAvailableTherapistsAsync();
            return therapists.Select(MapToTherapistSearchDto).ToList();
        }

        private TherapistProfileDto MapToTherapistProfileDto(Therapist therapist)
        {
            return new TherapistProfileDto
            {
                Id = therapist.Id,
                UserId = therapist.UserId,
                FirstName = therapist.User.FirstName,
                LastName = therapist.User.LastName,
                Email = therapist.User.Email,
                Phone = therapist.User.Phone,
                LicenseNumber = therapist.LicenseNumber,
                LicenseIssueDate = therapist.LicenseIssueDate,
                LicenseExpiryDate = therapist.LicenseExpiryDate,
                VerificationStatus = therapist.VerificationStatus,
                VerifiedAt = therapist.VerifiedAt,
                YearsOfExperience = therapist.YearsOfExperience,
                Bio = therapist.Bio,
                Qualifications = therapist.Qualifications,
                IsAvailable = therapist.IsAvailable,
                OfficeAddress = therapist.OfficeAddress,
                OfficePhone = therapist.OfficePhone,
                HourlyRate = therapist.HourlyRate,
                Languages = therapist.Languages,
                Specializations = therapist.Specializations.Select(ts => new SpecializationDto
                {
                    Id = ts.Specialization.Id,
                    Name = ts.Specialization.Name,
                    Description = ts.Specialization.Description,
                    YearsOfExperienceInSpecialization = ts.YearsOfSpecializationExperience
                }).ToList(),
                CreatedAt = therapist.CreatedAt,
                UpdatedAt = therapist.UpdatedAt
            };
        }

        private TherapistSearchDto MapToTherapistSearchDto(Therapist therapist)
        {
            return new TherapistSearchDto
            {
                Id = therapist.Id,
                FirstName = therapist.User.FirstName,
                LastName = therapist.User.LastName,
                YearsOfExperience = therapist.YearsOfExperience,
                Bio = therapist.Bio,
                IsAvailable = therapist.IsAvailable,
                HourlyRate = therapist.HourlyRate,
                Languages = therapist.Languages,
                Specializations = therapist.Specializations.Select(ts => new SpecializationDto
                {
                    Id = ts.Specialization.Id,
                    Name = ts.Specialization.Name,
                    Description = ts.Specialization.Description,
                    YearsOfExperienceInSpecialization = ts.YearsOfSpecializationExperience
                }).ToList()
            };
        }
=======
using Microsoft.EntityFrameworkCore;
using NafsApp.Data;
using NafsApp.DTOs;
using NafsApp.Models;

namespace NafsApp.Services
{
    public class TherapistService : ITherapistService
    {
        private readonly AppDbContext _context;

        public TherapistService(AppDbContext context)
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
            var user = await _context.Users.FindAsync(dto.UserId);
            if (user == null)
            {
                throw new ArgumentException($"User with ID {dto.UserId} not found.");
            }

            var existing = await _context.Therapists.AnyAsync(t => t.UserId == dto.UserId);
            if (existing)
            {
                throw new InvalidOperationException($"Therapist profile already exists for User ID {dto.UserId}.");
            }

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

        private static TherapistDto MapToDto(Therapist t) => new TherapistDto
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
>>>>>>> 357c55b89764eb08da5a380662001a6eb1d85477
    }
}
