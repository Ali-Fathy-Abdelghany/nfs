using Livekit.Server.Sdk.Dotnet;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using NFS.Application.DTOs.LiveKit;
using NFS.Application.Interfaces.Data;
using NFS.Application.Interfaces.Services;
using NFS.Application.Options;

namespace NFS.Infrastructure.Services
{
    public class LiveKitMeetingService : ILiveKitMeetingService
    {
        private readonly IApplicationDbContext _context;
        private readonly LiveKitOptions _options;

        public LiveKitMeetingService(
            IApplicationDbContext context,
            IOptions<LiveKitOptions> options)
        {
            _context = context;
            _options = options.Value;
        }

        public async Task<LiveKitTokenDto?> CreateMeetingTokenAsync(
            int appointmentId,
            int userId,
            CancellationToken cancellationToken = default)
        {
            if (!_options.IsConfigured)
                throw new InvalidOperationException("LiveKit is not configured.");

            var appointment = await _context.Appointments
                .AsNoTracking()
                .Include(a => a.Patient)
                    .ThenInclude(p => p!.User)
                .Include(a => a.Therapist)
                    .ThenInclude(t => t!.User)
                .FirstOrDefaultAsync(a => a.Id == appointmentId, cancellationToken);

            if (appointment == null) return null;

            var patientUser = appointment.Patient?.User;
            var therapistUser = appointment.Therapist?.User;
            var participant = patientUser?.UserId == userId
                ? patientUser
                : therapistUser?.UserId == userId
                    ? therapistUser
                    : null;

            if (participant == null) return null;

            if (!string.Equals(appointment.Status, "Confirmed", StringComparison.OrdinalIgnoreCase))
                throw new InvalidOperationException("Only confirmed appointments can join a video meeting.");

            var roomName = $"nafs-appointment-{appointment.Id}";
            var participantName =
                $"{participant.FirstName} {participant.LastName}".Trim();

            var token = new AccessToken(_options.ApiKey, _options.ApiSecret)
                .WithIdentity($"user-{participant.UserId}")
                .WithName(participantName)
                .WithGrants(new VideoGrants
                {
                    RoomJoin = true,
                    Room = roomName,
                    CanPublish = true,
                    CanSubscribe = true
                })
                .WithTtl(TimeSpan.FromHours(2))
                .ToJwt();

            return new LiveKitTokenDto
            {
                Token = token,
                ServerUrl = _options.Url,
                RoomName = roomName,
                ParticipantName = participantName
            };
        }
    }
}
