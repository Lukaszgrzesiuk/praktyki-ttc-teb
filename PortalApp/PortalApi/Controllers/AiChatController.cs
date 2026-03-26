using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using System.Text.Json;
using System.Threading.Tasks;
using System;
using Microsoft.Extensions.Configuration;
using Google.GenAI;       
using Google.GenAI.Types; 

namespace PortalApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AiChatController : ControllerBase
    {
        private readonly string _connectionString;
        

        private readonly string _geminiApiKey = "your_api_key";
        
        private readonly Client _aiClient;

        public AiChatController(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection") 
                                ?? throw new InvalidOperationException("Missing ConnectionString.");
            
            _aiClient = new Client(apiKey: _geminiApiKey);
        }

        [HttpPost("process")]
        public async Task<IActionResult> ProcessChat([FromBody] ChatMessageRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Message))
                return BadRequest(new { message = "Message cannot be empty." });

            string prompt = $@"
                You are a note-taking assistant. Analyze the user's message: '{request.Message}'.
                Your task is to create a concise note from it.
                Rate its importance/priority (HelpfulnessRating) on a scale of 1-10 based on context (e.g., words like 'urgent', 'important' = 9-10, casual thoughts = 3-5).
                Return the result as JSON with exactly these keys: title, content, helpfulnessRating.";

            var config = new GenerateContentConfig 
            { 
                Temperature = 0.2f,
                ResponseMimeType = "application/json" 
            };

            string textResponse;
            try 
            {
                var response = await _aiClient.Models.GenerateContentAsync(
                    model: "gemini-2.5-flash",
                    contents: prompt,
                    config: config
                );
                
                textResponse = response.Text;
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error communicating with Gemini API.", details = ex.Message });
            }

            if (string.IsNullOrEmpty(textResponse))
                return StatusCode(500, new { message = "Gemini returned an empty response." });

            textResponse = textResponse.Replace("```json", "", StringComparison.OrdinalIgnoreCase).Replace("```", "").Trim();

            AiNoteDto? aiNote;
            try
            {
                var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                aiNote = JsonSerializer.Deserialize<AiNoteDto>(textResponse, options);
            }
            catch (JsonException)
            {
                return StatusCode(500, new { message = "Failed to parse response from Gemini.", rawOutput = textResponse });
            }

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
                    cmd.Parameters.AddWithValue("@Title", string.IsNullOrEmpty(aiNote?.title) ? "New Note (AI)" : aiNote.title);
                    cmd.Parameters.AddWithValue("@Content", string.IsNullOrEmpty(aiNote?.content) ? "" : aiNote.content);
                    cmd.Parameters.AddWithValue("@Author", string.IsNullOrEmpty(request.AuthorName) ? "AI Assistant" : request.AuthorName);
                    cmd.Parameters.AddWithValue("@CreationDate", DateTime.Now);
                    cmd.Parameters.AddWithValue("@HelpfulnessRating", aiNote?.helpfulnessRating ?? 5);
                    cmd.Parameters.AddWithValue("@CreationEaseRating", (byte)10); 
                    cmd.Parameters.AddWithValue("@AuthorId", request.AuthorId);

                    insertedId = Convert.ToInt32(await cmd.ExecuteScalarAsync());
                }
            }

            return Ok(new { 
                message = "Note automatically generated and ranked by AI!", 
                noteId = insertedId, 
                title = aiNote?.title, 
                content = aiNote?.content,
                rating = aiNote?.helpfulnessRating 
            });
        }
    }

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