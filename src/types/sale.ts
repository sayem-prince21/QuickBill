export type PaymentMethod = 'Cash' | 'bKash' | 'Nagad' | 'Other MFS';

export type SaleStatus = 'Completed' | 'Cancelled';

export interface SaleItem {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  category: string;
  quantity: number;
  unitPrice: number; // Snapshot of sold price
  originalPrice: number; // Snapshot of product list price at time of sale
  isPriceOverridden: boolean;
  costPrice?: number;
  lineTotal: number;
}

export interface Sale {
  id: string;
  invoiceNumber: string;
  saleDateTime: string; // ISO string
  items: SaleItem[];
  itemCount: number;
  totalQuantity: number;
  subtotal: number;
  discountType: 'fixed' | 'percentage';
  discountValue: number;
  discountAmount: number;
  taxAmount: number;
  finalTotal: number;
  paymentMethod: PaymentMethod;
  amountReceived: number;
  changeGiven: number;
  status: SaleStatus;
  cancelledAt?: string;
  cancelReason?: string;
  customerName?: string;
  customerPhone?: string;
  notes?: string;
}

export interface CartItem {
  product: {
    id: string;
    name: string;
    sku: string;
    category: string;
    sellingPrice: number;
    currentStock: number;
    imageUrl?: string;
  };
  quantity: number;
  unitPriceOverride?: number; // Optional bill-specific override
  effectiveUnitPrice: number; // Override price if set, else sellingPrice
  lineTotal: number;
}

export interface CheckoutRequest {
  items: {
    productId: string;
    quantity: number;
    unitPriceOverride?: number;
  }[];
  discountType?: 'fixed' | 'percentage';
  discountValue?: number;
  paymentMethod: PaymentMethod;
  amountReceived: number;
  customerName?: string;
  customerPhone?: string;
  notes?: string;
}
