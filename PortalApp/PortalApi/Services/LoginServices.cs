using Microsoft.Extensions.Configuration;
using PortalApi.Models;
using System;
using Microsoft.Data.SqlClient;
using System.Threading.Tasks;

namespace PortalApi.Services
{
    public interface ILoginService
    {
        Task<User?> AuthenticateAsync(string login, string password);
    }

    public class LoginService : ILoginService
    {
        private readonly string _connectionString;

        public LoginService(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection") 
                ?? throw new InvalidOperationException("Connection string not found.");
        }

        public async Task<User?> AuthenticateAsync(string login, string password)
        {
            using (SqlConnection conn = new SqlConnection(_connectionString))
            {
                await conn.OpenAsync();
                // Using login_name matching your SQL table
                string query = "SELECT user_id, first_name, last_name, login_name, email, password_val FROM user_registration WHERE login_name = @login";

                using (SqlCommand cmd = new SqlCommand(query, conn))
                {
                    cmd.Parameters.AddWithValue("@login", login);

                    using (SqlDataReader reader = await cmd.ExecuteReaderAsync())
                    {
                        if (await reader.ReadAsync())
                        {
                            var dbPassword = reader["password_val"].ToString();
                            
                            // Check if passwords match
                            if (dbPassword == password)
                            {
                                return new User
                                {
                                    Id = Convert.ToInt32(reader["user_id"]),
                                    FirstName = reader["first_name"].ToString() ?? string.Empty,
                                    LastName = reader["last_name"].ToString() ?? string.Empty,
                                    Login = reader["login_name"].ToString() ?? string.Empty,
                                    Email = reader["email"].ToString() ?? string.Empty,
                                    Password = dbPassword
                                };
                            }
                        }
                    }
                }
            }
            // Return null if user not found or password incorrect
            return null; 
        }
    }
}