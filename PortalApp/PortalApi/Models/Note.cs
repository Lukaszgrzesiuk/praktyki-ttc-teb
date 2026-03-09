using System.Text.Json.Serialization;

namespace PortalApi.Models
{
    public class Note
    {
        public int Id { get; set; }

        // Maps "tytul" from Angular to "Title" in C#
        [JsonPropertyName("tytul")]
        public string Title { get; set; } = string.Empty;

        [JsonPropertyName("tresc")]
        public string Text { get; set; } = string.Empty;

        [JsonPropertyName("uprawnienia")]
        public string Privacy { get; set; } = "Publiczne";

        [JsonPropertyName("autor")]
        public string Author { get; set; } = "Anonim";

        [JsonPropertyName("dataUtworzenia")]
        public DateTime CreatedAt { get; set; } = DateTime.Now;
    }
}