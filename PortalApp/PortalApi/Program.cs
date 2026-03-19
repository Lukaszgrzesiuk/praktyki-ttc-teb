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
builder.Services.AddScoped<ILoginService, LoginService>();
builder.Services.AddScoped<IRegistrationService, RegistrationService>();

// POBIERAMY CONNECTION STRING Z PLIKU appsettings.json!
// Dzięki temu zarówno Twój DbContext, jak i Twój NotesController będą korzystać z tej samej bazy.
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") 
                       ?? throw new InvalidOperationException("Nie znaleziono Connection Stringa w appsettings.json!");

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

// Ważne: CORS musi być przed Autoryzacją i Mapowaniem
app.UseCors("AllowAngular");
app.UseAuthorization();

app.MapControllers();

app.MapGet("/", () => "HELLO! The server is running. Go to /swagger to see the API.");

app.Run();