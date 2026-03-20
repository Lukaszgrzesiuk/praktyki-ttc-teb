using Microsoft.Data.SqlClient;
using PortalApi.Models;

namespace PortalApi.Services
{
    public interface IAdminUserService
    {
        Task<IEnumerable<AdminUserDto>> GetAllUsersFullAsync();
        Task<int> CreateUserAsync(string name);
        Task<bool> DeleteUserAsync(int id);
        Task AddGroupAsync(int userId, string groupName);
        Task RemoveGroupAsync(int userId, string groupName);
        Task AddNoteAsync(int userId, string noteContent);
        Task RemoveNoteAsync(int userId, string noteContent);
        Task AddLogAsync(int userId, string action, bool isSuspicious);
    }

    public class AdminUserService : IAdminUserService
    {
        private readonly string _connString;

        public AdminUserService(IConfiguration config)
        {
            // Assuming "DefaultConnection" is configured in appsettings.json
            _connString = config.GetConnectionString("DefaultConnection") 
                          ?? throw new InvalidOperationException("Connection string is missing.");
        }

        public async Task<IEnumerable<AdminUserDto>> GetAllUsersFullAsync()
        {
            var users = new Dictionary<int, AdminUserDto>();

            using var conn = new SqlConnection(_connString);
            await conn.OpenAsync();

            // 1. Fetch users (mapping 'login_name' to the 'Name' property)
            using (var cmd = new SqlCommand("SELECT user_id, login_name FROM user_registration", conn))
            using (var reader = await cmd.ExecuteReaderAsync())
            {
                while (await reader.ReadAsync())
                {
                    var id = reader.GetInt32(0);
                    users[id] = new AdminUserDto { Id = id, Name = reader.GetString(1) };
                }
            }

            // 2. Fetch Groups
            using (var cmd = new SqlCommand("SELECT UserId, GroupName FROM UserGroups", conn))
            using (var reader = await cmd.ExecuteReaderAsync())
            {
                while (await reader.ReadAsync())
                {
                    if (users.TryGetValue(reader.GetInt32(0), out var user))
                        user.Groups.Add(reader.GetString(1));
                }
            }

            // 3. Fetch Notes
            using (var cmd = new SqlCommand("SELECT UserId, NoteContent FROM UserNotes", conn))
            using (var reader = await cmd.ExecuteReaderAsync())
            {
                while (await reader.ReadAsync())
                {
                    if (users.TryGetValue(reader.GetInt32(0), out var user))
                        user.Notes.Add(reader.GetString(1));
                }
            }

            // 4. Fetch Activity Logs
            using (var cmd = new SqlCommand("SELECT UserId, Action, Timestamp, IsSuspicious FROM ActivityLogs ORDER BY Timestamp DESC", conn))
            using (var reader = await cmd.ExecuteReaderAsync())
            {
                while (await reader.ReadAsync())
                {
                    if (users.TryGetValue(reader.GetInt32(0), out var user))
                    {
                        user.Logs.Add(new ActivityLogDto
                        {
                            Action = reader.GetString(1),
                            Timestamp = reader.GetDateTime(2),
                            IsSuspicious = reader.GetBoolean(3)
                        });
                    }
                }
            }

            return users.Values;
        }

        public async Task<int> CreateUserAsync(string name)
        {
            using var conn = new SqlConnection(_connString);
            
            // Note: Inserting dummy values for required columns in user_registration,
            // because the admin panel form currently only provides the 'name'.
            var query = @"
                INSERT INTO user_registration (login_name, first_name, last_name, email, password_val) 
                OUTPUT INSERTED.user_id 
                VALUES (@Name, '', '', @Name + '@temp.com', 'temp_pass');";
                
            using var cmd = new SqlCommand(query, conn);
            cmd.Parameters.AddWithValue("@Name", name);
            
            await conn.OpenAsync();
            var newId = (int)await cmd.ExecuteScalarAsync();
            return newId;
        }

        public async Task<bool> DeleteUserAsync(int id)
        {
            using var conn = new SqlConnection(_connString);
            using var cmd = new SqlCommand("DELETE FROM user_registration WHERE user_id = @Id", conn);
            cmd.Parameters.AddWithValue("@Id", id);
            
            await conn.OpenAsync();
            return await cmd.ExecuteNonQueryAsync() > 0;
        }

        public async Task AddGroupAsync(int userId, string groupName)
        {
            using var conn = new SqlConnection(_connString);
            using var cmd = new SqlCommand("INSERT INTO UserGroups (UserId, GroupName) VALUES (@UId, @GN)", conn);
            cmd.Parameters.AddWithValue("@UId", userId);
            cmd.Parameters.AddWithValue("@GN", groupName);
            
            await conn.OpenAsync();
            await cmd.ExecuteNonQueryAsync();
        }

        public async Task RemoveGroupAsync(int userId, string groupName)
        {
            using var conn = new SqlConnection(_connString);
            using var cmd = new SqlCommand("DELETE FROM UserGroups WHERE UserId = @UId AND GroupName = @GN", conn);
            cmd.Parameters.AddWithValue("@UId", userId);
            cmd.Parameters.AddWithValue("@GN", groupName);
            
            await conn.OpenAsync();
            await cmd.ExecuteNonQueryAsync();
        }

        // --- Similar methods for Notes and Logs ---

        public async Task AddNoteAsync(int userId, string noteContent)
        {
            using var conn = new SqlConnection(_connString);
            using var cmd = new SqlCommand("INSERT INTO UserNotes (UserId, NoteContent) VALUES (@UId, @NC)", conn);
            cmd.Parameters.AddWithValue("@UId", userId);
            cmd.Parameters.AddWithValue("@NC", noteContent);
            
            await conn.OpenAsync();
            await cmd.ExecuteNonQueryAsync();
        }

        public async Task RemoveNoteAsync(int userId, string noteContent)
        {
             using var conn = new SqlConnection(_connString);
             using var cmd = new SqlCommand("DELETE FROM UserNotes WHERE UserId = @UId AND NoteContent = @NC", conn);
             cmd.Parameters.AddWithValue("@UId", userId);
             cmd.Parameters.AddWithValue("@NC", noteContent);
             
             await conn.OpenAsync();
             await cmd.ExecuteNonQueryAsync();
        }

        public async Task AddLogAsync(int userId, string action, bool isSuspicious)
        {
             using var conn = new SqlConnection(_connString);
             using var cmd = new SqlCommand("INSERT INTO ActivityLogs (UserId, Action, IsSuspicious) VALUES (@UId, @Act, @Susp)", conn);
             cmd.Parameters.AddWithValue("@UId", userId);
             cmd.Parameters.AddWithValue("@Act", action);
             cmd.Parameters.AddWithValue("@Susp", isSuspicious);
             
             await conn.OpenAsync();
             await cmd.ExecuteNonQueryAsync();
        }
    }
}