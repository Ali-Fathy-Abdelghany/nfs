using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace nfs.Domain.Entities
{
    public class SessionNote
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int SessionId { get; set; } // الملاحظات دي تابعة لأي جلسة؟

        [ForeignKey("SessionId")]
        public Session Session { get; set; }

        [Required]
        public int DoctorId { get; set; } // الطبيب اللي كتب الملاحظة للأمان

        [Required]
        public string? NoteText { get; set; } // نص التقرير والملاحظات النفسية (بدون تحديد طول لأنه قد يكون طويل جداً)

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}