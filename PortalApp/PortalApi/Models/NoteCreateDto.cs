using Microsoft.AspNetCore.Http;

namespace PortalApi.Models
{
    public class NoteCreateDto
    {
        public string Title { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public string Permissions { get; set; } = "Public";
        public string Author { get; set; } = "User";

        // Files submitted from the form
        public IFormFile? Photo { get; set; }
        public IFormFile? Video { get; set; }
        public IFormFile? Audio { get; set; }
    }
}