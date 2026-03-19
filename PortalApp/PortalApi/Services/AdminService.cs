using Microsoft.EntityFrameworkCore;
using PortalApi.Data;
using PortalApi.Models;
using System.Collections.Generic;
using System.Linq;
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
        private readonly MyDbContext _context;

        public AdminService(MyDbContext context)
        {
            _context = context;
        }

        // Retrieves all user activity logs sorted by the newest first
        public async Task<List<ActivityLog>> GetUserLogsAsync()
        {
            return await _context.ActivityLogs
                .OrderByDescending(log => log.Timestamp)
                .ToListAsync();
        }

        // Sends an alert to a specific user if the user exists
        public async Task<bool> SendAlertToUserAsync(int userId, string message)
        {
            // Verify if the user exists before sending the alert
            var userExists = await _context.Users.AnyAsync(u => u.Id == userId);
            if (!userExists) 
            {
                return false;
            }

            var alert = new UserAlert
            {
                UserId = userId,
                Message = message
            };

            _context.UserAlerts.Add(alert);
            return await _context.SaveChangesAsync() > 0;
        }
    }
}