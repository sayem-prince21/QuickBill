using System.ComponentModel.DataAnnotations;
using QuickBilling.Domain.Enums;

namespace QuickBilling.Domain.Entities;

public class StockMovement
{
    [Key]
    public string Id { get; set; } = Guid.NewGuid().ToString();

    [Required]
    public string ProductId { get; set; } = string.Empty;

    [Required]
    [MaxLength(200)]
    public string ProductName { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string SKU { get; set; } = string.Empty;

    public StockMovementType MovementType { get; set; }

    public int QuantityChange { get; set; }

    public int PreviousStock { get; set; }

    public int NewStock { get; set; }

    [Required]
    [MaxLength(500)]
    public string Reason { get; set; } = string.Empty;

    [MaxLength(50)]
    public string? ReferenceId { get; set; }

    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
}

public class ShopSetting
{
    [Key]
    public string Key { get; set; } = string.Empty;

    [Required]
    public string Value { get; set; } = string.Empty;
}
