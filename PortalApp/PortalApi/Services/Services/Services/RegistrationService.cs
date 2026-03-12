using Microsoft.EntityFrameworkCore;
using PortalApi.Data;   
using PortalApi.Models; 
using System.Threading.Tasks;

namespace PortalApi.Services
{
    public interface IRegistrationService
    {
        Task<bool> CreateUserAsync(RegisterRequest request);
    }

    public class RegistrationService : IRegistrationService
    {
        private readonly MyDbContext _context;

        public RegistrationService(MyDbContext context)
        {
            _context = context;
        }

        public async Task<bool> CreateUserAsync(RegisterRequest request)
        {
            bool userExists = await _context.Users.AnyAsync(u => u.Login == request.Login);
            
            if (userExists)
            {
                return false; 
            }

            var newUser = new User
            {
                FirstName = request.FirstName,
                LastName = request.LastName,
                Login = request.Login,
                Email = request.Email,
                Password = request.Password 
            };

            _context.Users.Add(newUser);
            var result = await _context.SaveChangesAsync();

            return result > 0;
        }
    }
}