using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PortalApi.Data;
using PortalApi.Models;

namespace PortalApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class NotesController : ControllerBase
    {
        private readonly MyDbContext _context;

        public NotesController(MyDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Note>>> GetNotes()
        {
            return await _context.Notes.OrderByDescending(n => n.CreatedAt).ToListAsync();
        }

        [HttpPost]
        public async Task<ActionResult<Note>> AddNote(Note note)
        {
            note.CreatedAt = DateTime.Now;
            _context.Notes.Add(note);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetNotes), new { id = note.Id }, note);
        }
    }
}