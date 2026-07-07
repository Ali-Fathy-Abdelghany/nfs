using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NafsApp.Data;
using NafsApp.Models;

namespace NafsApp.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PatientsController : ControllerBase
    {
        private readonly AppDbContext _db;
        public PatientsController(AppDbContext db) => _db = db;

        [HttpGet]
        public IActionResult GetAll() => Ok(_db.Clients.Include(c => c.User).ToList());

        [HttpGet("{id}")]
        public IActionResult Get(int id)
        {
            var c = _db.Clients.Include(c => c.User).FirstOrDefault(x => x.ClientId == id);
            if (c == null) return NotFound();
            return Ok(c);
        }

        [HttpPost]
        public IActionResult Create(Client client)
        {
            _db.Clients.Add(client);
            _db.SaveChanges();
            return CreatedAtAction(nameof(Get), new { id = client.ClientId }, client);
        }

        [HttpGet("{id}/medical-history")]
        public IActionResult GetMedicalHistory(int id)
        {
            var items = _db.PatientMedicalHistories.Where(m => m.ClientId == id).ToList();
            return Ok(items);
        }
    }
}