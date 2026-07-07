using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NafsApp.Data;
using NafsApp.Models;

namespace NafsApp.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AssessmentsController : ControllerBase
    {
        private readonly AppDbContext _db;
        public AssessmentsController(AppDbContext db) => _db = db;

        [HttpGet]
        public IActionResult GetAll() => Ok(_db.Assessments.Include(a => a.Therapist).ToList());

        [HttpPost]
        public IActionResult Create(Assessment assessment)
        {
            _db.Assessments.Add(assessment);
            _db.SaveChanges();
            return CreatedAtAction(nameof(GetAll), new { id = assessment.AssessmentId }, assessment);
        }

        [HttpPost("{id}/results")]
        public IActionResult AddResult(int id, AssessmentResult result)
        {
            var a = _db.Assessments.Find(id);
            if (a == null) return NotFound();
            result.AssessmentId = id;
            _db.AssessmentResults.Add(result);
            _db.SaveChanges();
            return CreatedAtAction(nameof(GetAll), new { id = result.AssessmentResultId }, result);
        }
    }
}