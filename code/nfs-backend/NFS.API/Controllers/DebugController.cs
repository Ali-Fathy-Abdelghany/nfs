using Microsoft.AspNetCore.Mvc;
using NFS.Infrastructure.Data;
using System.Collections.Generic;
using System.Threading.Tasks;
using NFS.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace NFS.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DebugController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        public DebugController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET api/debug/slots
        [HttpGet("slots")]
        public async Task<ActionResult<IEnumerable<AvailabilitySlot>>> GetSlots()
        {
            var slots = await _context.AvailabilitySlots
                .Include(s => s.Doctor)
                .ToListAsync();
            return Ok(slots);
        }

        // GET api/debug/appointments
        [HttpGet("appointments")]
        public async Task<ActionResult<IEnumerable<Appointment>>> GetAppointments()
        {
            var appointments = await _context.Appointments
                .Include(a => a.Patient)
                .Include(a => a.Therapist)
                .Include(a => a.AvailabilitySlot)
                .ToListAsync();
            return Ok(appointments);
        }
    }
}
