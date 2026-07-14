using NFS.Application.DTOs;

namespace NFS.Application.Interfaces.Services
{
    public interface IPatientService
    {
        Task<IEnumerable<PatientDto>> GetAllPatientsAsync();
        Task<IEnumerable<PatientDto>> GetPatientsByDoctorIdAsync(int doctorId);
        Task<PatientDto?> GetPatientByIdAsync(int id);
        Task<PatientDto?> GetPatientByUserIdAsync(int userId);
        Task<PatientDto> CreatePatientAsync(CreatePatientDto dto);
        Task<bool> UpdatePatientAsync(int id, UpdatePatientDto dto);
        Task<bool> DeletePatientAsync(int id);
    }
}
