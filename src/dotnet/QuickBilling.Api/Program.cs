using System.Diagnostics;
using Microsoft.EntityFrameworkCore;
using QuickBilling.Infrastructure.Data;

var builder = WebApplication.CreateBuilder(args);

// Configure SQLite Database path at %LOCALAPPDATA%\QuickBilling\quickbilling.db
var localAppData = Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData);
var appDataDir = Path.Combine(localAppData, "QuickBilling");
if (!Directory.Exists(appDataDir))
{
    Directory.CreateDirectory(appDataDir);
}
var dbPath = Path.Combine(appDataDir, "quickbilling.db");
var connectionString = $"Data Source={dbPath}";

builder.Services.AddDbContext<QuickBillingDbContext>(options =>
    options.UseSqlite(connectionString));

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

// Bind strictly to local loopback interface for local desktop security
builder.WebHost.UseUrls("http://127.0.0.1:5000");

var app = builder.Build();

// Ensure SQLite database & tables exist automatically
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<QuickBillingDbContext>();
    db.Database.EnsureCreated();
}

app.UseRouting();

// Serve production React Vite SPA static files from wwwroot
app.UseDefaultFiles();
app.UseStaticFiles();

app.MapControllers();

// Fallback all non-API routes to index.html for React SPA
app.MapFallbackToFile("index.html");

// Auto-open local desktop browser on application launch
if (Environment.UserInteractive && !app.Environment.IsDevelopment())
{
    _ = Task.Run(async () =>
    {
        await Task.Delay(1200);
        try
        {
            Process.Start(new ProcessStartInfo
            {
                FileName = "http://127.0.0.1:5000",
                UseShellExecute = true
            });
        }
        catch { }
    });
}

app.Run();
