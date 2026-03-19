using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PortalApi.Models
{
    [Table("user_alerts")]
    public class UserAlert
    {
        [Key]
        [Column("alert_id")]
        public int Id { get; set; }

        [Column("user_id")]
        public int UserId { get; set; }

        [Column("message")]
        public string Message { get; set; } = string.Empty;

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Column("is_read")]
        public bool IsRead { get; set; } = false;
    }
}