namespace PortalApi.Models
{
    public record LoginRequest(string Login, string Password);

    public record RegisterRequest(
        string FirstName, 
        string LastName, 
        string Login, 
        string Email, 
        string Password);
}