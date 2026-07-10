using Microsoft.AspNetCore.Mvc;
using NFS.Application.DTOs;
using NFS.Domain.Entities;
using NFS.Infrastructure.Data;
using NFS.Application.Interfaces.Services;
using System;
using System.Threading.Tasks;

namespace NFS.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AssessmentsController : ControllerBase
    {
        private readonly IAssessmentService _assessmentService;

        public AssessmentsController(IAssessmentService assessmentService)
        {
            _assessmentService = assessmentService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
            => Ok(await _assessmentService.GetAllAssessmentsAsync());

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateAssessmentDto dto)
        {
            try
            {
                var assessment = await _assessmentService.CreateAssessmentAsync(dto);
                return CreatedAtAction(nameof(GetAll), new { id = assessment.AssessmentId }, assessment);
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }

        [HttpPost("{id}/results")]
        public async Task<IActionResult> AddResult(int id, [FromBody] AssessmentResult result)
        {
            try
            {
                var created = await _assessmentService.AddResultAsync(id, result);
                return CreatedAtAction(nameof(GetAll), new { id = created.AssessmentResultId }, created);
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }
    }
}
