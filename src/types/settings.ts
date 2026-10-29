import { ProductCardConfig } from './product';

export type ReceiptPaperSize = '80mm' | '58mm' | 'A4';

export interface ShopSettings {
  shopName: string;
  tagline: string;
  address: string;
  phone: string;
  email: string;
  vatRegNumber: string;
  currencySymbol: string; // Default '৳'
  currencyCode: string; // Default 'BDT'
  defaultTaxRate: number; // In percentage, e.g. 0
  defaultLowStockThreshold: number;
  receiptHeader: string;
  receiptFooter: string;
  receiptPaperSize: ReceiptPaperSize;
  showVatOnReceipt: boolean;
  printSoundEnabled: boolean;
  productCardConfig: ProductCardConfig;
  themeColor: 'emerald' | 'indigo' | 'blue' | 'slate' | 'amber';
}

export interface BackupData {
  version: string;
  exportedAt: string;
  shopName: string;
  products: any[];
  categories: any[];
  sales: any[];
  stockMovements: any[];
  settings: ShopSettings;
}
