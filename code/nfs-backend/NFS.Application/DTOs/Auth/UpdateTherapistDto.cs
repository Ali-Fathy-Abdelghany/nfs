using System.ComponentModel.DataAnnotations;

namespace NFS.Application.DTOs
{
    public class UpdateTherapistDto
    {
        [MaxLength(100)]
        public string? FirstName { get; set; }

        [MaxLength(100)]
        public string? LastName { get; set; }

        [MaxLength(30)]
        public string? Phone { get; set; }

        [Required]
        [MaxLength(200)]
        public string Specialization { get; set; } = null!;
        
        [MaxLength(1000)]
        public string? Bio { get; set; }
        
        public int ExperienceYears { get; set; }
        
        public decimal HourlyRate { get; set; }
        
        [MaxLength(1000)]
        public string? Qualifications { get; set; }
    }
}
