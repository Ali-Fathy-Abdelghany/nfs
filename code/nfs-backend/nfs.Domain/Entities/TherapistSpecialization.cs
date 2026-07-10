namespace NFS.Domain.Entities
{
    public class TherapistSpecialization
    {
        public int TherapistId { get; set; }
        public Therapist? Therapist { get; set; }

        public int SpecializationId { get; set; }
        public Specialization? Specialization { get; set; }
        public int YearsOfSpecializationExperience { get; set; }
    }
}