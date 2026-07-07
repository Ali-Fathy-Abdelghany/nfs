using Microsoft.EntityFrameworkCore;
using nfs.Domain.Entities;
using nfs.Infrastructure.Data;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace nfs.Infrastructure.Repositories
{
    public interface IAssessmentRepository
    {
        Task<Assessment> GetAssessmentByIdAsync(int id);
        Task<List<Assessment>> GetPatientAssessmentsAsync(int patientId);
        Task<List<Assessment>> GetTherapistAssessmentsAsync(int therapistId);
        Task<List<Assessment>> GetAssessmentsByStatusAsync(string status);
        Task<List<Assessment>> GetPendingAssessmentsAsync();
        Task<List<Assessment>> GetCompletedAssessmentsAsync();
        Task<Assessment> CreateAssessmentAsync(Assessment assessment);
        Task<Assessment> UpdateAssessmentAsync(Assessment assessment);
        Task<bool> DeleteAssessmentAsync(int id);
        Task<bool> ExistsAsync(int id);
        Task<AssessmentResult> AddAssessmentResultAsync(AssessmentResult result);
        Task<List<AssessmentResult>> GetAssessmentResultsAsync(int assessmentId);
        Task<AssessmentResult> GetAssessmentResultByIdAsync(int id);
        Task<bool> DeleteAssessmentResultAsync(int id);
        Task<int> GetAssessmentResultCountAsync(int assessmentId);
        Task<List<Assessment>> GetAssessmentsByTypeAsync(string assessmentType);
    }

    public class AssessmentRepository : IAssessmentRepository
    {
        private readonly ApplicationDbContext _context;

        public AssessmentRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Assessment> GetAssessmentByIdAsync(int id)
        {
            return await _context.Assessments
                .Include(a => a.Patient)
                .Include(a => a.Therapist)
                .Include(a => a.Results)
                .FirstOrDefaultAsync(a => a.Id == id);
        }

        public async Task<List<Assessment>> GetPatientAssessmentsAsync(int patientId)
        {
            return await _context.Assessments
                .Include(a => a.Patient)
                .Include(a => a.Therapist)
                .Include(a => a.Results)
                .Where(a => a.PatientId == patientId)
                .OrderByDescending(a => a.AssessmentDate)
                .ToListAsync();
        }

        public async Task<List<Assessment>> GetTherapistAssessmentsAsync(int therapistId)
        {
            return await _context.Assessments
                .Include(a => a.Patient)
                .Include(a => a.Therapist)
                .Include(a => a.Results)
                .Where(a => a.TherapistId == therapistId)
                .OrderByDescending(a => a.AssessmentDate)
                .ToListAsync();
        }

        public async Task<List<Assessment>> GetAssessmentsByStatusAsync(string status)
        {
            return await _context.Assessments
                .Include(a => a.Patient)
                .Include(a => a.Therapist)
                .Include(a => a.Results)
                .Where(a => a.Status == status)
                .OrderByDescending(a => a.AssessmentDate)
                .ToListAsync();
        }

        public async Task<List<Assessment>> GetPendingAssessmentsAsync()
        {
            return await _context.Assessments
                .Include(a => a.Patient)
                .Include(a => a.Therapist)
                .Include(a => a.Results)
                .Where(a => a.Status == "Pending")
                .OrderByDescending(a => a.AssessmentDate)
                .ToListAsync();
        }

        public async Task<List<Assessment>> GetCompletedAssessmentsAsync()
        {
            return await _context.Assessments
                .Include(a => a.Patient)
                .Include(a => a.Therapist)
                .Include(a => a.Results)
                .Where(a => a.Status == "Completed")
                .OrderByDescending(a => a.AssessmentDate)
                .ToListAsync();
        }

        public async Task<Assessment> CreateAssessmentAsync(Assessment assessment)
        {
            assessment.AssessmentDate = DateTime.UtcNow;
            assessment.CreatedAt = DateTime.UtcNow;
            _context.Assessments.Add(assessment);
            await _context.SaveChangesAsync();
            return assessment;
        }

        public async Task<Assessment> UpdateAssessmentAsync(Assessment assessment)
        {
            assessment.UpdatedAt = DateTime.UtcNow;
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
            return await _context.Assessments.AnyAsync(a => a.Id == id);
        }

        public async Task<AssessmentResult> AddAssessmentResultAsync(AssessmentResult result)
        {
            result.CreatedAt = DateTime.UtcNow;
            _context.AssessmentResults.Add(result);
            await _context.SaveChangesAsync();
            return result;
        }

        public async Task<List<AssessmentResult>> GetAssessmentResultsAsync(int assessmentId)
        {
            return await _context.AssessmentResults
                .Where(ar => ar.AssessmentId == assessmentId)
                .OrderBy(ar => ar.QuestionNumber)
                .ToListAsync();
        }

        public async Task<AssessmentResult> GetAssessmentResultByIdAsync(int id)
        {
            return await _context.AssessmentResults.FirstOrDefaultAsync(ar => ar.Id == id);
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

        public async Task<List<Assessment>> GetAssessmentsByTypeAsync(string assessmentType)
        {
            return await _context.Assessments
                .Include(a => a.Patient)
                .Include(a => a.Therapist)
                .Include(a => a.Results)
                .Where(a => a.AssessmentType == assessmentType)
                .OrderByDescending(a => a.AssessmentDate)
                .ToListAsync();
        }
    }
}
