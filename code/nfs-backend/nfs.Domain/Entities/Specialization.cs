namespace NFS.Domain.Entities
{
    public class Specialization
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public List<TherapistSpecialization> TherapistSpecializations { get; set; } = new();
    }
}