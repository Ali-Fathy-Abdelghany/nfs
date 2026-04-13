using System;

namespace NafsApp.Models
{
    public class Booking
    {
        public int BookingId { get; set; }
        public int ClientId { get; set; }
        public int SessionId { get; set; }
        public DateTime BookingDate { get; set; } = DateTime.Now;
        public string Status { get; set; } = "";
        public bool IsFreeTrial { get; set; }
        public DateTime? CancelledAt { get; set; }
        public string CancellationReason { get; set; } = "";
        public string CancelledBy { get; set; } = "";

        public Client? Client { get; set; }
        public Session? Session { get; set; }
        public Payment? Payment { get; set; }
    }
}