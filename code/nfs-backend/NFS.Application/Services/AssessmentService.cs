using Microsoft.EntityFrameworkCore;
using NFS.Application.DTOs;
using NFS.Application.Interfaces.Data;
using NFS.Application.Interfaces.Services;
using NFS.Domain.Entities;

namespace NFS.Application.Services
{
    public class AssessmentService : IAssessmentService
    {
        private readonly IApplicationDbContext _context;

        public AssessmentService(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<AssessmentDto>> GetAllAssessmentsAsync()
        {
            return await _context.Assessments
                .Include(a => a.Patient)
                    .ThenInclude(p => p!.User)
                .Select(a => MapToDto(a))
                .ToListAsync();
        }

        public async Task<AssessmentDto?> GetAssessmentByIdAsync(int id)
        {
            var assessment = await _context.Assessments
                .Include(a => a.Patient)
                    .ThenInclude(p => p!.User)
                .FirstOrDefaultAsync(a => a.AssessmentId == id);
            return assessment == null ? null : MapToDto(assessment);
        }

        public async Task<IEnumerable<AssessmentDto>> GetAssessmentsByPatientIdAsync(int patientId)
        {
            return await _context.Assessments
                .Include(a => a.Patient)
                    .ThenInclude(p => p!.User)
                .Where(a => a.PatientId == patientId)
                .Select(a => MapToDto(a))
                .ToListAsync();
        }

        public async Task<AssessmentDto> CreateAssessmentAsync(CreateAssessmentDto dto)
        {
            var patient = await _context.Patients
                .Include(p => p.User)
                .FirstOrDefaultAsync(p => p.PatientId == dto.PatientId)
                ?? throw new ArgumentException($"Patient with ID {dto.PatientId} not found.");

            var assessment = new Assessment
            {
                PatientId = dto.PatientId,
                Title = dto.Title,
                AnswersJson = dto.AnswersJson,
                Score = dto.Score,
                CompletedAt = DateTime.UtcNow
            };

            _context.Assessments.Add(assessment);
            await _context.SaveChangesAsync();
            assessment.Patient = patient;
            return MapToDto(assessment);
        }

        public async Task<bool> DeleteAssessmentAsync(int id)
        {
            var assessment = await _context.Assessments.FindAsync(id);
            if (assessment == null) return false;

            _context.Assessments.Remove(assessment);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<AssessmentResult> AddResultAsync(int assessmentId, AssessmentResult result)
        {
            var assessment = await _context.Assessments.FindAsync(assessmentId)
                ?? throw new ArgumentException($"Assessment with ID {assessmentId} not found.");

            result.AssessmentId = assessmentId;
            _context.AssessmentResults.Add(result);
            await _context.SaveChangesAsync();
            return result;
        }

        private static AssessmentDto MapToDto(Assessment a) => new()
        {
            AssessmentId = a.AssessmentId,
            PatientId = a.PatientId,
            PatientName = a.Patient?.User != null
                ? $"{a.Patient.User.FirstName} {a.Patient.User.LastName}"
                : "Unknown Patient",
            Title = a.Title,
            AnswersJson = a.AnswersJson,
            Score = a.Score,
            CompletedAt = a.CompletedAt
        };
    }
}
