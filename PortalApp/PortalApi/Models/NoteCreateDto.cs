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
        public byte? Helpfulness { get; set; }
        public byte? EaseOfCreation { get; set; }
        public int? GroupId { get; set; }
        public int? AuthorId { get; set; }

        // Files submitted from the form
        public IFormFile? Photo { get; set; }
        public IFormFile? Video { get; set; }
        public IFormFile? Audio { get; set; }
    }
}