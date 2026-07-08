using Microsoft.AspNetCore.Mvc;
using NafsApp.Data;
using NafsApp.Models;

namespace NafsApp.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SpecializationsController : ControllerBase
    {
        private readonly AppDbContext _db;
        public SpecializationsController(AppDbContext db) => _db = db;

        [HttpGet]
        public IActionResult GetAll() => Ok(_db.Specializations.ToList());

        [HttpGet("{id}")]
        public IActionResult Get(int id)
        {
            var s = _db.Specializations.Find(id);
            if (s == null) return NotFound();
            return Ok(s);
        }

        [HttpPost]
        public IActionResult Create(Specialization specialization)
        {
            _db.Specializations.Add(specialization);
            _db.SaveChanges();
            return CreatedAtAction(nameof(Get), new { id = specialization.SpecializationId }, specialization);
        }
    }
}