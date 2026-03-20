using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using PortalApi.Models;
using System;

namespace PortalApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class NotesController : ControllerBase
    {
        private readonly string _connectionString;
        private readonly IWebHostEnvironment _env;

        
        public NotesController(IConfiguration configuration, IWebHostEnvironment env)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection") 
                                ?? throw new InvalidOperationException("Missing ConnectionString.");
            _env = env;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Note>>> GetNotes()
        {
            var notes = new List<Note>();

            using (SqlConnection conn = new SqlConnection(_connectionString))
            {
                await conn.OpenAsync();
                string query = "SELECT Id, Title, Content, Permissions, Author, CreationDate, PhotoUrl, VideoUrl, AudioUrl FROM Notes ORDER BY CreationDate DESC";
                
                using (SqlCommand cmd = new SqlCommand(query, conn))
                using (SqlDataReader reader = await cmd.ExecuteReaderAsync())
                {
                    while (await reader.ReadAsync())
                    {
                        notes.Add(new Note
                        {
                            Id = reader.GetInt32(0),
                            Title = reader.GetString(1),
                            Content = reader.GetString(2),
                            Permissions = reader.GetString(3),
                            Author = reader.GetString(4),
                            CreationDate = reader.GetDateTime(5),
                            PhotoUrl = reader.IsDBNull(6) ? null : reader.GetString(6),
                            VideoUrl = reader.IsDBNull(7) ? null : reader.GetString(7),
                            AudioUrl = reader.IsDBNull(8) ? null : reader.GetString(8)
                        });
                    }
                }
            }
            return Ok(notes);
        }

        [HttpPost]
        public async Task<ActionResult<Note>> AddNote([FromForm] NoteCreateDto note)
        {
            Console.WriteLine(note.Title);
            string? photoUrl = await SaveFileAsync(note.Photo, "photos");
            string? videoUrl = await SaveFileAsync(note.Video, "videos");
            string? audioUrl = await SaveFileAsync(note.Audio, "audio");

            var newNote = new Note
            {
                Title = note.Title,
                Content = note.Content,
                Permissions = note.Permissions,
                Author = note.Author,
                CreationDate = DateTime.Now,
                PhotoUrl = photoUrl,
                VideoUrl = videoUrl,
                AudioUrl = audioUrl
            };

            
            using (SqlConnection conn = new SqlConnection(_connectionString))
            {
                await conn.OpenAsync();
                string query = @"
                    INSERT INTO Notes (Title, Content, Permissions, Author, CreationDate, PhotoUrl, VideoUrl, AudioUrl) 
                    OUTPUT INSERTED.Id 
                    VALUES (@Title, @Content, @Permissions, @Author, @CreationDate, @PhotoUrl, @VideoUrl, @AudioUrl)";

                using (SqlCommand cmd = new SqlCommand(query, conn))
                {
                    cmd.Parameters.AddWithValue("@Title", newNote.Title);
                    cmd.Parameters.AddWithValue("@Content", newNote.Content);
                    cmd.Parameters.AddWithValue("@Permissions", newNote.Permissions);
                    cmd.Parameters.AddWithValue("@Author", newNote.Author);
                    cmd.Parameters.AddWithValue("@CreationDate", newNote.CreationDate);
                    cmd.Parameters.AddWithValue("@PhotoUrl", (object?)newNote.PhotoUrl ?? DBNull.Value);
                    cmd.Parameters.AddWithValue("@VideoUrl", (object?)newNote.VideoUrl ?? DBNull.Value);
                    cmd.Parameters.AddWithValue("@AudioUrl", (object?)newNote.AudioUrl ?? DBNull.Value);

                    
                    newNote.Id = (int)await cmd.ExecuteScalarAsync();
                }
            }

            return CreatedAtAction(nameof(GetNotes), new { id = newNote.Id }, newNote);
        }

        
        private async Task<string?> SaveFileAsync(IFormFile? file, string folderName)
        {
            if (file == null || file.Length == 0) return null;

            
            var uniqueFileName = Guid.NewGuid().ToString() + "_" + file.FileName;
            
            // directory to save wwwroot/uploads/photos/
            var uploadsFolder = Path.Combine(_env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot"), "uploads", folderName);
            
            if (!Directory.Exists(uploadsFolder))
            {
                Directory.CreateDirectory(uploadsFolder);
            }

            var filePath = Path.Combine(uploadsFolder, uniqueFileName);

            using (var fileStream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(fileStream);
            }

            //Returns relative URL to the file (np. /uploads/photos/nazwapliku.jpg)
            return $"/uploads/{folderName}/{uniqueFileName}";
        }
    }
}