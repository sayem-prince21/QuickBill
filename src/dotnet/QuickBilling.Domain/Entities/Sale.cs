using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using QuickBilling.Domain.Enums;

namespace QuickBilling.Domain.Entities;

public class Sale
{
    [Key]
    public string Id { get; set; } = Guid.NewGuid().ToString();

    [Required]
    [MaxLength(50)]
    public string InvoiceNumber { get; set; } = string.Empty;

    public DateTime SaleDateTime { get; set; } = DateTime.UtcNow;

    public List<SaleItem> Items { get; set; } = new();

    public int ItemCount { get; set; }

    public int TotalQuantity { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal Subtotal { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal DiscountAmount { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal TaxAmount { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal FinalTotal { get; set; }

    public PaymentMethod PaymentMethod { get; set; } = PaymentMethod.Cash;

    [Column(TypeName = "decimal(18,2)")]
    public decimal AmountReceived { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal ChangeGiven { get; set; }

    public SaleStatus Status { get; set; } = SaleStatus.Completed;

    public DateTime? CancelledAt { get; set; }

    [MaxLength(500)]
    public string? CancelReason { get; set; }

    [MaxLength(150)]
    public string? CustomerName { get; set; }

    [MaxLength(50)]
    public string? CustomerPhone { get; set; }

    [MaxLength(500)]
    public string? Notes { get; set; }
}

public class SaleItem
{
    [Key]
    public string Id { get; set; } = Guid.NewGuid().ToString();

    [Required]
    public string SaleId { get; set; } = string.Empty;

    [ForeignKey(nameof(SaleId))]
    public Sale? Sale { get; set; }

    [Required]
    public string ProductId { get; set; } = string.Empty;

    [Required]
    [MaxLength(200)]
    public string ProductName { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string SKU { get; set; } = string.Empty;

    [MaxLength(100)]
    public string Category { get; set; } = string.Empty;

    public int Quantity { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal UnitPrice { get; set; } // Snapshot of sold price

    [Column(TypeName = "decimal(18,2)")]
    public decimal OriginalPrice { get; set; } // Snapshot of product list price

    public bool IsPriceOverridden { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal? CostPrice { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal LineTotal { get; set; }
}
