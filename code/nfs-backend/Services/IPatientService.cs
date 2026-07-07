using System.Collections.Generic;
using System.Threading.Tasks;
using NafsApp.DTOs;

namespace NafsApp.Services
{
    public interface IPatientService
    {
        Task<IEnumerable<PatientDto>> GetAllPatientsAsync();
        Task<PatientDto?> GetPatientByIdAsync(int id);
        Task<PatientDto?> GetPatientByUserIdAsync(int userId);
        Task<PatientDto> CreatePatientAsync(CreatePatientDto dto);
        Task<bool> UpdatePatientAsync(int id, UpdatePatientDto dto);
        Task<bool> DeletePatientAsync(int id);
    }
}
