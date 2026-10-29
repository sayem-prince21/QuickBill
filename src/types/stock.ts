export type StockMovementType =
  | 'Sale'
  | 'SaleCancellation'
  | 'Restock'
  | 'ManualAdjustment'
  | 'DamageLoss'
  | 'InitialStock';

export interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  movementType: StockMovementType;
  quantityChange: number; // positive or negative
  previousStock: number;
  newStock: number;
  reason: string;
  referenceId?: string; // e.g. invoiceNumber
  timestamp: string;
}

export interface StockAdjustmentRequest {
  productId: string;
  adjustmentType: 'add' | 'subtract' | 'set';
  quantity: number;
  reason: string;
}
