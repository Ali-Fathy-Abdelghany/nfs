using System.ComponentModel.DataAnnotations;

namespace nfs.Application.DTOs
{
    public class CreateAppointmentDto
    {
        [Required]
        public int PatientId { get; set; }

        [Required]
        public int DoctorId { get; set; }

        [Required]
        public int SlotId { get; set; }
    }
}