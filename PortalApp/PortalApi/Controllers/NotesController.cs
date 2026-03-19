using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;

namespace PortalApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    // Token requirement removed. Open access for testing the Notes Feed.
    public class NotesController : ControllerBase
    {
        // A temporary in-memory list to simulate a database for notes
        private static readonly List<string> _notesFeed = new List<string>
        {
            "Welcome to the Notes Feed!",
            "This is a sample note to test the application."
        };

        // GET: api/notes
        [HttpGet]
        public IActionResult GetAllNotes()
        {
            // Returns the list of notes
            return Ok(_notesFeed);
        }

        // POST: api/notes
        [HttpPost]
        public IActionResult CreateNote([FromBody] NoteRequest request)
        {
            // Validate if the note is not empty or null
            if (request == null || string.IsNullOrWhiteSpace(request.Content))
            {
                return BadRequest(new { message = "Note content cannot be empty." });
            }

            // Add the new note to our feed
            _notesFeed.Add(request.Content);

            return Ok(new { message = "Note added successfully.", note = request.Content });
        }
    }

    // Data Transfer Object for creating a new note
    public record NoteRequest(string Content);
}