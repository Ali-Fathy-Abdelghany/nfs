using nfs.Domain.Entities;

namespace nfs.Application.Interfaces
{
    public interface IAppointmentRepository
    {
        Task<Appointment> CreateAppointmentAsync(Appointment appointment);

        Task<Appointment?> GetAppointmentByIdAsync(int id);

        Task<IEnumerable<Appointment>> GetAppointmentsByPatientIdAsync(int patientId);

        Task UpdateAppointmentStatusAsync(int appointmentId, string status);

        Task<bool> CancelAppointmentAsync(int id);

        Task<bool> RescheduleAppointmentAsync(int id, int newSlotId);
        Task<IEnumerable<AvailabilitySlot>> GetAvailableSlotsByDoctorIdAsync(int doctorId);
    }
}