using Microsoft.EntityFrameworkCore;
using NFS.Domain.Entities;
using NFS.Infrastructure.Data;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace NFS.Infrastructure.Repositories
{
    public interface ITherapistRepository
    {
        Task<Therapist?> GetTherapistByIdAsync(int id);
        Task<Therapist?> GetTherapistByUserIdAsync(int userId);
        Task<List<Therapist>> GetAllTherapistsAsync();
        Task<Therapist> AddTherapistAsync(Therapist therapist);
        Task<Therapist> UpdateTherapistAsync(Therapist therapist);
        Task<bool> DeleteTherapistAsync(int id);
        Task<bool> ExistsAsync(int id);
    }

    public class TherapistRepository : ITherapistRepository
    {
        private readonly ApplicationDbContext _context;

        public TherapistRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Therapist?> GetTherapistByIdAsync(int id)
        {
            return await _context.Therapists
                .Include(t => t.User)
                .FirstOrDefaultAsync(t => t.TherapistId == id);
        }

        public async Task<Therapist?> GetTherapistByUserIdAsync(int userId)
        {
            return await _context.Therapists
                .Include(t => t.User)
                .FirstOrDefaultAsync(t => t.UserId == userId);
        }

        public async Task<List<Therapist>> GetAllTherapistsAsync()
        {
            return await _context.Therapists
                .Include(t => t.User)
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

            _context.Therapists.Remove(therapist);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> ExistsAsync(int id)
        {
            return await _context.Therapists.AnyAsync(t => t.TherapistId == id);
        }
    }
}
