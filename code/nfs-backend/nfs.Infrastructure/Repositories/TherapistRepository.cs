using Microsoft.EntityFrameworkCore;
using nfs.Domain.Entities;
using nfs.Infrastructure.Data;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace nfs.Infrastructure.Repositories
{
    public interface ITherapistRepository
    {
        Task<Therapist> GetTherapistByIdAsync(int id);
        Task<Therapist> GetTherapistByUserIdAsync(int userId);
        Task<List<Therapist>> GetAllTherapistsAsync();
        Task<List<Therapist>> GetApprovedTherapistsAsync();
        Task<List<Therapist>> GetPendingTherapistsAsync();
        Task<List<Therapist>> SearchTherapistsAsync(string? name, int? specializationId, decimal? maxHourlyRate, bool? isAvailable);
        Task<List<Therapist>> GetTherapistsBySpecializationAsync(int specializationId);
        Task<Therapist> AddTherapistAsync(Therapist therapist);
        Task<Therapist> UpdateTherapistAsync(Therapist therapist);
        Task<bool> DeleteTherapistAsync(int id);
        Task<bool> ApproveTherapistAsync(int therapistId, int approvedByUserId);
        Task<bool> RejectTherapistAsync(int therapistId, string rejectionReason);
        Task<bool> UpdateAvailabilityAsync(int therapistId, bool isAvailable);
        Task<bool> ExistsAsync(int id);
        Task<List<Therapist>> GetAvailableTherapistsAsync();
    }

    public class TherapistRepository : ITherapistRepository
    {
        private readonly ApplicationDbContext _context;

        public TherapistRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Therapist> GetTherapistByIdAsync(int id)
        {
            return await _context.Therapists
                .Include(t => t.Specializations)
                .ThenInclude(ts => ts.Specialization)
                .FirstOrDefaultAsync(t => t.Id == id);
        }

        public async Task<Therapist> GetTherapistByUserIdAsync(int userId)
        {
            return await _context.Therapists
                .Include(t => t.Specializations)
                .ThenInclude(ts => ts.Specialization)
                .FirstOrDefaultAsync(t => t.UserId == userId);
        }

        public async Task<List<Therapist>> GetAllTherapistsAsync()
        {
            return await _context.Therapists
                .Include(t => t.Specializations)
                .ThenInclude(ts => ts.Specialization)
                .Where(t => t.IsActive)
                .ToListAsync();
        }

        public async Task<List<Therapist>> GetApprovedTherapistsAsync()
        {
            return await _context.Therapists
                .Include(t => t.Specializations)
                .ThenInclude(ts => ts.Specialization)
                .Where(t => t.VerificationStatus == "Approved" && t.IsActive)
                .ToListAsync();
        }

        public async Task<List<Therapist>> GetPendingTherapistsAsync()
        {
            return await _context.Therapists
                .Include(t => t.Specializations)
                .ThenInclude(ts => ts.Specialization)
                .Where(t => t.VerificationStatus == "Pending")
                .ToListAsync();
        }

        public async Task<List<Therapist>> SearchTherapistsAsync(string? name, int? specializationId, decimal? maxHourlyRate, bool? isAvailable)
        {
            var query = _context.Therapists
                .Include(t => t.Specializations)
                .ThenInclude(ts => ts.Specialization)
                .Where(t => t.VerificationStatus == "Approved" && t.IsActive);

            if (!string.IsNullOrEmpty(name))
            {
                name = name.ToLower();
                query = query.Where(t => t.User.FirstName.ToLower().Contains(name) || 
                                         t.User.LastName.ToLower().Contains(name));
            }

            if (specializationId.HasValue)
            {
                query = query.Where(t => t.Specializations.Any(ts => ts.SpecializationId == specializationId.Value));
            }

            if (maxHourlyRate.HasValue)
            {
                query = query.Where(t => t.HourlyRate <= maxHourlyRate.Value);
            }

            if (isAvailable.HasValue)
            {
                query = query.Where(t => t.IsAvailable == isAvailable.Value);
            }

            return await query.ToListAsync();
        }

        public async Task<List<Therapist>> GetTherapistsBySpecializationAsync(int specializationId)
        {
            return await _context.Therapists
                .Include(t => t.Specializations)
                .ThenInclude(ts => ts.Specialization)
                .Where(t => t.Specializations.Any(ts => ts.SpecializationId == specializationId) && t.IsActive)
                .ToListAsync();
        }

        public async Task<Therapist> AddTherapistAsync(Therapist therapist)
        {
            _context.Therapists.Add(therapist);
            await _context.SaveChangesAsync();
            return therapist;
        }

        public async Task<Therapist> UpdateTherapistAsync(Therapist therapist)
        {
            therapist.UpdatedAt = DateTime.UtcNow;
            _context.Therapists.Update(therapist);
            await _context.SaveChangesAsync();
            return therapist;
        }

        public async Task<bool> DeleteTherapistAsync(int id)
        {
            var therapist = await GetTherapistByIdAsync(id);
            if (therapist == null)
                return false;

            therapist.IsActive = false;
            await UpdateTherapistAsync(therapist);
            return true;
        }

        public async Task<bool> ApproveTherapistAsync(int therapistId, int approvedByUserId)
        {
            var therapist = await GetTherapistByIdAsync(therapistId);
            if (therapist == null)
                return false;

            therapist.VerificationStatus = "Approved";
            therapist.VerifiedAt = DateTime.UtcNow;
            therapist.VerifiedByUserId = approvedByUserId;
            await UpdateTherapistAsync(therapist);
            return true;
        }

        public async Task<bool> RejectTherapistAsync(int therapistId, string rejectionReason)
        {
            var therapist = await GetTherapistByIdAsync(therapistId);
            if (therapist == null)
                return false;

            therapist.VerificationStatus = "Rejected";
            therapist.VerificationNotes = rejectionReason;
            therapist.VerifiedAt = DateTime.UtcNow;
            await UpdateTherapistAsync(therapist);
            return true;
        }

        public async Task<bool> UpdateAvailabilityAsync(int therapistId, bool isAvailable)
        {
            var therapist = await GetTherapistByIdAsync(therapistId);
            if (therapist == null)
                return false;

            therapist.IsAvailable = isAvailable;
            await UpdateTherapistAsync(therapist);
            return true;
        }

        public async Task<bool> ExistsAsync(int id)
        {
            return await _context.Therapists.AnyAsync(t => t.Id == id);
        }

        public async Task<List<Therapist>> GetAvailableTherapistsAsync()
        {
            return await _context.Therapists
                .Include(t => t.Specializations)
                .ThenInclude(ts => ts.Specialization)
                .Where(t => t.IsAvailable && t.VerificationStatus == "Approved" && t.IsActive)
                .ToListAsync();
        }
    }
}
