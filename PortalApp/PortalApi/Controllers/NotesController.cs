using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using PortalApi.Models;

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

        // --- Smart endpoint handling Admin group & regular Group sharing ---
        [HttpGet("user/{userId}")]
        public async Task<ActionResult<IEnumerable<Note>>> GetNotesForUser(int userId)
        {
            var notes = new List<Note>();

            using (SqlConnection conn = new SqlConnection(_connectionString))
            {
                await conn.OpenAsync();
                
                string query = @"
                    DECLARE @IsAdmin BIT = 0;
                    
                    -- 1. Check if user is in the hidden 'admin' group
                    IF EXISTS (
                        SELECT 1 
                        FROM dbo.UserGroups ug 
                        JOIN dbo.Groups g ON ug.group_id = g.group_id 
                        WHERE ug.user_id = @UserId AND g.group_name = 'admin'
                    )
                    BEGIN
                        SET @IsAdmin = 1;
                    END

                    IF @IsAdmin = 1
                    BEGIN
                        -- 2A. Admin sees everything
                        SELECT Id, Title, Content, Permissions, Author, CreationDate, PhotoUrl, VideoUrl, AudioUrl, HelpfulnessRating, CreationEaseRating, group_id, author_id 
                        FROM dbo.Notes 
                        ORDER BY CreationDate DESC;
                    END
                    ELSE
                    BEGIN
                        -- 2B. Regular user sees: own notes, notes in their groups, or notes by authors sharing a group
                        SELECT DISTINCT n.Id, n.Title, n.Content, n.Permissions, n.Author, n.CreationDate, n.PhotoUrl, n.VideoUrl, n.AudioUrl, n.HelpfulnessRating, n.CreationEaseRating, n.group_id, n.author_id 
                        FROM dbo.Notes n
                        LEFT JOIN dbo.UserGroups ug_note ON n.group_id = ug_note.group_id AND ug_note.user_id = @UserId
                        WHERE 
                            n.author_id = @UserId -- a) My own notes
                            OR ug_note.user_id IS NOT NULL -- b) Notes assigned to my groups
                            OR n.author_id IN ( -- c) Notes from users who are in the same groups as me
                                SELECT ug2.user_id
                                FROM dbo.UserGroups ug1
                                JOIN dbo.UserGroups ug2 ON ug1.group_id = ug2.group_id
                                WHERE ug1.user_id = @UserId
                            )
                        ORDER BY n.CreationDate DESC;
                    END";

                using (SqlCommand cmd = new SqlCommand(query, conn))
                {
                    cmd.Parameters.AddWithValue("@UserId", userId);

                    using (SqlDataReader reader = await cmd.ExecuteReaderAsync())
                    {
                        while (await reader.ReadAsync())
                        {
                            notes.Add(new Note
                            {
                                Id = reader.GetInt32(0),
                                Title = reader.GetString(1),
                                Content = reader.IsDBNull(2) ? string.Empty : reader.GetString(2),
                                Permissions = reader.IsDBNull(3) ? "Public" : reader.GetString(3),
                                Author = reader.IsDBNull(4) ? "User" : reader.GetString(4),
                                CreationDate = reader.GetDateTime(5),
                                PhotoUrl = reader.IsDBNull(6) ? null : reader.GetString(6),
                                VideoUrl = reader.IsDBNull(7) ? null : reader.GetString(7),
                                AudioUrl = reader.IsDBNull(8) ? null : reader.GetString(8),
                                HelpfulnessRating = reader.IsDBNull(9) ? null : reader.GetByte(9),
                                CreationEaseRating = reader.IsDBNull(10) ? null : reader.GetByte(10),
                                GroupId = reader.IsDBNull(11) ? null : reader.GetInt32(11),
                                AuthorId = reader.IsDBNull(12) ? null : reader.GetInt32(12)
                            });
                        }
                    }
                }
            }
            
            return Ok(notes);
        }

        // --- Standard Get endpoint as a fallback ---
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Note>>> GetNotes()
        {
            var notes = new List<Note>();

            using (SqlConnection conn = new SqlConnection(_connectionString))
            {
                await conn.OpenAsync();
                string query = "SELECT Id, Title, Content, Permissions, Author, CreationDate, PhotoUrl, VideoUrl, AudioUrl, HelpfulnessRating, CreationEaseRating, group_id, author_id FROM dbo.Notes ORDER BY CreationDate DESC";
                
                using (SqlCommand cmd = new SqlCommand(query, conn))
                using (SqlDataReader reader = await cmd.ExecuteReaderAsync())
                {
                    while (await reader.ReadAsync())
                    {
                        notes.Add(new Note
                        {
                            Id = reader.GetInt32(0),
                            Title = reader.GetString(1),
                            Content = reader.IsDBNull(2) ? string.Empty : reader.GetString(2),
                            Permissions = reader.IsDBNull(3) ? "Public" : reader.GetString(3),
                            Author = reader.IsDBNull(4) ? "User" : reader.GetString(4),
                            CreationDate = reader.GetDateTime(5),
                            PhotoUrl = reader.IsDBNull(6) ? null : reader.GetString(6),
                            VideoUrl = reader.IsDBNull(7) ? null : reader.GetString(7),
                            AudioUrl = reader.IsDBNull(8) ? null : reader.GetString(8),
                            HelpfulnessRating = reader.IsDBNull(9) ? null : reader.GetByte(9),
                            CreationEaseRating = reader.IsDBNull(10) ? null : reader.GetByte(10),
                            GroupId = reader.IsDBNull(11) ? null : reader.GetInt32(11),
                            AuthorId = reader.IsDBNull(12) ? null : reader.GetInt32(12)
                        });
                    }
                }
            }
            return Ok(notes);
        }

        // --- AddNote inserts all new fields into SQL ---
        [HttpPost]
        public async Task<ActionResult<Note>> AddNote([FromForm] NoteCreateDto note)
        {
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
                AudioUrl = audioUrl,
                HelpfulnessRating = note.HelpfulnessRating,
                CreationEaseRating = note.CreationEaseRating,
                GroupId = note.group_id,
                AuthorId = note.author_id
            };

            using (SqlConnection conn = new SqlConnection(_connectionString))
            {
                await conn.OpenAsync();
                string query = @"
                    INSERT INTO dbo.Notes (Title, Content, Permissions, Author, CreationDate, PhotoUrl, VideoUrl, AudioUrl, HelpfulnessRating, CreationEaseRating, group_id, author_id) 
                    OUTPUT INSERTED.Id 
                    VALUES (@Title, @Content, @Permissions, @Author, @CreationDate, @PhotoUrl, @VideoUrl, @AudioUrl, @HelpfulnessRating, @CreationEaseRating, @GroupId, @AuthorId)";

                using (SqlCommand cmd = new SqlCommand(query, conn))
                {
                    cmd.Parameters.AddWithValue("@Title", newNote.Title);
                    cmd.Parameters.AddWithValue("@Content", (object?)newNote.Content ?? DBNull.Value);
                    cmd.Parameters.AddWithValue("@Permissions", (object?)newNote.Permissions ?? DBNull.Value);
                    cmd.Parameters.AddWithValue("@Author", (object?)newNote.Author ?? DBNull.Value);
                    cmd.Parameters.AddWithValue("@CreationDate", newNote.CreationDate);
                    cmd.Parameters.AddWithValue("@PhotoUrl", (object?)newNote.PhotoUrl ?? DBNull.Value);
                    cmd.Parameters.AddWithValue("@VideoUrl", (object?)newNote.VideoUrl ?? DBNull.Value);
                    cmd.Parameters.AddWithValue("@AudioUrl", (object?)newNote.AudioUrl ?? DBNull.Value);
                    
                    cmd.Parameters.AddWithValue("@HelpfulnessRating", (object?)newNote.HelpfulnessRating ?? DBNull.Value);
                    cmd.Parameters.AddWithValue("@CreationEaseRating", (object?)newNote.CreationEaseRating ?? DBNull.Value);
                    cmd.Parameters.AddWithValue("@GroupId", (object?)newNote.GroupId ?? DBNull.Value);
                    cmd.Parameters.AddWithValue("@AuthorId", (object?)newNote.AuthorId ?? DBNull.Value);

                    newNote.Id = (int)await cmd.ExecuteScalarAsync();
                }
            }

            return CreatedAtAction(nameof(GetNotes), new { id = newNote.Id }, newNote);
        }

        private async Task<string?> SaveFileAsync(IFormFile? file, string folderName)
        {
            if (file == null || file.Length == 0) return null;

            var uniqueFileName = Guid.NewGuid().ToString() + "_" + file.FileName;
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

            return $"/uploads/{folderName}/{uniqueFileName}";
        }
    }
}