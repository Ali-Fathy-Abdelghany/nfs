using System.Collections.Generic;
using NafsApp.Enums;

namespace NafsApp.Models
{
    public class Availability
    {
        public int AvailabilityId { get; set; }
        public int TherapistId { get; set; }
        public required SessionType SessionType { get; set; }
        public required DayOfWeek DayOfWeek { get; set; }
        public TimeSpan StartTime { get; set; }
        public TimeSpan EndTime { get; set; }
        public Therapist? Therapist { get; set; }

    }
}