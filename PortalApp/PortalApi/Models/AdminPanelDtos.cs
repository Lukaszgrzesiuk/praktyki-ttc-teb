namespace PortalApi.Models
{
    public class ActivityLogDto
    {
        public string Action { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; }
        public bool IsSuspicious { get; set; }
    }

    public class AdminUserDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public List<string> Groups { get; set; } = new();
        public List<string> Notes { get; set; } = new();
        public List<ActivityLogDto> Logs { get; set; } = new();
    }

    // Helper class for user creation (the frontend only sends the 'name' property)
    public class CreateAdminUserRequest
    {
        public string Name { get; set; } = string.Empty;
    }
}