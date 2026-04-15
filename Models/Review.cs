using System;
using NafsApp.Enums;

namespace NafsApp.Models
{
    public class Review
    {
        public int ReviewId { get; set; }
        public string Comment { get; set; }=string.Empty;
        public int Rating { get; set; }
        public int ClientId { get; set; }
        public Client? Client { get; set; }
        public int TherapistId { get; set; }
        public Therapist? Therapist { get; set; }
        public int SessionId { get; set; }
       public Session? Session { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.Now;
    }
}