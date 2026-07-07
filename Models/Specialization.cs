namespace NafsApp.Models
{
    public class Specialization
    {
        public int SpecializationId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public List<TherapistSpecialization> TherapistSpecializations { get; set; } = new();
    }
}