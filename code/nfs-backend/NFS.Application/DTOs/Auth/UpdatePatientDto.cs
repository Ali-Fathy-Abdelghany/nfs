using System.ComponentModel.DataAnnotations;

namespace NFS.Application.DTOs
{
    public class UpdatePatientDto
    {
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
