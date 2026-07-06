namespace nfs.Application.DTOs
{
    public class StartSessionDto
    {
        public int AppointmentId { get; set; }
    }

    public class EndSessionDto
    {
        public int SessionId { get; set; }
        public string NotesContent { get; set; } = string.Empty;
    }
}