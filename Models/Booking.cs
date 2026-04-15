using System;
using NafsApp.Enums;
namespace NafsApp.Models
{
    public class Booking
    {
        public int BookingId { get; set; }
        public int? PaymentId { get; set; }
        public int ClientId { get; set; }
        public int SessionId { get; set; }
        public DateTime BookingDate { get; set; } = DateTime.Now;
        public BookingStatus Status { get; set; } 
        public BookingType BookingType { get; set; }
        public string? CancellationReason { get; set; } 
        public CancellationBy? CancelledBy { get; set; } 
        public DateTime? CancelledAt { get; set; }

        public Client? Client { get; set; }
        public Session? Session { get; set; }
        public Payment? Payment { get; set; }
        public bool IsCancelled => Status == BookingStatus.Cancelled;

    }
}