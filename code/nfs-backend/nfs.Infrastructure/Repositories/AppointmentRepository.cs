using Microsoft.EntityFrameworkCore;
using nfs.Application.Interfaces;
using nfs.Domain.Entities;
using nfs.Infrastructure.Data;

namespace nfs.Infrastructure.Repositories
{
    public class AppointmentRepository : IAppointmentRepository
    {
        private readonly ApplicationDbContext _context;

        public AppointmentRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Appointment> CreateAppointmentAsync(Appointment appointment)
        {
            _context.Appointments.Add(appointment);

            var slot = await _context.AvailabilitySlots.FindAsync(appointment.SlotId);
            if (slot != null)
            {
                slot.IsBooked = true; // خلاص مابقاش متاح!
            }

            await _context.SaveChangesAsync();
            return appointment;
        }
        public async Task<Appointment?> GetAppointmentByIdAsync(int id)
        {
            return await _context.Appointments
                .Include(a => a.Session) // لو عايزة تجيبي بيانات الجلسة المرتبطة بالموعد فوراً
                .FirstOrDefaultAsync(a => a.Id == id);
        }

        public async Task<IEnumerable<Appointment>> GetAppointmentsByPatientIdAsync(int patientId)
        {
            return await _context.Appointments
                .Where(a => a.PatientId == patientId)
                .ToListAsync();
        }

        public async Task UpdateAppointmentStatusAsync(int appointmentId, string status)
        {
            var appointment = await _context.Appointments.FindAsync(appointmentId);
            if (appointment != null)
            {
                appointment.Status = status;
                await _context.SaveChangesAsync();
            }
        }

        public async Task<bool> CancelAppointmentAsync(int id)
        {
            var appointment = await _context.Appointments.FindAsync(id);
            if (appointment == null) return false;

            appointment.Status = "Cancelled";

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> RescheduleAppointmentAsync(int id, int newSlotId)
        {
            var appointment = await _context.Appointments.FindAsync(id);
            if (appointment == null) return false;

            appointment.SlotId = newSlotId;
            appointment.Status = "Rescheduled";

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<IEnumerable<AvailabilitySlot>> GetAvailableSlotsByDoctorIdAsync(int doctorId)
        {
            return await _context.AvailabilitySlots
                .Where(slot => slot.DoctorId == doctorId && slot.IsBooked == false) // الفترات التابعة للدكتور وغير المحجوزة فقط
                .ToListAsync();
        }
    }
}