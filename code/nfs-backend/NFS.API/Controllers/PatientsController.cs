using Microsoft.AspNetCore.Mvc;
using NFS.Application.DTOs;
using NFS.Domain.Entities;
using NFS.Infrastructure.Data;
using NFS.Application.Interfaces.Services;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace NFS.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PatientsController : ControllerBase
    {
        private readonly IPatientService _patientService;
        private readonly ApplicationDbContext _db;

        public PatientsController(IPatientService patientService, ApplicationDbContext db)
        {
            _patientService = patientService;
            _db = db;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
            => Ok(await _patientService.GetAllPatientsAsync());

        [HttpGet("{id}")]
        public async Task<IActionResult> Get(int id)
        {
            var patient = await _patientService.GetPatientByIdAsync(id);
            return patient == null ? NotFound() : Ok(patient);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreatePatientDto dto)
        {
            try
            {
                var patient = await _patientService.CreatePatientAsync(dto);
                return CreatedAtAction(nameof(Get), new { id = patient.PatientId }, patient);
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }

        [HttpGet("{id}/medical-history")]
        public IActionResult GetMedicalHistory(int id)
        {
            var items = _db.PatientMedicalHistories.Where(m => m.PatientId == id).ToList();
            return Ok(items);
        }
    }
}
