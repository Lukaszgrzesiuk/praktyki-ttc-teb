using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using System.Text;
using System.Text.Json;
using System.Net.Http;
using System.Threading.Tasks;
using System;
using Microsoft.Extensions.Configuration;

namespace PortalApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AiChatController : ControllerBase
    {
        private readonly string _connectionString;
        
        // API key defined directly in the controller since we cannot modify appsettings.json
        private readonly string _geminiApiKey = "AIzaSyB3tQ5s2qHecJERJTjtQlVtRFvJx6XFHdc";
        
        // Static HttpClient to avoid socket exhaustion since we cannot modify Program.cs
        private static readonly HttpClient _httpClient = new HttpClient();

        public AiChatController(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection") 
                                ?? throw new InvalidOperationException("Missing ConnectionString.");
        }

        [HttpPost("process")]
        public async Task<IActionResult> ProcessChat([FromBody] ChatMessageRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Message))
                return BadRequest(new { message = "Message cannot be empty." });

            // 1. Prepare prompt for Gemini
            string prompt = $@"
                You are a note-taking assistant. Analyze the user's message: '{request.Message}'.
                Your task is to create a concise note from it.
                Rate its importance/priority (HelpfulnessRating) on a scale of 1-10 based on context (e.g., words like 'urgent', 'important' = 9-10, casual thoughts = 3-5).
                Return the result ONLY as valid JSON in the following format (without ```json tags):
                {{
                    ""title"": ""Short note title"",
                    ""content"": ""Clear note content"",
                    ""helpfulnessRating"": 8
                }}";

            var geminiPayload = new
            {
                contents = new[] { new { parts = new[] { new { text = prompt } } } },
                generationConfig = new { temperature = 0.2 } // Low temperature for stable JSON output
            };

            // 2. Call Gemini API
            var content = new StringContent(JsonSerializer.Serialize(geminiPayload), Encoding.UTF8, "application/json");
            var response = await _httpClient.PostAsync($"[https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=](https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=){_geminiApiKey}", content);
            
            if (!response.IsSuccessStatusCode) 
                return StatusCode(500, new { message = "Error communicating with Gemini API." });

            var jsonString = await response.Content.ReadAsStringAsync();
            using var document = JsonDocument.Parse(jsonString);
            
            // Extract text from Gemini response
            var textResponse = document.RootElement
                .GetProperty("candidates")[0]
                .GetProperty("content")
                .GetProperty("parts")[0]
                .GetProperty("text").GetString()?.Trim();

            if (textResponse == null)
                return StatusCode(500, new { message = "Gemini returned an empty response." });

            // Remove markdown code blocks if present
            if (textResponse.StartsWith("```json")) textResponse = textResponse.Substring(7);
            if (textResponse.EndsWith("```")) textResponse = textResponse.Substring(0, textResponse.Length - 3);

            // 3. Parse JSON from Gemini
            AiNoteDto? aiNote;
            try
            {
                aiNote = JsonSerializer.Deserialize<AiNoteDto>(textResponse);
            }
            catch (JsonException)
            {
                return StatusCode(500, new { message = "Failed to parse response from Gemini.", rawOutput = textResponse });
            }

            // 4. Save to database with generated priority
            int insertedId = 0;
            using (SqlConnection conn = new SqlConnection(_connectionString))
            {
                await conn.OpenAsync();
                string query = @"
                    INSERT INTO dbo.Notes (Title, Content, Permissions, Author, CreationDate, HelpfulnessRating, CreationEaseRating, author_id) 
                    OUTPUT INSERTED.Id 
                    VALUES (@Title, @Content, 'Public', @Author, @CreationDate, @HelpfulnessRating, @CreationEaseRating, @AuthorId)";

                using (SqlCommand cmd = new SqlCommand(query, conn))
                {
                    cmd.Parameters.AddWithValue("@Title", aiNote!.title);
                    cmd.Parameters.AddWithValue("@Content", aiNote.content);
                    cmd.Parameters.AddWithValue("@Author", string.IsNullOrEmpty(request.AuthorName) ? "AI Assistant" : request.AuthorName);
                    cmd.Parameters.AddWithValue("@CreationDate", DateTime.Now);
                    cmd.Parameters.AddWithValue("@HelpfulnessRating", aiNote.helpfulnessRating);
                    cmd.Parameters.AddWithValue("@CreationEaseRating", (byte)10); // AI generated notes are easy to create
                    cmd.Parameters.AddWithValue("@AuthorId", request.AuthorId);

                    insertedId = Convert.ToInt32(await cmd.ExecuteScalarAsync());
                }
            }

            // 5. Return response to Angular interface
            return Ok(new { 
                message = "Note automatically generated and ranked by AI!", 
                noteId = insertedId, 
                title = aiNote.title, 
                content = aiNote.content,
                rating = aiNote.helpfulnessRating 
            });
        }
    }

    // DTO Models for the controller
    public class ChatMessageRequest
    {
        public string Message { get; set; } = string.Empty;
        public int AuthorId { get; set; }
        public string AuthorName { get; set; } = string.Empty;
    }

    public class AiNoteDto
    {
        public string title { get; set; } = string.Empty;
        public string content { get; set; } = string.Empty;
        public byte helpfulnessRating { get; set; }
    }
}