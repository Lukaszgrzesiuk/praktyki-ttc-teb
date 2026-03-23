using Microsoft.Extensions.Configuration;
using PortalApi.Models;
using System;
using Microsoft.Data.SqlClient;
using System.Threading.Tasks;

namespace PortalApi.Services
{
    public interface IRegistrationService
    {
        Task<bool> CreateUserAsync(RegisterRequest request);
    }

    public class RegistrationService : IRegistrationService
    {
        private readonly string _connectionString;

        public RegistrationService(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection") 
                ?? throw new InvalidOperationException("Connection string not found.");
        }

        public async Task<bool> CreateUserAsync(RegisterRequest request)
        {
            using (SqlConnection conn = new SqlConnection(_connectionString))
            {
                await conn.OpenAsync();

                // 1. Check if the user already exists
                string checkQuery = "SELECT COUNT(1) FROM user_registration WHERE login_name = @login";
                using (SqlCommand checkCmd = new SqlCommand(checkQuery, conn))
                {
                    checkCmd.Parameters.AddWithValue("@login", request.Login);
                    int count = Convert.ToInt32(await checkCmd.ExecuteScalarAsync());
                    
                    if (count > 0) 
                    {
                        return false; // Login already taken
                    }
                }

                // 2. Insert new user
                string insertQuery = @"INSERT INTO user_registration (first_name, last_name, login_name, email, password_val) 
                                       VALUES (@fn, @ln, @login, @email, @pass)";
                
                using (SqlCommand insertCmd = new SqlCommand(insertQuery, conn))
                {
                    insertCmd.Parameters.AddWithValue("@fn", request.FirstName ?? string.Empty);
                    insertCmd.Parameters.AddWithValue("@ln", request.LastName ?? string.Empty);
                    insertCmd.Parameters.AddWithValue("@login", request.Login ?? string.Empty);
                    insertCmd.Parameters.AddWithValue("@email", request.Email ?? string.Empty);
                    insertCmd.Parameters.AddWithValue("@pass", request.Password ?? string.Empty);

                    int result = await insertCmd.ExecuteNonQueryAsync();
                    return result > 0;
                }
            }
        }
    }
}