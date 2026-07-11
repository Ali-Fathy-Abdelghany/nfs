using Microsoft.EntityFrameworkCore;
using NFS.Domain.Entities;
using NFS.Infrastructure.Data;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace NFS.Infrastructure.Repositories
{
    public interface IAssessmentRepository
    {
        Task<Assessment?> GetAssessmentByIdAsync(int id);
        Task<List<Assessment>> GetPatientAssessmentsAsync(int patientId);
        Task<List<Assessment>> GetTherapistAssessmentsAsync(int therapistId);
        Task<Assessment> CreateAssessmentAsync(Assessment assessment);
        Task<Assessment> UpdateAssessmentAsync(Assessment assessment);
        Task<bool> DeleteAssessmentAsync(int id);
        Task<bool> ExistsAsync(int id);
        Task<AssessmentResult> AddAssessmentResultAsync(AssessmentResult result);
        Task<List<AssessmentResult>> GetAssessmentResultsAsync(int assessmentId);
        Task<AssessmentResult?> GetAssessmentResultByIdAsync(int id);
        Task<bool> DeleteAssessmentResultAsync(int id);
        Task<int> GetAssessmentResultCountAsync(int assessmentId);
    }

    public class AssessmentRepository : IAssessmentRepository
    {
        private readonly ApplicationDbContext _context;

        public AssessmentRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Assessment?> GetAssessmentByIdAsync(int id)
        {
            return await _context.Assessments
                .Include(a => a.Patient)
                .Include(a => a.Therapist)
                .Include(a => a.Results)
                .FirstOrDefaultAsync(a => a.AssessmentId == id);
        }

        public async Task<List<Assessment>> GetPatientAssessmentsAsync(int patientId)
        {
            return await _context.Assessments
                .Include(a => a.Patient)
                .Include(a => a.Therapist)
                .Include(a => a.Results)
                .Where(a => a.PatientId == patientId)
                .OrderByDescending(a => a.CompletedAt)
                .ToListAsync();
        }

        public async Task<List<Assessment>> GetTherapistAssessmentsAsync(int therapistId)
        {
            return await _context.Assessments
                .Include(a => a.Patient)
                .Include(a => a.Therapist)
                .Include(a => a.Results)
                .Where(a => a.TherapistId == therapistId)
                .OrderByDescending(a => a.CompletedAt)
                .ToListAsync();
        }

        public async Task<Assessment> CreateAssessmentAsync(Assessment assessment)
        {
            assessment.CompletedAt = DateTime.UtcNow;
            _context.Assessments.Add(assessment);
            await _context.SaveChangesAsync();
            return assessment;
        }

        public async Task<Assessment> UpdateAssessmentAsync(Assessment assessment)
        {
            _context.Assessments.Update(assessment);
            await _context.SaveChangesAsync();
            return assessment;
        }

        public async Task<bool> DeleteAssessmentAsync(int id)
        {
            var assessment = await GetAssessmentByIdAsync(id);
            if (assessment == null)
                return false;

            _context.Assessments.Remove(assessment);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> ExistsAsync(int id)
        {
            return await _context.Assessments.AnyAsync(a => a.AssessmentId == id);
        }

        public async Task<AssessmentResult> AddAssessmentResultAsync(AssessmentResult result)
        {
            _context.AssessmentResults.Add(result);
            await _context.SaveChangesAsync();
            return result;
        }

        public async Task<List<AssessmentResult>> GetAssessmentResultsAsync(int assessmentId)
        {
            return await _context.AssessmentResults
                .Where(ar => ar.AssessmentId == assessmentId)
                .OrderBy(ar => ar.AssessmentResultId)
                .ToListAsync();
        }

        public async Task<AssessmentResult?> GetAssessmentResultByIdAsync(int id)
        {
            return await _context.AssessmentResults.FirstOrDefaultAsync(ar => ar.AssessmentResultId == id);
        }

        public async Task<bool> DeleteAssessmentResultAsync(int id)
        {
            var result = await GetAssessmentResultByIdAsync(id);
            if (result == null)
                return false;

            _context.AssessmentResults.Remove(result);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<int> GetAssessmentResultCountAsync(int assessmentId)
        {
            return await _context.AssessmentResults
                .CountAsync(ar => ar.AssessmentId == assessmentId);
        }
    }
}
