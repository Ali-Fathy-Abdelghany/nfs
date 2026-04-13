using System;
using System.Collections.Generic;

namespace NafsApp.Models
{
    public class Session
    {
        public int SessionId { get; set; }
        public int TherapistId { get; set; }
        public string Title { get; set; } = "";
        public string Description { get; set; } = "";
        public string SessionType { get; set; } = "";
        public decimal Price { get; set; }
        public int MaxCapacity { get; set; }
        public string Status { get; set; } = "";
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.Now;

        public Therapist? Therapist { get; set; }
        public List<Booking> Bookings { get; set; } = new();
    }
}