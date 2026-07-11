using Microsoft.EntityFrameworkCore;
using NFS.Application.Interfaces;
using NFS.Domain.Entities;
using NFS.Infrastructure.Data;
using NFS.Application.DTOs;
using System.Collections.Generic;

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
        
        // New method to retrieve sessions for a specific user
        public async Task<IEnumerable<UserSessionsDto>> GetSessionsByUserAsync(int userId)
        {
            var sessions = await _context.Sessions
                .Include(s => s.Appointment)
                    .ThenInclude(a => a.Therapist)
                        .ThenInclude(t => t.User)
                .Include(s => s.Appointment)
                    .ThenInclude(a => a.Patient)
                .Where(s => s.Appointment != null && s.Appointment.Patient != null && s.Appointment.Patient.UserId == userId)
                .Select(s => new UserSessionsDto
                {
                    Id = s.Id,
                    ActualStartTime = s.ActualStartTime,
                    ActualEndTime = s.ActualEndTime,
                    Status = s.Status,
                    DoctorName = s.Appointment.Therapist != null && s.Appointment.Therapist.User != null 
                        ? s.Appointment.Therapist.User.FirstName + " " + s.Appointment.Therapist.User.LastName 
                        : "المعالج النفسي",
                    Type = "أونلاين",
                    Notes = _context.SessionNotes
                        .Where(sn => sn.SessionId == s.Id)
                        .OrderByDescending(sn => sn.CreatedAt)
                        .Select(sn => sn.NoteText)
                        .FirstOrDefault() ?? string.Empty
                })
                .ToListAsync();

            return sessions;
        }
    }
}