using System.Collections.Generic;
using System.Threading.Tasks;
using NafsApp.DTOs;

namespace NafsApp.Services
{
    public interface IAssessmentService
    {
        Task<IEnumerable<AssessmentDto>> GetAllAssessmentsAsync();
        Task<AssessmentDto?> GetAssessmentByIdAsync(int id);
        Task<IEnumerable<AssessmentDto>> GetAssessmentsByPatientIdAsync(int patientId);
        Task<AssessmentDto> CreateAssessmentAsync(CreateAssessmentDto dto);
        Task<bool> DeleteAssessmentAsync(int id);
    }
}
