using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace NFS.Domain.Entities
{
    public class Appointment
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int PatientId { get; set; }

        [Required]
        [ForeignKey(nameof(PatientId))]
        public Patient? Patient { get; set; }


        [Required]
        public int DoctorId { get; set; }

        [Required]
        public int SlotId { get; set; }

        [ForeignKey(nameof(SlotId))]
        public AvailabilitySlot? AvailabilitySlot { get; set; }

        [Required]
        [MaxLength(20)]
        public string Status { get; set; } = "Pending";

        /// <summary>Set when an appointment reminder email was sent.</summary>
        public DateTime? ReminderSentAt { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        [ForeignKey(nameof(DoctorId))]
        public Therapist? Therapist { get; set; }

        public Session? Session { get; set; }
    }
}
