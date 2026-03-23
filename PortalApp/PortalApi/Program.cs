using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Configuration;
using PortalApi.Services;
using System;

var builder = WebApplication.CreateBuilder(args);

// 1. --- PORT CONFIGURATION ---
builder.WebHost.UseUrls("http://localhost:5000");

// 2. --- SERVICES ---
builder.Services.AddControllers(); 
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Register all services using ADO.NET
builder.Services.AddScoped<ILoginService, LoginService>();
builder.Services.AddScoped<IRegistrationService, RegistrationService>();
builder.Services.AddScoped<IAdminService, AdminService>();
builder.Services.AddScoped<INoteService, NoteService>();

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
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Portal API V1");
        c.RoutePrefix = "swagger"; 
    });
}

// Important: CORS must be placed before Authorization and MapControllers
app.UseCors("AllowAngular");
app.UseAuthorization();

app.MapControllers();

app.MapGet("/", () => "HELLO! The server is running. Go to /swagger to see the API.");

// app.Run() must ALWAYS be at the very bottom of the file
app.Run();