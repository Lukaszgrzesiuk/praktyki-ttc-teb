using Microsoft.AspNetCore.Http;

namespace PortalApi.Models
{
    public class NoteCreateDto
    {
        public string Title { get; set; } = string.Empty;
        public string? Content { get; set; }
        public string? Permissions { get; set; } = "Public";
        public string? Author { get; set; } = "User";

        // New fields for ratings and relations
        public byte? HelpfulnessRating { get; set; }
        public byte? CreationEaseRating { get; set; }
        public int? group_id { get; set; }
        public int? author_id { get; set; }

        // Files submitted from the form via FormData
        public IFormFile? Photo { get; set; }
        public IFormFile? Video { get; set; }
        public IFormFile? Audio { get; set; }
    }
}