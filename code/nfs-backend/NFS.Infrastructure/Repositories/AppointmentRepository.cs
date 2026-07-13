using Microsoft.EntityFrameworkCore;
using NFS.Application.Interfaces;
using NFS.Application.DTOs;
using NFS.Domain.Entities;
using NFS.Infrastructure.Data;

namespace NFS.Infrastructure.Repositories
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
            var slot = await _context.AvailabilitySlots.FindAsync(appointment.SlotId)
                ?? throw new InvalidOperationException("Slot not found");

            if (slot.IsBooked)
                throw new InvalidOperationException("هذا الموعد محجوز مسبقاً");

            if (slot.DoctorId != appointment.DoctorId)
                throw new InvalidOperationException("الموعد لا يتبع هذا الطبيب");

            var hasOverlap = await HasOverlappingAppointmentAsync(
                appointment.DoctorId, slot.StartTime, slot.EndTime);

            if (hasOverlap)
                throw new InvalidOperationException("يوجد موعد آخر للطبيب في نفس الوقت");

            appointment.DoctorId = slot.DoctorId;
            _context.Appointments.Add(appointment);
            slot.IsBooked = true;
            await _context.SaveChangesAsync();
            return appointment;
        }
        public async Task<Appointment?> GetAppointmentByIdAsync(int id)
        {
            return await _context.Appointments
                .Include(a => a.Session)
                .FirstOrDefaultAsync(a => a.Id == id);
        }

        public async Task<IEnumerable<Appointment>> GetAppointmentsByPatientIdAsync(int patientId)
        {
            return await _context.Appointments
                .Include(a => a.AvailabilitySlot)
                .Include(a => a.Therapist)
                    .ThenInclude(t => t!.User)
                .Include(a => a.Session)
                .Where(a => a.PatientId == patientId)
                .OrderByDescending(a => a.CreatedAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<PatientAppointmentDto>> GetPatientAppointmentsDetailedAsync(int patientId)
        {
            var appointments = await GetAppointmentsByPatientIdAsync(patientId);

            return appointments.Select(a =>
            {
                var session = a.Session;
                var notes = session != null
                    ? _context.SessionNotes
                        .Where(sn => sn.SessionId == session.Id)
                        .OrderByDescending(sn => sn.CreatedAt)
                        .Select(sn => sn.NoteText)
                        .FirstOrDefault()
                    : null;

                return new PatientAppointmentDto
                {
                    Id = a.Id,
                    PatientId = a.PatientId,
                    DoctorId = a.DoctorId,
                    DoctorName = a.Therapist?.User != null
                        ? $"{a.Therapist.User.FirstName} {a.Therapist.User.LastName}"
                        : "المعالج النفسي",
                    Status = a.Status,
                    ScheduledStartTime = a.AvailabilitySlot?.StartTime,
                    ScheduledEndTime = a.AvailabilitySlot?.EndTime,
                    CreatedAt = a.CreatedAt,
                    SessionId = session?.Id,
                    ActualStartTime = session?.ActualStartTime,
                    ActualEndTime = session?.ActualEndTime,
                    Notes = notes ?? string.Empty,
                    Type = "أونلاين"
                };
            }).ToList();
        }

        public async Task<IEnumerable<DoctorAppointmentDto>> GetDoctorAppointmentsDetailedAsync(int doctorId)
        {
            var appointments = await _context.Appointments
                .Include(a => a.AvailabilitySlot)
                .Include(a => a.Patient)
                    .ThenInclude(p => p!.User)
                .Include(a => a.Session)
                .Where(a => a.DoctorId == doctorId)
                .OrderByDescending(a => a.CreatedAt)
                .ToListAsync();

            return appointments.Select(a =>
            {
                var session = a.Session;
                var notes = session != null
                    ? _context.SessionNotes
                        .Where(sn => sn.SessionId == session.Id)
                        .OrderByDescending(sn => sn.CreatedAt)
                        .Select(sn => sn.NoteText)
                        .FirstOrDefault()
                    : null;

                var patientUser = a.Patient?.User;
                return new DoctorAppointmentDto
                {
                    Id = a.Id,
                    PatientId = a.PatientId,
                    PatientName = patientUser != null
                        ? $"{patientUser.FirstName} {patientUser.LastName}"
                        : "مريض",
                    PatientImageUrl = patientUser?.ProfileImageUrl,
                    PatientNotes = a.Patient?.Notes ?? a.Patient?.MedicalHistory,
                    DoctorId = a.DoctorId,
                    Status = a.Status,
                    ScheduledStartTime = a.AvailabilitySlot?.StartTime,
                    ScheduledEndTime = a.AvailabilitySlot?.EndTime,
                    CreatedAt = a.CreatedAt,
                    SessionId = session?.Id,
                    ActualStartTime = session?.ActualStartTime,
                    ActualEndTime = session?.ActualEndTime,
                    Notes = notes ?? string.Empty,
                    Type = "أونلاين"
                };
            }).ToList();
        }

        public async Task UpdateAppointmentStatusAsync(int appointmentId, string status)
        {
            var appointment = await _context.Appointments
                .Include(a => a.AvailabilitySlot)
                .FirstOrDefaultAsync(a => a.Id == appointmentId);

            if (appointment == null) return;

            var confirming =
                string.Equals(status, "Confirmed", StringComparison.OrdinalIgnoreCase) ||
                string.Equals(status, "Scheduled", StringComparison.OrdinalIgnoreCase) ||
                string.Equals(status, "Active", StringComparison.OrdinalIgnoreCase);

            if (confirming && appointment.AvailabilitySlot != null)
            {
                var slot = appointment.AvailabilitySlot;
                if (await HasOverlappingAppointmentAsync(
                        appointment.DoctorId, slot.StartTime, slot.EndTime, appointment.Id))
                {
                    throw new InvalidOperationException("يوجد موعد آخر للطبيب في نفس الوقت");
                }
            }

            appointment.Status = status;
            await _context.SaveChangesAsync();
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

            var newSlot = await _context.AvailabilitySlots.FindAsync(newSlotId);
            if (newSlot == null || newSlot.IsBooked)
                return false;

            if (await HasOverlappingAppointmentAsync(
                    appointment.DoctorId, newSlot.StartTime, newSlot.EndTime, appointment.Id))
                return false;

            var oldSlot = await _context.AvailabilitySlots.FindAsync(appointment.SlotId);
            if (oldSlot != null)
                oldSlot.IsBooked = false;

            appointment.SlotId = newSlotId;
            appointment.Status = "Rescheduled";
            newSlot.IsBooked = true;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<IEnumerable<AvailabilitySlot>> GetAvailableSlotsByDoctorIdAsync(int doctorId)
        {
            return await _context.AvailabilitySlots
                .Where(slot => slot.DoctorId == doctorId && slot.IsBooked == false)
                .OrderBy(slot => slot.StartTime)
                .ToListAsync();
        }

        public async Task<bool> HasOverlappingSlotAsync(int doctorId, DateTime start, DateTime end, int? excludeSlotId = null)
        {
            return await _context.AvailabilitySlots.AnyAsync(s =>
                s.DoctorId == doctorId &&
                (!excludeSlotId.HasValue || s.Id != excludeSlotId.Value) &&
                s.StartTime < end &&
                s.EndTime > start);
        }

        public async Task<bool> HasOverlappingAppointmentAsync(int doctorId, DateTime start, DateTime end, int? excludeAppointmentId = null)
        {
            var blockedStatuses = new[] { "Cancelled", "CANCELLED" };

            return await _context.Appointments
                .Include(a => a.AvailabilitySlot)
                .AnyAsync(a =>
                    a.DoctorId == doctorId &&
                    (!excludeAppointmentId.HasValue || a.Id != excludeAppointmentId.Value) &&
                    !blockedStatuses.Contains(a.Status) &&
                    a.AvailabilitySlot != null &&
                    a.AvailabilitySlot.StartTime < end &&
                    a.AvailabilitySlot.EndTime > start);
        }

        public async Task<AvailabilitySlot> CreateAvailabilitySlotAsync(AvailabilitySlot slot)
        {
            if (await HasOverlappingSlotAsync(slot.DoctorId, slot.StartTime, slot.EndTime))
                throw new InvalidOperationException("يوجد موعد توفر متداخل في نفس الوقت لهذا الطبيب");

            if (await HasOverlappingAppointmentAsync(slot.DoctorId, slot.StartTime, slot.EndTime))
                throw new InvalidOperationException("يوجد موعد محجوز للطبيب في نفس الوقت");

            _context.AvailabilitySlots.Add(slot);
            await _context.SaveChangesAsync();
            return slot;
        }
    }
}