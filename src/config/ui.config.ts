import { ShopSettings } from '../types/settings';
import { DEFAULT_PRODUCT_CARD_CONFIG } from './product-card.config';

export const DEFAULT_SHOP_SETTINGS: ShopSettings = {
  shopName: 'Metro Quick Superstore',
  tagline: 'Fresh Groceries & Daily Essentials',
  address: 'Shop 14, Ground Floor, City Center Mall, Dhaka',
  phone: '+880 1712-345678',
  email: 'info@metroquickpos.local',
  vatRegNumber: 'BIN: 001928374-0101',
  currencySymbol: '৳',
  currencyCode: 'BDT',
  defaultTaxRate: 0,
  defaultLowStockThreshold: 5,
  receiptHeader: '*** THANK YOU FOR SHOPPING WITH US ***',
  receiptFooter: 'Goods once sold are returnable within 3 days with receipt.\nHave a wonderful day!',
  receiptPaperSize: '80mm',
  showVatOnReceipt: false,
  printSoundEnabled: true,
  productCardConfig: DEFAULT_PRODUCT_CARD_CONFIG,
  themeColor: 'emerald',
};

export const PAYMENT_METHODS: { id: 'Cash' | 'bKash' | 'Nagad' | 'Other MFS'; name: string; color: string; badge: string }[] = [
  { id: 'Cash', name: 'Cash (নগদ)', color: 'bg-emerald-600 text-white', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { id: 'bKash', name: 'bKash (বিকাশ)', color: 'bg-pink-600 text-white', badge: 'bg-pink-50 text-pink-700 border-pink-200' },
  { id: 'Nagad', name: 'Nagad (নগদ)', color: 'bg-amber-600 text-white', badge: 'bg-amber-50 text-amber-700 border-amber-200' },
  { id: 'Other MFS', name: 'Other MFS (অন্যান্য)', color: 'bg-indigo-600 text-white', badge: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
];

export const formatCurrency = (amount: number, symbol: string = '৳'): string => {
  if (isNaN(amount) || amount === null || amount === undefined) return `${symbol} 0.00`;
  return `${symbol} ${Number(amount).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

export const formatDateTime = (isoString: string): string => {
  try {
    const d = new Date(isoString);
    return d.toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return isoString;
  }
};
