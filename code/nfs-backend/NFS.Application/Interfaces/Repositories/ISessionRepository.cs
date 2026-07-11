using NFS.Domain.Entities;
using NFS.Application.DTOs;
using System.Collections.Generic;

namespace NFS.Application.Interfaces
{
    public interface ISessionRepository
    {
        Task<Session> StartSessionAsync(int appointmentId);

        Task<bool> EndSessionAsync(int sessionId, string notesContent);

        Task<IEnumerable<UserSessionsDto>> GetSessionsByUserAsync(int userId);
    }
}