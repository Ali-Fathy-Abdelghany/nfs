using System.ComponentModel.DataAnnotations;

namespace nfs.Application.DTOs
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