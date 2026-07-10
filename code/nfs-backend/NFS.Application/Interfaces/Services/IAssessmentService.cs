using NFS.Application.DTOs;
using NFS.Domain.Entities;

namespace NFS.Application.Interfaces.Services
{
    public interface IAssessmentService
    {
        Task<IEnumerable<AssessmentDto>> GetAllAssessmentsAsync();
        Task<AssessmentDto?> GetAssessmentByIdAsync(int id);
        Task<IEnumerable<AssessmentDto>> GetAssessmentsByPatientIdAsync(int patientId);
        Task<AssessmentDto> CreateAssessmentAsync(CreateAssessmentDto dto);
        Task<bool> DeleteAssessmentAsync(int id);
        Task<AssessmentResult> AddResultAsync(int assessmentId, AssessmentResult result);
    }
}
