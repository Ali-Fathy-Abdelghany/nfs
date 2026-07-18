using NFS.Application.DTOs.LiveKit;

namespace NFS.Application.Interfaces.Services
{
    public interface ILiveKitMeetingService
    {
        Task<LiveKitTokenDto?> CreateMeetingTokenAsync(
            int appointmentId,
            int userId,
            CancellationToken cancellationToken = default);
    }
}
