using Microsoft.EntityFrameworkCore;
using PortalApi.Models;

namespace PortalApi.Data
{
    public class MyDbContext : DbContext
    {
        public MyDbContext(DbContextOptions<MyDbContext> options) : base(options) { }

        public DbSet<User> Users { get; set; } 

        public DbSet<ActivityLog> ActivityLogs { get; set; }
        public DbSet<UserAlert> UserAlerts { get; set; }
    }
}