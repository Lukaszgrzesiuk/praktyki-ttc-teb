using Microsoft.EntityFrameworkCore;
using PortalApi.Data;
using PortalApi.Services; 

var builder = WebApplication.CreateBuilder(args);

// 1. --- PORT CONFIGURATION ---
builder.WebHost.UseUrls("http://localhost:5000");

// 2. --- SERVICES ---
builder.Services.AddControllers(); 
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Application Services
builder.Services.AddScoped<ILoginService, LoginService>();
builder.Services.AddScoped<IRegistrationService, RegistrationService>();
// NEW: Added AdminUserService to fix the Dependency Injection (DI) error!
builder.Services.AddScoped<IAdminUserService, AdminUserService>();

// GET CONNECTION STRING FROM appsettings.json
// This ensures both DbContext and ADO.NET services use the same database.
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") 
                       ?? throw new InvalidOperationException("Connection string not found in appsettings.json!");

// Database Setup (Entity Framework)
builder.Services.AddDbContext<MyDbContext>(options => 
    options.UseSqlServer(connectionString));

// CORS Setup
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngular", policy =>
    {
        policy.WithOrigins("http://localhost:4200")
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var app = builder.Build();

// 3. --- MIDDLEWARE PIPELINE ---
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "Portal API V1");
    c.RoutePrefix = "swagger"; 
});

// Important: CORS middleware must be placed BEFORE Authorization and MapControllers
app.UseCors("AllowAngular");
app.UseAuthorization();

app.MapControllers();

app.MapGet("/", () => "HELLO! The server is running. Go to /swagger to see the API.");

app.Run();