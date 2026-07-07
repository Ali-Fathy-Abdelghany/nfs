using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NafsApp.Data;
using NafsApp.Models;

namespace NafsApp.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TherapistsController : ControllerBase
    {
        private readonly AppDbContext _db;
        public TherapistsController(AppDbContext db) => _db = db;

        [HttpGet]
        public IActionResult GetAll() => Ok(_db.Therapists.Include(t => t.User).Include(t => t.TherapistSpecializations).ThenInclude(ts => ts.Specialization).ToList());

        [HttpGet("{id}")]
        public IActionResult Get(int id)
        {
            var t = _db.Therapists.Include(t => t.User).Include(t => t.TherapistSpecializations).ThenInclude(ts => ts.Specialization).FirstOrDefault(t => t.TherapistId == id);
            if (t == null) return NotFound();
            return Ok(t);
        }

        [HttpPost]
        public IActionResult Register(Therapist therapist)
        {
            _db.Therapists.Add(therapist);
            _db.SaveChanges();
            return CreatedAtAction(nameof(Get), new { id = therapist.TherapistId }, therapist);
        }

        [HttpPost("{id}/approve")]
        public IActionResult Approve(int id)
        {
            var t = _db.Therapists.Find(id);
            if (t == null) return NotFound();
            t.IsVerified = true;
            _db.SaveChanges();
            return NoContent();
        }

        [HttpGet("search")]
        public IActionResult Search([FromQuery] string? q)
        {
            var list = _db.Therapists.Include(t => t.User).AsQueryable();
            if (!string.IsNullOrWhiteSpace(q))
            {
                list = list.Where(t => t.User != null && (t.User.FirstName.Contains(q) || t.User.LastName.Contains(q) || t.Bio.Contains(q)));
            }
            return Ok(list.ToList());
        }
    }
}