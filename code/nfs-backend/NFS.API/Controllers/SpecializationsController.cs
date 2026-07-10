using Microsoft.AspNetCore.Mvc;
using NFS.Domain.Entities;
using NFS.Infrastructure.Data;
using System.Linq;

namespace NFS.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SpecializationsController : ControllerBase
    {
        private readonly ApplicationDbContext _db;
        public SpecializationsController(ApplicationDbContext db) => _db = db;

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
            return CreatedAtAction(nameof(Get), new { id = specialization.Id }, specialization);
        }
    }
}