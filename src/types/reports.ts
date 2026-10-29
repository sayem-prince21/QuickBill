import { PaymentMethod, SaleStatus } from './sale';

export interface DashboardMetrics {
  todaySalesTotal: number;
  todayBillCount: number;
  todayAverageBill: number;
  lowStockCount: number;
  totalProductsCount: number;
  todaySalesByPayment: Record<PaymentMethod, number>;
  todayBillsByPayment: Record<PaymentMethod, number>;
  topSellingProducts: {
    productId: string;
    productName: string;
    category: string;
    quantitySold: number;
    totalRevenue: number;
  }[];
  recentSales: {
    id: string;
    invoiceNumber: string;
    saleDateTime: string;
    finalTotal: number;
    paymentMethod: PaymentMethod;
    status: SaleStatus;
    itemCount: number;
  }[];
}

export interface PaymentSummaryRow {
  paymentMethod: PaymentMethod;
  billCount: number;
  totalAmount: number;
  percentageOfTotal: number;
}

export interface PaymentSummaryReport {
  dateRangeLabel: string;
  startDate: string;
  endDate: string;
  rows: PaymentSummaryRow[];
  totalBills: number;
  grandTotal: number;
}

export interface SalesFilter {
  startDate?: string;
  endDate?: string;
  invoiceNumber?: string;
  paymentMethod?: PaymentMethod | 'All';
  status?: SaleStatus | 'All';
}
