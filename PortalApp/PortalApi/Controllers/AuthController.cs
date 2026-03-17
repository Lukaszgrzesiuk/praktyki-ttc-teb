using Microsoft.AspNetCore.Mvc;
using PortalApi.Models;
using PortalApi.Services;

namespace PortalApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly ILoginService _loginService;
        private readonly IRegistrationService _registrationService;

        public AuthController(ILoginService loginService, IRegistrationService registrationService)
        {
            _loginService = loginService;
            _registrationService = registrationService;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            var user = await _loginService.AuthenticateAsync(request.Login, request.Password);
            if (user == null) return Unauthorized(new { message = "Invalid credentials" });

            return Ok(new { message = "Logged in successfully", user = user.Login });
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            var success = await _registrationService.CreateUserAsync(request);
            if (!success) return BadRequest(new { message = "Registration failed: User already exists" });

            return Ok(new { message = "Account created successfully" });
        }
    }
}