using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

[Table("user_registration")]
public class User
{
    [Key]
    [Column("user_id")]
    public int Id { get; set; }

    [Column("login")]
    public string Login { get; set; } = string.Empty;

    [Column("password_val")]
    public string Password { get; set; } = string.Empty;

    // Reszta pól jest opcjonalna do logowania, więc możemy je pominąć dla uproszczenia
}

// Klasa pomocnicza do odbierania danych z Angulara
public class LoginRequest
{
    public string Login { get; set; }
    public string Password { get; set; }
}