using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NafsApp.DTOs;
using NafsApp.Services;

namespace NafsApp.Controllers
{
    [ApiController]
    [Route("patients")]
    [Authorize]
    public class PatientController : ControllerBase
    {
        private readonly IPatientService _patientService;

        public PatientController(IPatientService patientService)
        {
            _patientService = patientService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var patients = await _patientService.GetAllPatientsAsync();
            return Ok(patients);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var patient = await _patientService.GetPatientByIdAsync(id);
            if (patient == null) return NotFound(new { Message = "Patient profile not found." });
            return Ok(patient);
        }

        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetByUserId(int userId)
        {
            var patient = await _patientService.GetPatientByUserIdAsync(userId);
            if (patient == null) return NotFound(new { Message = "Patient profile not found for this user." });
            return Ok(patient);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreatePatientDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            try
            {
                var patient = await _patientService.CreatePatientAsync(dto);
                return CreatedAtAction(nameof(GetById), new { id = patient.PatientId }, patient);
            }
            catch (ArgumentException ex)
            {
                return NotFound(new { Message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdatePatientDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var result = await _patientService.UpdatePatientAsync(id, dto);
            if (!result) return NotFound(new { Message = "Patient profile not found or update failed." });

            return Ok(new { Message = "Patient profile updated successfully." });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _patientService.DeletePatientAsync(id);
            if (!result) return NotFound(new { Message = "Patient profile not found." });

            return Ok(new { Message = "Patient profile deleted successfully." });
        }
    }
}
