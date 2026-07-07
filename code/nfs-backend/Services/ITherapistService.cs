using System.Collections.Generic;
using System.Threading.Tasks;
using NafsApp.DTOs;

namespace NafsApp.Services
{
    public interface ITherapistService
    {
        Task<IEnumerable<TherapistDto>> GetAllTherapistsAsync();
        Task<TherapistDto?> GetTherapistByIdAsync(int id);
        Task<TherapistDto?> GetTherapistByUserIdAsync(int userId);
        Task<TherapistDto> CreateTherapistAsync(CreateTherapistDto dto);
        Task<bool> UpdateTherapistAsync(int id, UpdateTherapistDto dto);
        Task<bool> DeleteTherapistAsync(int id);
    }
}
