using System;
using NafsApp.Enums;

namespace NafsApp.Models
{
    public class SessionParticipant
    {
        public int SessionId { get; set; }
        public int ClientId { get; set; }
        public DateTime JoinedAt { get; set; } = DateTime.Now;
        public DateTime? LeftAt { get; set; } 
        public AttendanceStatus Status { get; set; } = AttendanceStatus.Pending;
        public Session? Session { get; set; }
        public Client? Client { get; set; }
    }
}
