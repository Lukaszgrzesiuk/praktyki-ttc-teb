using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PortalApi.Models
{
    [Table("activity_logs")]
    public class ActivityLog
    {
        [Key]
        [Column("log_id")]
        public int Id { get; set; }

        [Column("user_id")]
        public int UserId { get; set; }

        [Column("action_description")]
        public string ActionDescription { get; set; } = string.Empty;

        [Column("timestamp")]
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    }
}