using Microsoft.AspNetCore.Mvc;
using PortalApi.Models;
using PortalApi.Services;
using System.Threading.Tasks;

namespace PortalApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AdminController : ControllerBase
    {
        private readonly IAdminService _adminService;

        public AdminController(IAdminService adminService)
        {
            _adminService = adminService;
        }

        // GET: api/admin/logs
        [HttpGet("logs")]
        public async Task<IActionResult> GetLogs()
        {
            var logs = await _adminService.GetUserLogsAsync();
            return Ok(logs);
        }

        // POST: api/admin/alerts
        [HttpPost("alerts")]
        public async Task<IActionResult> SendAlert([FromBody] SendAlertRequest request)
        {
            // Validate if the message is not empty
            if (string.IsNullOrWhiteSpace(request.Message))
            {
                return BadRequest(new { message = "Alert message cannot be empty." });
            }

            var success = await _adminService.SendAlertToUserAsync(request.UserId, request.Message);
            
            // Check if the user exists in the database
            if (!success)
            {
                return NotFound(new { message = "User not found. Alert not sent." });
            }

            return Ok(new { message = "Alert sent successfully to the user." });
        }
    }
}