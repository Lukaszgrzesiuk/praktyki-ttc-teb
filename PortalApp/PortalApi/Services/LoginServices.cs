using Microsoft.EntityFrameworkCore;
using PortalApi.Data;   
using PortalApi.Models; 
using System.Threading.Tasks;

namespace PortalApi.Services
{
    public interface ILoginService
    {
        Task<User?> AuthenticateAsync(string login, string password);
    }

    public class LoginService : ILoginService
    {
        private readonly MyDbContext _context;

        public LoginService(MyDbContext context)
        {
            _context = context;
        }

        public async Task<User?> AuthenticateAsync(string login, string password)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Login == login);

            if (user == null || user.Password != password)
            {
                return null;
            }

            return user;
        }
    }
}