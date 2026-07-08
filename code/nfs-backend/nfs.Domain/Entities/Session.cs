using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace nfs.Domain.Entities
{
    public class Session
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int AppointmentId { get; set; } // ربط مع جدول الحجوزات

        [ForeignKey("AppointmentId")]
        public Appointment Appointment { get; set; }

        public DateTime? ActualStartTime { get; set; } // وقت البداية الفعلي (علامة الاستفهام تعني أنه يمكن أن يكون null قبل تبدأ الجلسة)

        public DateTime? ActualEndTime { get; set; } // وقت النهاية الفعلي

        [MaxLength(500)]
        public string MeetingLink { get; set; } // رابط غرفة الفيديو (مثل Zoom أو WebRTC)

        [Required]
        [MaxLength(20)]
        public string Status { get; set; } = "Scheduled"; // حالة الجلسة (Scheduled, Active, Completed)
    }
}