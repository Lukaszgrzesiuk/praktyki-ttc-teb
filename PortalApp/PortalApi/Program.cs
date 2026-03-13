using Microsoft.EntityFrameworkCore;
using PortalApi.Data;
using PortalApi.Services; 


var builder = WebApplication.CreateBuilder(args);


// 1. --- PORT CONFIGURATION ---
// This forces the app to stay on Port 5000 and ignore other settings
builder.WebHost.UseUrls("http://localhost:5000");

// 2. --- SERVICES ---
// These lines MUST be here for the [ApiController] buttons to show up in Swagger
builder.Services.AddControllers(); 
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Your Connection String
var connectionString = "Server=192.168.0.171,1433;Database=Login_panel;user Id=user;TrustServerCertificate=True;";
;

// Database Setup
builder.Services.AddDbContext<MyDbContext>(options => 
    options.UseSqlServer(connectionString));

// CORS Setup (Allows your Angular app on port 4200 to talk to this API)
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
// The order here is critical for Swagger to work

app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "Portal API V1");
    // This makes Swagger available at http://localhost:5000/swagger
    c.RoutePrefix = "swagger"; 
});

// Important: Use CORS before Authorization and Mapping
app.UseCors("AllowAngular");
app.UseAuthorization();

// This line specifically scans your 'Controllers' folder and creates the routes
app.MapControllers();

// A simple root test to verify the server is alive
app.MapGet("/", () => "HELLO! The server is running. Go to /swagger to see the API.");

app.Run();