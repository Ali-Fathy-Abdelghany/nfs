namespace NFS.Application.DTOs
{
    public class RescheduleAppointmentDto
    {
        public int AppointmentId { get; set; }
        public int NewSlotId { get; set; }
    }
}