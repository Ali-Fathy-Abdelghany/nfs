using NFS.Domain.Entities;

namespace NFS.Application.Interfaces
{
    public interface ISessionRepository
    {
        Task<Session> StartSessionAsync(int appointmentId);

        Task<bool> EndSessionAsync(int sessionId, string notesContent);
    }
}