using Microsoft.EntityFrameworkCore;
using PortalApi.Models;

namespace PortalApi.Data
{
    public class MyDbContext : DbContext
    {
        public MyDbContext(DbContextOptions<MyDbContext> options) : base(options) { }

        // This links C# to your "Notes" table in SQL
        public DbSet<Note> Notes { get; set; }
    }
}