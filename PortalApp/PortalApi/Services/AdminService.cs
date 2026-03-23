using Microsoft.Extensions.Configuration;
using PortalApi.Models;
using System;
using System.Collections.Generic;
using Microsoft.Data.SqlClient;
using System.Threading.Tasks;

namespace PortalApi.Services
{
    public interface IAdminService
    {
        Task<List<ActivityLog>> GetUserLogsAsync();
        Task<bool> SendAlertToUserAsync(int userId, string message);
    }

    public class AdminService : IAdminService
    {
        private readonly string _connectionString;

        public AdminService(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection") 
                ?? throw new InvalidOperationException("Connection string not found.");
        }

        // Retrieves all user activity logs sorted by the newest first
        public async Task<List<ActivityLog>> GetUserLogsAsync()
        {
            var logs = new List<ActivityLog>();

            using (SqlConnection conn = new SqlConnection(_connectionString))
            {
                await conn.OpenAsync();
                
                string query = "SELECT log_id, user_id, action_description, timestamp FROM activity_logs ORDER BY timestamp DESC";

                using (SqlCommand cmd = new SqlCommand(query, conn))
                using (SqlDataReader reader = await cmd.ExecuteReaderAsync())
                {
                    while (await reader.ReadAsync())
                    {
                        // Safely handle potential DBNull values
                        logs.Add(new ActivityLog
                        {
                            Id = reader["log_id"] != DBNull.Value ? Convert.ToInt32(reader["log_id"]) : 0,
                            UserId = reader["user_id"] != DBNull.Value ? Convert.ToInt32(reader["user_id"]) : 0,
                            ActionDescription = reader["action_description"] != DBNull.Value ? reader["action_description"].ToString() ?? string.Empty : string.Empty,
                            Timestamp = reader["timestamp"] != DBNull.Value ? Convert.ToDateTime(reader["timestamp"]) : DateTime.UtcNow
                        });
                    }
                }
            }

            return logs;
        }

        // Sends an alert to a specific user if the user exists
        public async Task<bool> SendAlertToUserAsync(int userId, string message)
        {
            using (SqlConnection conn = new SqlConnection(_connectionString))
            {
                await conn.OpenAsync();

                // 1. Verify if the user exists before sending the alert
                string checkUserQuery = "SELECT COUNT(1) FROM user_registration WHERE user_id = @userId";
                using (SqlCommand checkCmd = new SqlCommand(checkUserQuery, conn))
                {
                    checkCmd.Parameters.AddWithValue("@userId", userId);
                    
                    var result = await checkCmd.ExecuteScalarAsync();
                    int count = result != DBNull.Value ? Convert.ToInt32(result) : 0;
                    
                    if (count == 0)
                    {
                        return false; // User does not exist
                    }
                }

                // 2. Insert the alert into the database
                string insertQuery = "INSERT INTO user_alerts (user_id, message, created_at, is_read) VALUES (@userId, @message, @createdAt, 0)";
                using (SqlCommand insertCmd = new SqlCommand(insertQuery, conn))
                {
                    insertCmd.Parameters.AddWithValue("@userId", userId);
                    insertCmd.Parameters.AddWithValue("@message", message ?? string.Empty);
                    insertCmd.Parameters.AddWithValue("@createdAt", DateTime.UtcNow);

                    int rowsAffected = await insertCmd.ExecuteNonQueryAsync();
                    return rowsAffected > 0;
                }
            }
        }
    }
}