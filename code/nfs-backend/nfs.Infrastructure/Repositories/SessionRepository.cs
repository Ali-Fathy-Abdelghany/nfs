using Microsoft.EntityFrameworkCore;
using NFS.Application.Interfaces;
using NFS.Domain.Entities;
using NFS.Infrastructure.Data;

namespace NFS.Infrastructure.Repositories
{
    public class SessionRepository : ISessionRepository
    {
        private readonly ApplicationDbContext _context;

        public SessionRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Session> StartSessionAsync(int appointmentId)
        {
            var session = new Session
            {
                AppointmentId = appointmentId,
                ActualStartTime = DateTime.UtcNow,
                Status = "Active",
                MeetingLink = "https://meet.google.com/abc-xyz-123" 
            };

            _context.Sessions.Add(session);

            var appointment = await _context.Appointments.FindAsync(appointmentId);
            if (appointment != null)
            {
                appointment.Status = "In Progress";
            }

            await _context.SaveChangesAsync();
            return session;
        }
        public async Task<bool> EndSessionAsync(int sessionId, string notesContent)
        {
            var session = await _context.Sessions.FindAsync(sessionId);
            if (session == null) return false;

            session.ActualEndTime = DateTime.UtcNow;
            session.Status = "Completed";

            var notes = new SessionNote
            {
                SessionId = sessionId,
                NoteText = notesContent,
                CreatedAt = DateTime.UtcNow
            };

            _context.SessionNotes.Add(notes);

            var appointment = await _context.Appointments.FindAsync(session.AppointmentId);
            if (appointment != null)
            {
                appointment.Status = "Completed";
            }

            await _context.SaveChangesAsync();
            return true;
        }
    }
}