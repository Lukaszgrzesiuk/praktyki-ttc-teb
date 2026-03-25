using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;

namespace PortalApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AdminController : ControllerBase
    {
        private readonly string _connectionString;

        public AdminController(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection") 
                                ?? throw new InvalidOperationException("Missing ConnectionString.");
        }

        [HttpGet("is-admin/{userId}")]
        public async Task<IActionResult> IsAdmin(int userId)
        {
            bool isAdmin = await CheckIfAdmin(userId);
            return Ok(new { isAdmin });
        }

        [HttpGet("users")]
        public async Task<IActionResult> GetUsers([FromQuery] int requesterId)
        {
            if (!await CheckIfAdmin(requesterId)) return Unauthorized(new { message = "Brak uprawnień." });

            var users = new List<object>();
            using (SqlConnection conn = new SqlConnection(_connectionString))
            {
                await conn.OpenAsync();
                string query = @"
                    SELECT u.user_id, u.login_name, u.first_name, u.last_name, 
                           ISNULL(STRING_AGG(g.group_name, ','), '') as Groups
                    FROM dbo.user_registration u
                    LEFT JOIN dbo.UserGroups ug ON u.user_id = ug.user_id
                    LEFT JOIN dbo.Groups g ON ug.group_id = g.group_id
                    GROUP BY u.user_id, u.login_name, u.first_name, u.last_name";

                using (SqlCommand cmd = new SqlCommand(query, conn))
                using (SqlDataReader reader = await cmd.ExecuteReaderAsync())
                {
                    while (await reader.ReadAsync())
                    {
                        users.Add(new {
                            id = reader.GetInt32(0),
                            login = reader.GetString(1),
                            name = $"{reader.GetString(2)} {reader.GetString(3)}",
                            groups = reader.GetString(4).Split(',', StringSplitOptions.RemoveEmptyEntries)
                        });
                    }
                }
            }
            return Ok(users);
        }

        
        [HttpPost("users")]
        public async Task<IActionResult> AddUser([FromQuery] int requesterId, [FromBody] AdminUserCreateDto dto)
        {
            if (!await CheckIfAdmin(requesterId)) return Unauthorized();

            using (SqlConnection conn = new SqlConnection(_connectionString))
            {
                await conn.OpenAsync();
                
                
                string checkQuery = "SELECT COUNT(*) FROM dbo.user_registration WHERE login_name = @Login";
                using (SqlCommand checkCmd = new SqlCommand(checkQuery, conn))
                {
                    checkCmd.Parameters.AddWithValue("@Login", dto.Login);
                    int count = (int)await checkCmd.ExecuteScalarAsync();
                    if (count > 0) return BadRequest(new { message = "Użytkownik o takim loginie już istnieje." });
                }

                string query = @"
                    INSERT INTO dbo.user_registration (first_name, last_name, email, login_name, password_val, registration_date)
                    OUTPUT INSERTED.user_id
                    VALUES (@Fn, @Ln, @Email, @Login, @Pass, GETDATE())";

                using (SqlCommand cmd = new SqlCommand(query, conn))
                {
                    
                    cmd.Parameters.AddWithValue("@Fn", string.IsNullOrWhiteSpace(dto.FirstName) ? "User" : dto.FirstName);
                    cmd.Parameters.AddWithValue("@Ln", string.IsNullOrWhiteSpace(dto.LastName) ? "Dodany" : dto.LastName);
                    cmd.Parameters.AddWithValue("@Email", string.IsNullOrWhiteSpace(dto.Email) ? "brak@email.com" : dto.Email);
                    cmd.Parameters.AddWithValue("@Login", dto.Login);
                    cmd.Parameters.AddWithValue("@Pass", dto.Password);

                    int newId = (int)await cmd.ExecuteScalarAsync();
                    return Ok(new { id = newId, message = "Użytkownik dodany pomyślnie" });
                }
            }
        }

        [HttpDelete("users/{id}")]
        public async Task<IActionResult> DeleteUser(int id, [FromQuery] int requesterId)
        {
            if (!await CheckIfAdmin(requesterId)) return Unauthorized();

            using (SqlConnection conn = new SqlConnection(_connectionString))
            {
                await conn.OpenAsync();
                string query = "DELETE FROM dbo.user_registration WHERE user_id = @Id;";
                using (SqlCommand cmd = new SqlCommand(query, conn))
                {
                    cmd.Parameters.AddWithValue("@Id", id);
                    await cmd.ExecuteNonQueryAsync();
                }
            }
            return NoContent();
        }

        
        [HttpGet("users/{userId}/notes")]
        public async Task<IActionResult> GetUserNotes(int userId, [FromQuery] int requesterId)
        {
            if (!await CheckIfAdmin(requesterId)) return Unauthorized();

            var notes = new List<object>();
            using (SqlConnection conn = new SqlConnection(_connectionString))
            {
                await conn.OpenAsync();
                string query = "SELECT Id, Title FROM dbo.Notes WHERE author_id = @UserId";
                using (SqlCommand cmd = new SqlCommand(query, conn))
                {
                    cmd.Parameters.AddWithValue("@UserId", userId);
                    using (SqlDataReader reader = await cmd.ExecuteReaderAsync())
                    {
                        while (await reader.ReadAsync())
                        {
                            notes.Add(new {
                                id = reader.GetInt32(0),
                                title = reader.GetString(1)
                            });
                        }
                    }
                }
            }
            return Ok(notes);
        }

        
        [HttpDelete("notes/{noteId}")]
        public async Task<IActionResult> DeleteNoteAdmin(int noteId, [FromQuery] int requesterId)
        {
            if (!await CheckIfAdmin(requesterId)) return Unauthorized();

            using (SqlConnection conn = new SqlConnection(_connectionString))
            {
                await conn.OpenAsync();
                string query = "DELETE FROM dbo.Notes WHERE Id = @Id";
                using (SqlCommand cmd = new SqlCommand(query, conn))
                {
                    cmd.Parameters.AddWithValue("@Id", noteId);
                    await cmd.ExecuteNonQueryAsync();
                }
            }
            return NoContent();
        }

        [HttpPost("users/{userId}/groups")]
        public async Task<IActionResult> AddGroupToUser(int userId, [FromQuery] int requesterId, [FromBody] string groupName)
        {
            if (!await CheckIfAdmin(requesterId)) return Unauthorized();

            using (SqlConnection conn = new SqlConnection(_connectionString))
            {
                await conn.OpenAsync();
                string ensureGroupQuery = @"
                    IF NOT EXISTS (SELECT 1 FROM dbo.Groups WHERE group_name = @GroupName)
                    BEGIN
                        INSERT INTO dbo.Groups (group_name) VALUES (@GroupName);
                    END";
                using (SqlCommand cmd1 = new SqlCommand(ensureGroupQuery, conn))
                {
                    cmd1.Parameters.AddWithValue("@GroupName", groupName);
                    await cmd1.ExecuteNonQueryAsync();
                }

                string assignQuery = @"
                    DECLARE @GroupId INT = (SELECT group_id FROM dbo.Groups WHERE group_name = @GroupName);
                    IF NOT EXISTS (SELECT 1 FROM dbo.UserGroups WHERE user_id = @UserId AND group_id = @GroupId)
                    BEGIN
                        INSERT INTO dbo.UserGroups (user_id, group_id) VALUES (@UserId, @GroupId);
                    END";
                using (SqlCommand cmd2 = new SqlCommand(assignQuery, conn))
                {
                    cmd2.Parameters.AddWithValue("@GroupName", groupName);
                    cmd2.Parameters.AddWithValue("@UserId", userId);
                    await cmd2.ExecuteNonQueryAsync();
                }
            }
            return Ok();
        }

        [HttpDelete("users/{userId}/groups/{groupName}")]
        public async Task<IActionResult> RemoveGroupFromUser(int userId, string groupName, [FromQuery] int requesterId)
        {
            if (!await CheckIfAdmin(requesterId)) return Unauthorized();

            using (SqlConnection conn = new SqlConnection(_connectionString))
            {
                await conn.OpenAsync();
                string query = @"
                    DELETE ug FROM dbo.UserGroups ug
                    JOIN dbo.Groups g ON ug.group_id = g.group_id
                    WHERE ug.user_id = @UserId AND g.group_name = @GroupName";
                using (SqlCommand cmd = new SqlCommand(query, conn))
                {
                    cmd.Parameters.AddWithValue("@UserId", userId);
                    cmd.Parameters.AddWithValue("@GroupName", groupName);
                    await cmd.ExecuteNonQueryAsync();
                }
            }
            return NoContent();
        }

        private async Task<bool> CheckIfAdmin(int userId)
        {
            using (SqlConnection conn = new SqlConnection(_connectionString))
            {
                await conn.OpenAsync();
                string query = @"
                    SELECT 1 FROM dbo.UserGroups ug 
                    JOIN dbo.Groups g ON ug.group_id = g.group_id 
                    WHERE ug.user_id = @UserId AND g.group_name = 'admin'";
                
                using (SqlCommand cmd = new SqlCommand(query, conn))
                {
                    cmd.Parameters.AddWithValue("@UserId", userId);
                    var result = await cmd.ExecuteScalarAsync();
                    return result != null;
                }
            }
        }
    }

    
    public class AdminUserCreateDto
    {
        public string Login { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? Email { get; set; }
    }
}