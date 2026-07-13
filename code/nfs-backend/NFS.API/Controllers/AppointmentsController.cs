using Microsoft.AspNetCore.Mvc;
using NFS.Application.DTOs;
using NFS.Application.Interfaces;
using NFS.Domain.Entities;

namespace NFS.API.Controllers
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

            try
            {
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
            catch (InvalidOperationException ex)
            {
                return Conflict(new { message = ex.Message });
            }
        }

        [HttpGet("patient/{patientId}")]
        public async Task<IActionResult> GetByPatient(int patientId)
        {
            var appointments = await _appointmentRepository.GetPatientAppointmentsDetailedAsync(patientId);
            return Ok(appointments);
        }

        [HttpGet("doctor/{doctorId}")]
        public async Task<IActionResult> GetByDoctor(int doctorId)
        {
            var appointments = await _appointmentRepository.GetDoctorAppointmentsDetailedAsync(doctorId);
            return Ok(appointments);
        }

        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateAppointmentStatusDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Status))
                return BadRequest(new { message = "Status is required" });

            var appointment = await _appointmentRepository.GetAppointmentByIdAsync(id);
            if (appointment == null)
                return NotFound(new { message = "Appointment not found" });

            try
            {
                await _appointmentRepository.UpdateAppointmentStatusAsync(id, dto.Status);
                return Ok(new { message = "Status updated", status = dto.Status });
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { message = ex.Message });
            }
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

        [HttpPost("availability")]
        public async Task<IActionResult> CreateAvailability([FromBody] CreateAvailabilitySlotDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            if (dto.EndTime <= dto.StartTime)
                return BadRequest(new { message = "EndTime must be after StartTime" });

            try
            {
                var slot = await _appointmentRepository.CreateAvailabilitySlotAsync(new AvailabilitySlot
                {
                    DoctorId = dto.DoctorId,
                    StartTime = dto.StartTime,
                    EndTime = dto.EndTime,
                    IsBooked = false
                });

                return Ok(new
                {
                    slot.Id,
                    slot.DoctorId,
                    slot.StartTime,
                    slot.EndTime,
                    slot.IsBooked
                });
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { message = ex.Message });
            }
        }
    }
}