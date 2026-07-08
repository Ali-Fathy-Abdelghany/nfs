namespace NafsApp.Models
{
    public class TherapistSpecialization
    {
        public int TherapistId { get; set; }
        public Therapist? Therapist { get; set; }

        public int SpecializationId { get; set; }
        public Specialization? Specialization { get; set; }
    }
}