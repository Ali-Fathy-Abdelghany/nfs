using System.ComponentModel.DataAnnotations;

namespace NafsApp.DTOs
{
    public class CreatePatientDto
    {
        [Required]
        public int UserId { get; set; }
        
        [MaxLength(200)]
        public string? EmergencyContactName { get; set; }
        
        [MaxLength(20)]
        public string? EmergencyContactPhone { get; set; }
        
        [MaxLength(2000)]
        public string? MedicalHistory { get; set; }
        
        [MaxLength(2000)]
        public string? Notes { get; set; }
    }
}
