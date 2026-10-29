using Microsoft.EntityFrameworkCore;
using QuickBilling.Domain.Entities;

namespace QuickBilling.Infrastructure.Data;

public class QuickBillingDbContext : DbContext
{
    public QuickBillingDbContext(DbContextOptions<QuickBillingDbContext> options) : base(options)
    {
    }

    public DbSet<Product> Products => Set<Product>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Sale> Sales => Set<Sale>();
    public DbSet<SaleItem> SaleItems => Set<SaleItem>();
    public DbSet<StockMovement> StockMovements => Set<StockMovement>();
    public DbSet<ShopSetting> ShopSettings => Set<ShopSetting>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Product SKU Unique Index
        modelBuilder.Entity<Product>()
            .HasIndex(p => p.SKU)
            .IsUnique();

        // Invoice Number Unique Index
        modelBuilder.Entity<Sale>()
            .HasIndex(s => s.InvoiceNumber)
            .IsUnique();

        // Indexes for performance
        modelBuilder.Entity<Sale>()
            .HasIndex(s => s.SaleDateTime);

        modelBuilder.Entity<StockMovement>()
            .HasIndex(sm => sm.ProductId);
    }
}
