using nfs.Domain.Entities;

namespace nfs.Application.Interfaces
{
    public interface ISessionRepository
    {
        Task<Session> StartSessionAsync(int appointmentId);

        Task<bool> EndSessionAsync(int sessionId, string notesContent);
    }
}