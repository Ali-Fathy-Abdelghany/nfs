using System.ComponentModel.DataAnnotations;

namespace nfs.Domain.Entities
{
    public class AvailabilitySlot
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int DoctorId { get; set; }

        [Required]
        public DateTime StartTime { get; set; }

        [Required]
        public DateTime EndTime { get; set; }

        [Required]
        public bool IsBooked { get; set; } = false;
    }
}