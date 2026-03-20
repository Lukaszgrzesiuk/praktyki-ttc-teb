namespace PortalApi.Models
{
    public class Note
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Content { get; set; } // Optional in DB
        public string? Permissions { get; set; } = "Public";
        public string? Author { get; set; } = "User";
        public DateTime CreationDate { get; set; } = DateTime.Now;

        public string? PhotoUrl { get; set; }
        public string? VideoUrl { get; set; }
        public string? AudioUrl { get; set; }

        // Foreign keys from SQL schema
        public int? GroupId { get; set; }
        public int? AuthorId { get; set; }

        // Ratings (Mapped to TINYINT in the database)
        public byte? HelpfulnessRating { get; set; }
        public byte? CreationEaseRating { get; set; }
    }
}