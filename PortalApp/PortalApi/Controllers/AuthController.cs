using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using PortalApi.Models;

namespace PortalApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private string connectionString = "Server=192.168.0.171,1433;Database=Login_panel;user Id=user;TrustServerCertificate=True;";

        [HttpPost("login")]
        public IActionResult Login([FromBody] LoginRequest model)
        {
            try
            {
                using (SqlConnection conn = new SqlConnection(connectionString))
                {
                    conn.Open();
                    string sql = "SELECT password_val FROM user_registration WHERE login = @login";
                    
                    using (SqlCommand cmd = new SqlCommand(sql, conn))
                    {
                        cmd.Parameters.AddWithValue("@login", model.Login);
                        var result = cmd.ExecuteScalar();

                        if (result == null)
                            return Unauthorized(new { message = "User not found." });

                        string dbPassword = result?.ToString() ?? string.Empty;
                        
                        if (model.Password == dbPassword)
                        {
                            return Ok(new { message = "Login successful", user = model.Login });
                        }
                        else
                        {
                            return Unauthorized(new { message = "Invalid password." });
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Database error: " + ex.Message });
            }
        }

        [HttpPost("register")]
        public IActionResult Register([FromBody] RegisterRequest model)
        {
            try
            {
                using (SqlConnection conn = new SqlConnection(connectionString))
                {
                    conn.Open();
                    string sql = @"INSERT INTO user_registration (first_name, last_name, login, email, password_val) 
                                   VALUES (@first, @last, @login, @email, @pass)";

                    using (SqlCommand cmd = new SqlCommand(sql, conn))
                    {
                        cmd.Parameters.AddWithValue("@first", model.FirstName);
                        cmd.Parameters.AddWithValue("@last", model.LastName);
                        cmd.Parameters.AddWithValue("@login", model.Login);
                        cmd.Parameters.AddWithValue("@email", model.Email);
                        cmd.Parameters.AddWithValue("@pass", model.Password);

                        cmd.ExecuteNonQuery();
                    }
                }
                return Ok(new { message = "Registration successful" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Registration failed: " + ex.Message });
            }
        }
    }
}