using System;
using NafsApp.Enums;

namespace NafsApp.Models
{
    public class Payment
    {
        public int PaymentId { get; set; }
        public int BookingId { get; set; }
        public decimal Amount { get; set; }
        public   Currency Currency { get; set; } 
        public PaymentMethod PaymentMethod { get; set; } 
        public PaymentStatus PaymentStatus{ get; set; }
        public string? TransactionReference { get; set; } 
        public PaymentGateway PaymentGateway { get; set; } 
        public DateTime TransactionDate { get; set; } = DateTime.Now;

        public Booking? Booking { get; set; }
    }
}