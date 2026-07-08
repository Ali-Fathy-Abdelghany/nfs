using Microsoft.EntityFrameworkCore;
using nfs.Domain.Entities;
using nfs.Infrastructure.Data;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace nfs.Infrastructure.Repositories
{
    public interface IPatientRepository
    {
        Task<Patient> GetPatientByIdAsync(int id);
        Task<Patient> GetPatientByUserIdAsync(int userId);
        Task<List<Patient>> GetAllPatientsAsync();
        Task<List<Patient>> SearchPatientsAsync(string? name, string? primaryConcern);
        Task<Patient> AddPatientAsync(Patient patient);
        Task<Patient> UpdatePatientAsync(Patient patient);
        Task<bool> DeletePatientAsync(int id);
        Task<bool> ExistsAsync(int id);
        Task<List<PatientMedicalHistory>> GetPatientMedicalHistoryAsync(int patientId);
        Task<PatientMedicalHistory> AddMedicalHistoryAsync(PatientMedicalHistory medicalHistory);
        Task<PatientMedicalHistory> UpdateMedicalHistoryAsync(PatientMedicalHistory medicalHistory);
        Task<bool> DeleteMedicalHistoryAsync(int medicalHistoryId);
        Task<PatientMedicalHistory> GetMedicalHistoryByIdAsync(int id);
    }

    public class PatientRepository : IPatientRepository
    {
        private readonly ApplicationDbContext _context;

        public PatientRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Patient> GetPatientByIdAsync(int id)
        {
            return await _context.Patients
                .Include(p => p.MedicalHistories)
                .Include(p => p.Assessments)
                .FirstOrDefaultAsync(p => p.Id == id && p.IsActive);
        }

        public async Task<Patient> GetPatientByUserIdAsync(int userId)
        {
            return await _context.Patients
                .Include(p => p.MedicalHistories)
                .Include(p => p.Assessments)
                .FirstOrDefaultAsync(p => p.UserId == userId && p.IsActive);
        }

        public async Task<List<Patient>> GetAllPatientsAsync()
        {
            return await _context.Patients
                .Include(p => p.MedicalHistories)
                .Include(p => p.Assessments)
                .Where(p => p.IsActive)
                .ToListAsync();
        }

        public async Task<List<Patient>> SearchPatientsAsync(string? name, string? primaryConcern)
        {
            var query = _context.Patients
                .Include(p => p.MedicalHistories)
                .Include(p => p.Assessments)
                .Where(p => p.IsActive);

            if (!string.IsNullOrEmpty(name))
            {
                name = name.ToLower();
                query = query.Where(p => p.User.FirstName.ToLower().Contains(name) || 
                                         p.User.LastName.ToLower().Contains(name));
            }

            if (!string.IsNullOrEmpty(primaryConcern))
            {
                primaryConcern = primaryConcern.ToLower();
                query = query.Where(p => p.PrimaryConcern != null && p.PrimaryConcern.ToLower().Contains(primaryConcern));
            }

            return await query.ToListAsync();
        }

        public async Task<Patient> AddPatientAsync(Patient patient)
        {
            _context.Patients.Add(patient);
            await _context.SaveChangesAsync();
            return patient;
        }

        public async Task<Patient> UpdatePatientAsync(Patient patient)
        {
            patient.UpdatedAt = DateTime.UtcNow;
            _context.Patients.Update(patient);
            await _context.SaveChangesAsync();
            return patient;
        }

        public async Task<bool> DeletePatientAsync(int id)
        {
            var patient = await GetPatientByIdAsync(id);
            if (patient == null)
                return false;

            patient.IsActive = false;
            await UpdatePatientAsync(patient);
            return true;
        }

        public async Task<bool> ExistsAsync(int id)
        {
            return await _context.Patients.AnyAsync(p => p.Id == id && p.IsActive);
        }

        public async Task<List<PatientMedicalHistory>> GetPatientMedicalHistoryAsync(int patientId)
        {
            return await _context.PatientMedicalHistories
                .Where(pmh => pmh.PatientId == patientId)
                .OrderByDescending(pmh => pmh.DiagnosedDate)
                .ToListAsync();
        }

        public async Task<PatientMedicalHistory> AddMedicalHistoryAsync(PatientMedicalHistory medicalHistory)
        {
            _context.PatientMedicalHistories.Add(medicalHistory);
            await _context.SaveChangesAsync();
            return medicalHistory;
        }

        public async Task<PatientMedicalHistory> UpdateMedicalHistoryAsync(PatientMedicalHistory medicalHistory)
        {
            medicalHistory.UpdatedAt = DateTime.UtcNow;
            _context.PatientMedicalHistories.Update(medicalHistory);
            await _context.SaveChangesAsync();
            return medicalHistory;
        }

        public async Task<bool> DeleteMedicalHistoryAsync(int medicalHistoryId)
        {
            var medicalHistory = await GetMedicalHistoryByIdAsync(medicalHistoryId);
            if (medicalHistory == null)
                return false;

            _context.PatientMedicalHistories.Remove(medicalHistory);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<PatientMedicalHistory> GetMedicalHistoryByIdAsync(int id)
        {
            return await _context.PatientMedicalHistories.FirstOrDefaultAsync(pmh => pmh.Id == id);
        }
    }
}
