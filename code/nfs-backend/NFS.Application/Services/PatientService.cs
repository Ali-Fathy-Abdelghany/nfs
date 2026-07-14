using Microsoft.EntityFrameworkCore;
using NFS.Application.DTOs;
using NFS.Application.Interfaces.Data;
using NFS.Application.Interfaces.Services;
using NFS.Domain.Entities;

namespace NFS.Application.Services
{
    public class PatientService : IPatientService
    {
        private readonly IApplicationDbContext _context;

        public PatientService(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<PatientDto>> GetAllPatientsAsync()
        {
            return await _context.Patients
                .Include(p => p.User)
                .Select(p => MapToDto(p))
                .ToListAsync();
        }

        public async Task<IEnumerable<PatientDto>> GetPatientsByDoctorIdAsync(int doctorId)
        {
            var patientIds = await _context.Appointments
                .Where(a => a.DoctorId == doctorId
                            && a.Status != "Cancelled"
                            && a.Status != "CANCELLED")
                .Select(a => a.PatientId)
                .Distinct()
                .ToListAsync();

            if (patientIds.Count == 0)
                return Array.Empty<PatientDto>();

            return await _context.Patients
                .Include(p => p.User)
                .Where(p => patientIds.Contains(p.PatientId))
                .Select(p => MapToDto(p))
                .ToListAsync();
        }

        public async Task<PatientDto?> GetPatientByIdAsync(int id)
        {
            var patient = await _context.Patients
                .Include(p => p.User)
                .FirstOrDefaultAsync(p => p.PatientId == id);
            return patient == null ? null : MapToDto(patient);
        }

        public async Task<PatientDto?> GetPatientByUserIdAsync(int userId)
        {
            var patient = await _context.Patients
                .Include(p => p.User)
                .FirstOrDefaultAsync(p => p.UserId == userId);
            return patient == null ? null : MapToDto(patient);
        }

        public async Task<PatientDto> CreatePatientAsync(CreatePatientDto dto)
        {
            var user = await _context.Users.FindAsync(dto.UserId)
                ?? throw new ArgumentException($"User with ID {dto.UserId} not found.");

            if (await _context.Patients.AnyAsync(p => p.UserId == dto.UserId))
                throw new InvalidOperationException($"Patient profile already exists for User ID {dto.UserId}.");

            var patient = new Patient
            {
                UserId = dto.UserId,
                EmergencyContactName = dto.EmergencyContactName,
                EmergencyContactPhone = dto.EmergencyContactPhone,
                MedicalHistory = dto.MedicalHistory,
                Notes = dto.Notes,
                CreatedAt = DateTime.UtcNow
            };

            _context.Patients.Add(patient);
            await _context.SaveChangesAsync();
            patient.User = user;
            return MapToDto(patient);
        }

        public async Task<bool> UpdatePatientAsync(int id, UpdatePatientDto dto)
        {
            var patient = await _context.Patients.FindAsync(id);
            if (patient == null) return false;

            patient.EmergencyContactName = dto.EmergencyContactName;
            patient.EmergencyContactPhone = dto.EmergencyContactPhone;
            patient.MedicalHistory = dto.MedicalHistory;
            patient.Notes = dto.Notes;
            patient.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeletePatientAsync(int id)
        {
            var patient = await _context.Patients.FindAsync(id);
            if (patient == null) return false;

            _context.Patients.Remove(patient);
            await _context.SaveChangesAsync();
            return true;
        }

        private static PatientDto MapToDto(Patient p) => new()
        {
            PatientId = p.PatientId,
            UserId = p.UserId,
            FirstName = p.User?.FirstName ?? "",
            LastName = p.User?.LastName ?? "",
            Email = p.User?.Email ?? "",
            Phone = p.User?.Phone,
            ProfileImageUrl = p.User?.ProfileImageUrl,
            EmergencyContactName = p.EmergencyContactName,
            EmergencyContactPhone = p.EmergencyContactPhone,
            MedicalHistory = p.MedicalHistory,
            Notes = p.Notes,
            CreatedAt = p.CreatedAt
        };
    }
}
