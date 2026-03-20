using Microsoft.AspNetCore.Mvc;
using PortalApi.Models;
using PortalApi.Services;

namespace PortalApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AdminUsersController : ControllerBase
    {
        private readonly IAdminUserService _adminService;

        public AdminUsersController(IAdminUserService adminService)
        {
            _adminService = adminService;
        }

        [HttpGet]
        public async Task<IActionResult> GetUsers()
        {
            return Ok(await _adminService.GetAllUsersFullAsync());
        }

        [HttpPost]
        public async Task<IActionResult> AddUser([FromBody] CreateAdminUserRequest req)
        {
            var newId = await _adminService.CreateUserAsync(req.Name);
            
            // Log the creation event automatically
            await _adminService.AddLogAsync(newId, "Account created", false);
            
            return Ok(new { Id = newId });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            await _adminService.DeleteUserAsync(id);
            return Ok();
        }

        // --- GROUP ENDPOINTS ---
        
        [HttpPost("{id}/groups")]
        public async Task<IActionResult> AddGroup(int id, [FromBody] string groupName)
        {
            await _adminService.AddGroupAsync(id, groupName);
            await _adminService.AddLogAsync(id, $"Added to group: {groupName}", false);
            return Ok();
        }

        [HttpDelete("{id}/groups/{groupName}")]
        public async Task<IActionResult> RemoveGroup(int id, string groupName)
        {
            await _adminService.RemoveGroupAsync(id, groupName);
            await _adminService.AddLogAsync(id, $"Removed from group: {groupName}", false);
            return Ok();
        }

        // --- NOTE ENDPOINTS ---
        
        [HttpPost("{id}/notes")]
        public async Task<IActionResult> AddNote(int id, [FromBody] string noteContent)
        {
            await _adminService.AddNoteAsync(id, noteContent);
            await _adminService.AddLogAsync(id, $"Created note: {noteContent}", false);
            return Ok();
        }

        [HttpDelete("{id}/notes/{noteContent}")]
        public async Task<IActionResult> RemoveNote(int id, string noteContent)
        {
            await _adminService.RemoveNoteAsync(id, noteContent);
            await _adminService.AddLogAsync(id, $"Deleted note: {noteContent}", false);
            return Ok();
        }

        // --- LOG ENDPOINTS (e.g., Misuse simulation) ---
        
        [HttpPost("{id}/logs")]
        public async Task<IActionResult> AddLog(int id, [FromBody] ActivityLogDto logInfo)
        {
            await _adminService.AddLogAsync(id, logInfo.Action, logInfo.IsSuspicious);
            return Ok();
        }
    }
}