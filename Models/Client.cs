using System.Collections.Generic;

namespace NafsApp.Models
{
    public class Client
    {
        public int ClientId { get; set; }
        public string TherapyGoal { get; set; } = "";
        public bool RiskFlag { get; set; }
        public string PrimaryConcern { get; set; } = "";
        public string MaritalStatus { get; set; } = "";
        public string EmergencyContactName { get; set; } = "";
        public string EmergencyContactPhone { get; set; } = "";

        public User? User { get; set; }
        public List<Booking> Bookings { get; set; } = new();
    }
}