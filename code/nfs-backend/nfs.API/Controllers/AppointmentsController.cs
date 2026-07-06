using Microsoft.AspNetCore.Mvc;
using nfs.Application.DTOs;
using nfs.Application.Interfaces;
using nfs.Domain.Entities;

namespace nfs.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AppointmentsController : ControllerBase
    {
        private readonly IAppointmentRepository _appointmentRepository;

        public AppointmentsController(IAppointmentRepository appointmentRepository)
        {
            _appointmentRepository = appointmentRepository;
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateAppointmentDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var appointment = new Appointment
            {
                PatientId = dto.PatientId,
                DoctorId = dto.DoctorId,
                SlotId = dto.SlotId,
                Status = "Pending",
                CreatedAt = DateTime.UtcNow
            };

            var createdAppointment = await _appointmentRepository.CreateAppointmentAsync(appointment);

            var resultDto = new AppointmentDto
            {
                Id = createdAppointment.Id,
                PatientId = createdAppointment.PatientId,
                DoctorId = createdAppointment.DoctorId,
                SlotId = createdAppointment.SlotId,
                Status = createdAppointment.Status,
                CreatedAt = createdAppointment.CreatedAt
            };

            return Ok(resultDto);
        }

        [HttpGet("patient/{patientId}")]
        public async Task<IActionResult> GetByPatient(int patientId)
        {
            var appointments = await _appointmentRepository.GetAppointmentsByPatientIdAsync(patientId);

            var result = appointments.Select(a => new AppointmentDto
            {
                Id = a.Id,
                PatientId = a.PatientId,
                DoctorId = a.DoctorId,
                SlotId = a.SlotId,
                Status = a.Status,
                CreatedAt = a.CreatedAt
            });

            return Ok(result);
        }

        [HttpPut("reschedule")]
        public async Task<IActionResult> Reschedule([FromBody] RescheduleAppointmentDto dto)
        {
            var result = await _appointmentRepository.RescheduleAppointmentAsync(dto.AppointmentId, dto.NewSlotId);
            if (!result)
                return NotFound(new { message = "Appointment not found" });

            return Ok(new { message = "Appointment rescheduled successfully" });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Cancel(int id)
        {
            var result = await _appointmentRepository.CancelAppointmentAsync(id);
            if (!result)
                return NotFound(new { message = "Appointment not found" });

            return Ok(new { message = "Appointment cancelled successfully" });
        }

        [HttpGet("availability/{doctorId}")]
        public async Task<IActionResult> GetAvailability(int doctorId)
        {
            var slots = await _appointmentRepository.GetAvailableSlotsByDoctorIdAsync(doctorId);

            var result = slots.Select(s => new {
                s.Id,
                s.DoctorId,
                s.StartTime,
                s.EndTime,
                s.IsBooked
            });

            return Ok(result);
        }
    }
}