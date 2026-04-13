using System;

namespace NafsApp.Models
{
    public class Payment
    {
        public int PaymentId { get; set; }
        public int BookingId { get; set; }
        public decimal Amount { get; set; }
        public string Currency { get; set; } = "";
        public string PaymentMethod { get; set; } = "";
        public string PaymentStatus { get; set; } = "";
        public string TransactionReference { get; set; } = "";
        public string PaymentGateway { get; set; } = "";
        public DateTime TransactionDate { get; set; } = DateTime.Now;

        public Booking? Booking { get; set; }
    }
}