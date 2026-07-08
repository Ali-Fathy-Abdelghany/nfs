namespace nfs.Application.DTOs
{
    public class AppointmentDto
    {
        public int Id { get; set; }
        public int PatientId { get; set; }
        public int DoctorId { get; set; }
        public int SlotId { get; set; }
        public string Status { get; set; } = string.Empty; public DateTime CreatedAt { get; set; }
    }
}