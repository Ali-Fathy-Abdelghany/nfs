using System.ComponentModel.DataAnnotations;

namespace NafsApp.DTOs
{
    public class CreateTherapistDto
    {
        [Required]
        public int UserId { get; set; }
        
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
