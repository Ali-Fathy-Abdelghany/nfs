using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NFS.Application.DTOs;
using NFS.Domain.Entities;
using NFS.Infrastructure.Data;

namespace NFS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DiariesController : ControllerBase
{
    private readonly ApplicationDbContext _db;

    public DiariesController(ApplicationDbContext db)
    {
        _db = db;
    }

    [HttpGet("patient/{patientId}")]
    public async Task<IActionResult> GetByPatient(int patientId)
    {
        var entries = await _db.DiaryEntries
            .Where(d => d.PatientId == patientId)
            .OrderByDescending(d => d.CreatedAt)
            .Select(d => new DiaryEntryDto
            {
                Id = d.Id,
                PatientId = d.PatientId,
                Title = d.Title,
                Content = d.Content,
                Mood = d.Mood,
                CreatedAt = d.CreatedAt,
                UpdatedAt = d.UpdatedAt
            })
            .ToListAsync();

        return Ok(entries);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateDiaryEntryDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var entry = new DiaryEntry
        {
            PatientId = dto.PatientId,
            Title = dto.Title.Trim(),
            Content = dto.Content.Trim(),
            Mood = dto.Mood.Trim(),
            CreatedAt = DateTime.UtcNow
        };

        _db.DiaryEntries.Add(entry);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetByPatient), new { patientId = entry.PatientId }, new DiaryEntryDto
        {
            Id = entry.Id,
            PatientId = entry.PatientId,
            Title = entry.Title,
            Content = entry.Content,
            Mood = entry.Mood,
            CreatedAt = entry.CreatedAt,
            UpdatedAt = entry.UpdatedAt
        });
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateDiaryEntryDto dto)
    {
        var entry = await _db.DiaryEntries.FindAsync(id);
        if (entry == null)
            return NotFound(new { message = "Diary entry not found." });

        entry.Title = dto.Title.Trim();
        entry.Content = dto.Content.Trim();
        entry.Mood = dto.Mood.Trim();
        entry.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        return Ok(new DiaryEntryDto
        {
            Id = entry.Id,
            PatientId = entry.PatientId,
            Title = entry.Title,
            Content = entry.Content,
            Mood = entry.Mood,
            CreatedAt = entry.CreatedAt,
            UpdatedAt = entry.UpdatedAt
        });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var entry = await _db.DiaryEntries.FindAsync(id);
        if (entry == null)
            return NotFound(new { message = "Diary entry not found." });

        _db.DiaryEntries.Remove(entry);
        await _db.SaveChangesAsync();
        return Ok(new { message = "Diary entry deleted." });
    }
}
