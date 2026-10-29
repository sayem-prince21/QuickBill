import { Product, Category } from '../types/product';
import { Sale } from '../types/sale';
import { StockMovement } from '../types/stock';
import { ShopSettings } from '../types/settings';
import { DEFAULT_SHOP_SETTINGS } from '../config/ui.config';

const KEYS = {
  PRODUCTS: 'qb_products',
  CATEGORIES: 'qb_categories',
  SALES: 'qb_sales',
  STOCK_MOVEMENTS: 'qb_stock_movements',
  SETTINGS: 'qb_settings',
  LAST_INVOICE_SEQ: 'qb_invoice_seq',
};

const SEED_CATEGORIES: Category[] = [
  { id: 'cat-groceries', name: 'Groceries', color: 'emerald', icon: 'ShoppingBag' },
  { id: 'cat-beverages', name: 'Beverages', color: 'blue', icon: 'Coffee' },
  { id: 'cat-snacks', name: 'Snacks & Bakery', color: 'amber', icon: 'Cookie' },
  { id: 'cat-dairy', name: 'Dairy & Eggs', color: 'indigo', icon: 'Milk' },
  { id: 'cat-personal', name: 'Personal Care', color: 'purple', icon: 'Sparkles' },
  { id: 'cat-household', name: 'Household Cleaning', color: 'rose', icon: 'Home' },
];

const SEED_PRODUCTS: Product[] = [
  {
    id: 'prod-001',
    name: 'Basmati Rice Premium 5kg',
    sku: 'GROC-001',
    category: 'Groceries',
    description: 'Aromatic long grain basmati rice, vacuum sealed.',
    sellingPrice: 780.0,
    costPrice: 690.0,
    currentStock: 42,
    lowStockThreshold: 10,
    imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=400&q=80',
    isActive: true,
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 30 * 86400000).toISOString(),
  },
  {
    id: 'prod-002',
    name: 'Pure Soybean Oil 5L',
    sku: 'GROC-002',
    category: 'Groceries',
    description: 'Triple refined fortified edible soybean oil.',
    sellingPrice: 890.0,
    costPrice: 820.0,
    currentStock: 25,
    lowStockThreshold: 8,
    imageUrl: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=400&q=80',
    isActive: true,
    createdAt: new Date(Date.now() - 25 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 25 * 86400000).toISOString(),
  },
  {
    id: 'prod-003',
    name: 'Red Lentils (Masoor Dal) 1kg',
    sku: 'GROC-003',
    category: 'Groceries',
    description: 'Cleaned unpolished fresh red lentils.',
    sellingPrice: 140.0,
    costPrice: 118.0,
    currentStock: 35,
    lowStockThreshold: 10,
    imageUrl: 'https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?auto=format&fit=crop&w=400&q=80',
    isActive: true,
    createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 20 * 86400000).toISOString(),
  },
  {
    id: 'prod-004',
    name: 'Iodized Table Salt 1kg',
    sku: 'GROC-004',
    category: 'Groceries',
    description: 'Pure vacuum dried iodized white salt.',
    sellingPrice: 42.0,
    costPrice: 32.0,
    currentStock: 60,
    lowStockThreshold: 15,
    imageUrl: 'https://images.unsplash.com/photo-1518110925495-5fe2fda0442c?auto=format&fit=crop&w=400&q=80',
    isActive: true,
    createdAt: new Date(Date.now() - 15 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 15 * 86400000).toISOString(),
  },
  {
    id: 'prod-005',
    name: 'Full Cream Milk 1L Box',
    sku: 'DAIR-001',
    category: 'Dairy & Eggs',
    description: 'UHT treated sterilized cow milk.',
    sellingPrice: 95.0,
    costPrice: 80.0,
    currentStock: 18,
    lowStockThreshold: 10,
    imageUrl: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=400&q=80',
    isActive: true,
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 10 * 86400000).toISOString(),
  },
  {
    id: 'prod-006',
    name: 'Farm Fresh Brown Eggs (Dozen)',
    sku: 'DAIR-002',
    category: 'Dairy & Eggs',
    description: 'Graded fresh antibiotic-free layer eggs.',
    sellingPrice: 155.0,
    costPrice: 135.0,
    currentStock: 4, // Intentionally low stock for alert testing
    lowStockThreshold: 8,
    imageUrl: 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?auto=format&fit=crop&w=400&q=80',
    isActive: true,
    createdAt: new Date(Date.now() - 8 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 8 * 86400000).toISOString(),
  },
  {
    id: 'prod-007',
    name: 'Salted Dairy Butter 200g',
    sku: 'DAIR-003',
    category: 'Dairy & Eggs',
    description: 'Creamy pasteurized salted table butter.',
    sellingPrice: 220.0,
    costPrice: 190.0,
    currentStock: 12,
    lowStockThreshold: 5,
    imageUrl: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?auto=format&fit=crop&w=400&q=80',
    isActive: true,
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    id: 'prod-008',
    name: 'Black Tea Bags (100 Pcs)',
    sku: 'BEV-001',
    category: 'Beverages',
    description: 'Strong rich blend selected Ceylon leaves.',
    sellingPrice: 380.0,
    costPrice: 310.0,
    currentStock: 22,
    lowStockThreshold: 6,
    imageUrl: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=400&q=80',
    isActive: true,
    createdAt: new Date(Date.now() - 12 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 12 * 86400000).toISOString(),
  },
  {
    id: 'prod-009',
    name: 'Instant Coffee Jar 100g',
    sku: 'BEV-002',
    category: 'Beverages',
    description: 'Freeze dried 100% pure roasted coffee beans.',
    sellingPrice: 520.0,
    costPrice: 440.0,
    currentStock: 3, // Low stock
    lowStockThreshold: 5,
    imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=400&q=80',
    isActive: true,
    createdAt: new Date(Date.now() - 14 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 14 * 86400000).toISOString(),
  },
  {
    id: 'prod-010',
    name: 'Chilled Cola Pet Bottle 2L',
    sku: 'BEV-003',
    category: 'Beverages',
    description: 'Sparkling carbonated soft drink.',
    sellingPrice: 110.0,
    costPrice: 85.0,
    currentStock: 30,
    lowStockThreshold: 10,
    imageUrl: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=400&q=80',
    isActive: true,
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 7 * 86400000).toISOString(),
  },
  {
    id: 'prod-011',
    name: 'Crispy Potato Chips Masala 50g',
    sku: 'SNK-001',
    category: 'Snacks & Bakery',
    description: 'Spicy crinkle cut golden potato chips.',
    sellingPrice: 35.0,
    costPrice: 26.0,
    currentStock: 50,
    lowStockThreshold: 15,
    imageUrl: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=400&q=80',
    isActive: true,
    createdAt: new Date(Date.now() - 9 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 9 * 86400000).toISOString(),
  },
  {
    id: 'prod-012',
    name: 'Chocolate Chip Cookies 200g',
    sku: 'SNK-002',
    category: 'Snacks & Bakery',
    description: 'Oven baked crunchy biscuit loaded with chocolate chips.',
    sellingPrice: 130.0,
    costPrice: 100.0,
    currentStock: 19,
    lowStockThreshold: 5,
    imageUrl: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&w=400&q=80',
    isActive: true,
    createdAt: new Date(Date.now() - 11 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 11 * 86400000).toISOString(),
  },
  {
    id: 'prod-013',
    name: 'Antibacterial Hand Soap 100g',
    sku: 'CARE-001',
    category: 'Personal Care',
    description: '99.9% germ protection herbal moisturizing bar.',
    sellingPrice: 65.0,
    costPrice: 48.0,
    currentStock: 28,
    lowStockThreshold: 10,
    imageUrl: 'https://images.unsplash.com/photo-1607006314592-3a525a74e53e?auto=format&fit=crop&w=400&q=80',
    isActive: true,
    createdAt: new Date(Date.now() - 18 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 18 * 86400000).toISOString(),
  },
  {
    id: 'prod-014',
    name: 'Herbal Mint Toothpaste 150g',
    sku: 'CARE-002',
    category: 'Personal Care',
    description: 'Fluoride protection for strong enamel and fresh breath.',
    sellingPrice: 175.0,
    costPrice: 135.0,
    currentStock: 16,
    lowStockThreshold: 5,
    imageUrl: 'https://images.unsplash.com/photo-1559567249-664ff0b29c5b?auto=format&fit=crop&w=400&q=80',
    isActive: true,
    createdAt: new Date(Date.now() - 17 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 17 * 86400000).toISOString(),
  },
  {
    id: 'prod-015',
    name: 'Dishwashing Liquid Lemon 500ml',
    sku: 'HOUS-001',
    category: 'Household Cleaning',
    description: 'Tough grease cutting formula with fresh natural lime.',
    sellingPrice: 145.0,
    costPrice: 115.0,
    currentStock: 2, // Out-of-stock / critical testing
    lowStockThreshold: 5,
    imageUrl: 'https://images.unsplash.com/photo-1585421514284-efb74c2b69ba?auto=format&fit=crop&w=400&q=80',
    isActive: true,
    createdAt: new Date(Date.now() - 22 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 22 * 86400000).toISOString(),
  },
];

class StorageEngine {
  constructor() {
    this.init();
  }

  private init() {
    if (!localStorage.getItem(KEYS.CATEGORIES)) {
      localStorage.setItem(KEYS.CATEGORIES, JSON.stringify(SEED_CATEGORIES));
    }
    if (!localStorage.getItem(KEYS.PRODUCTS)) {
      localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(SEED_PRODUCTS));
    }
    if (!localStorage.getItem(KEYS.SETTINGS)) {
      localStorage.setItem(KEYS.SETTINGS, JSON.stringify(DEFAULT_SHOP_SETTINGS));
    }
    if (!localStorage.getItem(KEYS.SALES)) {
      // Seed a few realistic historical sales for today and yesterday to make Dashboard & Reports come alive immediately!
      this.seedInitialSales();
    }
    if (!localStorage.getItem(KEYS.STOCK_MOVEMENTS)) {
      localStorage.setItem(KEYS.STOCK_MOVEMENTS, JSON.stringify([]));
    }
  }

  private seedInitialSales() {
    const today = new Date();
    const yesterday = new Date(Date.now() - 86400000);

    const formatInv = (date: Date, seq: number) => {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const d = String(date.getDate()).padStart(2, '0');
      return `INV-${y}${m}${d}-${String(seq).padStart(4, '0')}`;
    };

    const initialSales: Sale[] = [
      {
        id: 'sale-001',
        invoiceNumber: formatInv(yesterday, 1),
        saleDateTime: new Date(yesterday.setHours(10, 30, 0, 0)).toISOString(),
        items: [
          {
            id: 'si-001',
            productId: 'prod-001',
            productName: 'Basmati Rice Premium 5kg',
            sku: 'GROC-001',
            category: 'Groceries',
            quantity: 1,
            unitPrice: 780.0,
            originalPrice: 780.0,
            isPriceOverridden: false,
            costPrice: 690.0,
            lineTotal: 780.0,
          },
          {
            id: 'si-002',
            productId: 'prod-005',
            productName: 'Full Cream Milk 1L Box',
            sku: 'DAIR-001',
            category: 'Dairy & Eggs',
            quantity: 2,
            unitPrice: 95.0,
            originalPrice: 95.0,
            isPriceOverridden: false,
            costPrice: 80.0,
            lineTotal: 190.0,
          },
        ],
        itemCount: 2,
        totalQuantity: 3,
        subtotal: 970.0,
        discountType: 'fixed',
        discountValue: 20.0,
        discountAmount: 20.0,
        taxAmount: 0,
        finalTotal: 950.0,
        paymentMethod: 'Cash',
        amountReceived: 1000.0,
        changeGiven: 50.0,
        status: 'Completed',
        customerName: 'Rahim Uddin',
        customerPhone: '01711223344',
      },
      {
        id: 'sale-002',
        invoiceNumber: formatInv(yesterday, 2),
        saleDateTime: new Date(yesterday.setHours(14, 15, 0, 0)).toISOString(),
        items: [
          {
            id: 'si-003',
            productId: 'prod-002',
            productName: 'Pure Soybean Oil 5L',
            sku: 'GROC-002',
            category: 'Groceries',
            quantity: 1,
            unitPrice: 890.0,
            originalPrice: 890.0,
            isPriceOverridden: false,
            costPrice: 820.0,
            lineTotal: 890.0,
          },
          {
            id: 'si-004',
            productId: 'prod-008',
            productName: 'Black Tea Bags (100 Pcs)',
            sku: 'BEV-001',
            category: 'Beverages',
            quantity: 1,
            unitPrice: 380.0,
            originalPrice: 380.0,
            isPriceOverridden: false,
            costPrice: 310.0,
            lineTotal: 380.0,
          },
        ],
        itemCount: 2,
        totalQuantity: 2,
        subtotal: 1270.0,
        discountType: 'fixed',
        discountValue: 0,
        discountAmount: 0,
        taxAmount: 0,
        finalTotal: 1270.0,
        paymentMethod: 'bKash',
        amountReceived: 1270.0,
        changeGiven: 0,
        status: 'Completed',
        customerName: 'Farhana Ahmed',
      },
      {
        id: 'sale-003',
        invoiceNumber: formatInv(today, 1),
        saleDateTime: new Date(new Date().setHours(9, 45, 0, 0)).toISOString(),
        items: [
          {
            id: 'si-005',
            productId: 'prod-011',
            productName: 'Crispy Potato Chips Masala 50g',
            sku: 'SNK-001',
            category: 'Snacks & Bakery',
            quantity: 4,
            unitPrice: 35.0,
            originalPrice: 35.0,
            isPriceOverridden: false,
            costPrice: 26.0,
            lineTotal: 140.0,
          },
          {
            id: 'si-006',
            productId: 'prod-010',
            productName: 'Chilled Cola Pet Bottle 2L',
            sku: 'BEV-003',
            category: 'Beverages',
            quantity: 1,
            unitPrice: 110.0,
            originalPrice: 110.0,
            isPriceOverridden: false,
            costPrice: 85.0,
            lineTotal: 110.0,
          },
        ],
        itemCount: 2,
        totalQuantity: 5,
        subtotal: 250.0,
        discountType: 'fixed',
        discountValue: 0,
        discountAmount: 0,
        taxAmount: 0,
        finalTotal: 250.0,
        paymentMethod: 'Nagad',
        amountReceived: 300.0,
        changeGiven: 50.0,
        status: 'Completed',
        customerName: 'Tanvir Hasan',
      },
    ];

    localStorage.setItem(KEYS.SALES, JSON.stringify(initialSales));
    localStorage.setItem(KEYS.LAST_INVOICE_SEQ, '2');
  }

  // --- Products ---
  getProducts(): Product[] {
    try {
      const data = localStorage.getItem(KEYS.PRODUCTS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  saveProducts(products: Product[]): void {
    localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(products));
  }

  // --- Categories ---
  getCategories(): Category[] {
    try {
      const data = localStorage.getItem(KEYS.CATEGORIES);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  saveCategories(categories: Category[]): void {
    localStorage.setItem(KEYS.CATEGORIES, JSON.stringify(categories));
  }

  // --- Sales ---
  getSales(): Sale[] {
    try {
      const data = localStorage.getItem(KEYS.SALES);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  saveSales(sales: Sale[]): void {
    localStorage.setItem(KEYS.SALES, JSON.stringify(sales));
  }

  // --- Stock Movements ---
  getStockMovements(): StockMovement[] {
    try {
      const data = localStorage.getItem(KEYS.STOCK_MOVEMENTS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  saveStockMovements(movements: StockMovement[]): void {
    localStorage.setItem(KEYS.STOCK_MOVEMENTS, JSON.stringify(movements));
  }

  // --- Settings ---
  getSettings(): ShopSettings {
    try {
      const data = localStorage.getItem(KEYS.SETTINGS);
      if (data) {
        const parsed = JSON.parse(data);
        return { ...DEFAULT_SHOP_SETTINGS, ...parsed };
      }
      return DEFAULT_SHOP_SETTINGS;
    } catch {
      return DEFAULT_SHOP_SETTINGS;
    }
  }

  saveSettings(settings: ShopSettings): void {
    localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
  }

  getNextInvoiceNumber(): string {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    const prefix = `INV-${y}${m}${d}`;

    const sales = this.getSales();
    const todaySales = sales.filter((s) => s.invoiceNumber.startsWith(prefix));
    const nextSeq = todaySales.length + 1;

    return `${prefix}-${String(nextSeq).padStart(4, '0')}`;
  }

  // Reset to demo data
  resetAllToDefaults(): void {
    localStorage.removeItem(KEYS.PRODUCTS);
    localStorage.removeItem(KEYS.CATEGORIES);
    localStorage.removeItem(KEYS.SALES);
    localStorage.removeItem(KEYS.STOCK_MOVEMENTS);
    localStorage.removeItem(KEYS.SETTINGS);
    localStorage.removeItem(KEYS.LAST_INVOICE_SEQ);
    this.init();
  }
}

export const storage = new StorageEngine();
