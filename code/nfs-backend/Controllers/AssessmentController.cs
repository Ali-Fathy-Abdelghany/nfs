using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NafsApp.DTOs;
using NafsApp.Services;

namespace NafsApp.Controllers
{
    [ApiController]
    [Route("assessments")]
    [Authorize]
    public class AssessmentController : ControllerBase
    {
        private readonly IAssessmentService _assessmentService;

        public AssessmentController(IAssessmentService assessmentService)
        {
            _assessmentService = assessmentService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var assessments = await _assessmentService.GetAllAssessmentsAsync();
            return Ok(assessments);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var assessment = await _assessmentService.GetAssessmentByIdAsync(id);
            if (assessment == null) return NotFound(new { Message = "Assessment not found." });
            return Ok(assessment);
        }

        [HttpGet("patient/{patientId}")]
        public async Task<IActionResult> GetByPatientId(int patientId)
        {
            var assessments = await _assessmentService.GetAssessmentsByPatientIdAsync(patientId);
            return Ok(assessments);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateAssessmentDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            try
            {
                var assessment = await _assessmentService.CreateAssessmentAsync(dto);
                return CreatedAtAction(nameof(GetById), new { id = assessment.AssessmentId }, assessment);
            }
            catch (ArgumentException ex)
            {
                return NotFound(new { Message = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _assessmentService.DeleteAssessmentAsync(id);
            if (!result) return NotFound(new { Message = "Assessment not found." });

            return Ok(new { Message = "Assessment deleted successfully." });
        }
    }
}
