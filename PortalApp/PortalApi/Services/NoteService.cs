using Microsoft.Extensions.Configuration;
using PortalApi.Models;
using System;
using System.Collections.Generic;
using Microsoft.Data.SqlClient;
using System.Threading.Tasks;

namespace PortalApi.Services
{
    public interface INoteService
    {
        Task<List<Note>> GetAllNotesAsync();
        Task<Note> CreateNoteAsync(Note note);
    }

    public class NoteService : INoteService
    {
        private readonly string _connectionString;

        public NoteService(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection") 
                ?? throw new InvalidOperationException("Connection string not found.");
        }

        public async Task<List<Note>> GetAllNotesAsync()
        {
            var notes = new List<Note>();
            using (SqlConnection conn = new SqlConnection(_connectionString))
            {
                await conn.OpenAsync();
                string query = "SELECT note_id, title, content, permissions, author, creation_date, photo_url, video_url, audio_url FROM notes ORDER BY creation_date DESC";

                using (SqlCommand cmd = new SqlCommand(query, conn))
                using (SqlDataReader reader = await cmd.ExecuteReaderAsync())
                {
                    while (await reader.ReadAsync())
                    {
                        notes.Add(new Note
                        {
                            Id = reader["note_id"] != DBNull.Value ? Convert.ToInt32(reader["note_id"]) : 0,
                            Title = reader["title"]?.ToString() ?? string.Empty,
                            Content = reader["content"]?.ToString() ?? string.Empty,
                            Permissions = reader["permissions"]?.ToString() ?? "Public",
                            Author = reader["author"]?.ToString() ?? "User",
                            CreationDate = reader["creation_date"] != DBNull.Value ? Convert.ToDateTime(reader["creation_date"]) : DateTime.Now,
                            PhotoUrl = reader["photo_url"] != DBNull.Value ? reader["photo_url"].ToString() : null,
                            VideoUrl = reader["video_url"] != DBNull.Value ? reader["video_url"].ToString() : null,
                            AudioUrl = reader["audio_url"] != DBNull.Value ? reader["audio_url"].ToString() : null
                        });
                    }
                }
            }
            return notes;
        }

        public async Task<Note> CreateNoteAsync(Note note)
        {
            note.CreationDate = DateTime.Now;

            using (SqlConnection conn = new SqlConnection(_connectionString))
            {
                await conn.OpenAsync();
                
                string query = @"INSERT INTO notes (title, content, permissions, author, creation_date, photo_url, video_url, audio_url) 
                                 OUTPUT INSERTED.note_id 
                                 VALUES (@title, @content, @permissions, @author, @date, @photo, @video, @audio)";

                using (SqlCommand cmd = new SqlCommand(query, conn))
                {
                    cmd.Parameters.AddWithValue("@title", note.Title ?? (object)DBNull.Value);
                    cmd.Parameters.AddWithValue("@content", note.Content ?? (object)DBNull.Value);
                    cmd.Parameters.AddWithValue("@permissions", note.Permissions ?? "Public");
                    cmd.Parameters.AddWithValue("@author", note.Author ?? "User");
                    cmd.Parameters.AddWithValue("@date", note.CreationDate);
                    cmd.Parameters.AddWithValue("@photo", note.PhotoUrl ?? (object)DBNull.Value);
                    cmd.Parameters.AddWithValue("@video", note.VideoUrl ?? (object)DBNull.Value);
                    cmd.Parameters.AddWithValue("@audio", note.AudioUrl ?? (object)DBNull.Value);

                    // Retrieve the auto-generated ID of the new note
                    var newId = await cmd.ExecuteScalarAsync();
                    if (newId != null && newId != DBNull.Value)
                    {
                        note.Id = Convert.ToInt32(newId);
                    }
                }
            }
            return note;
        }
    }
}