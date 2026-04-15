using System;
using System.Collections.Generic;
using NafsApp.Enums;
namespace NafsApp.Models
{
    public class Session
    {
        public int SessionId { get; set; }
        public int TherapistId { get; set; }
        public string Title { get; set; }=string.Empty;
        public string Description { get; set; } = string.Empty;
        public SessionStatus Status { get; set; }
        public decimal Price { get; set; }
        public int MaxCapacity { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.Now;
         public SessionRecording? Recording { get; set; }
        public Therapist? Therapist { get; set; }
        public List<Booking> Bookings { get; set; } = new();
        public List<Review> Reviews { get; set; } = new();
        public List<SessionParticipant> Participants { get; set; } = new();
    }
}