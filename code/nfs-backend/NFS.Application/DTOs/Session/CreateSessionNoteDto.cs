using System.ComponentModel.DataAnnotations;

namespace NFS.Application.DTOs
{
    public class CreateSessionNoteDto
    {
        [Required]
        public int SessionId { get; set; }

        [Required]
        public int DoctorId { get; set; }

        [Required]
        public string NoteText { get; set; } = string.Empty;
    }
}