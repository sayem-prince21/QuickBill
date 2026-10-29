namespace QuickBilling.Domain.Enums;

public enum SaleStatus
{
    Completed = 1,
    Cancelled = 2
}

public enum StockMovementType
{
    Sale = 1,
    SaleCancellation = 2,
    Restock = 3,
    ManualAdjustment = 4,
    InitialStock = 5
}
