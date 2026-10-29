import { storage } from './storage';
import { Sale } from '../types/sale';
import { SalesFilter } from '../types/reports';
import { StockMovement } from '../types/stock';

export const salesService = {
  getAll(filter?: SalesFilter): Sale[] {
    let sales = storage.getSales();

    if (!filter) return sales;

    if (filter.startDate) {
      const start = new Date(filter.startDate).setHours(0, 0, 0, 0);
      sales = sales.filter((s) => new Date(s.saleDateTime).getTime() >= start);
    }

    if (filter.endDate) {
      const end = new Date(filter.endDate).setHours(23, 59, 59, 999);
      sales = sales.filter((s) => new Date(s.saleDateTime).getTime() <= end);
    }

    if (filter.invoiceNumber && filter.invoiceNumber.trim()) {
      const q = filter.invoiceNumber.trim().toLowerCase();
      sales = sales.filter((s) => s.invoiceNumber.toLowerCase().includes(q));
    }

    if (filter.paymentMethod && filter.paymentMethod !== 'All') {
      sales = sales.filter((s) => s.paymentMethod === filter.paymentMethod);
    }

    if (filter.status && filter.status !== 'All') {
      sales = sales.filter((s) => s.status === filter.status);
    }

    return sales;
  },

  getById(id: string): Sale | undefined {
    return storage.getSales().find((s) => s.id === id);
  },

  getByInvoiceNumber(invoiceNumber: string): Sale | undefined {
    return storage.getSales().find(
      (s) => s.invoiceNumber.toLowerCase() === invoiceNumber.trim().toLowerCase()
    );
  },

  /**
   * Cancels a sale and restores stock atomically.
   * Business rule: only 'Completed' sales can be cancelled, stock restored strictly once!
   */
  cancelSale(saleId: string, reason: string): Sale {
    const cleanReason = reason.trim();
    if (!cleanReason) {
      throw new Error('A cancellation reason is required for auditing purposes.');
    }

    const sales = storage.getSales();
    const saleIndex = sales.findIndex((s) => s.id === saleId);
    if (saleIndex === -1) {
      throw new Error('Sale not found.');
    }

    const sale = sales[saleIndex];
    if (sale.status === 'Cancelled') {
      throw new Error(`Sale ${sale.invoiceNumber} is already cancelled. Stock was already restored.`);
    }

    const products = storage.getProducts();
    const stockMovements = storage.getStockMovements();
    const now = new Date().toISOString();

    // Restore stock for all items
    for (const item of sale.items) {
      const pIndex = products.findIndex((p) => p.id === item.productId);
      if (pIndex !== -1) {
        const prod = products[pIndex];
        const previousStock = prod.currentStock;
        const newStock = previousStock + item.quantity;
        prod.currentStock = newStock;
        prod.updatedAt = now;

        const movement: StockMovement = {
          id: `sm-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          productId: prod.id,
          productName: prod.name,
          sku: prod.sku,
          movementType: 'SaleCancellation',
          quantityChange: item.quantity,
          previousStock,
          newStock,
          reason: `Cancelled bill ${sale.invoiceNumber}: ${cleanReason}`,
          referenceId: sale.invoiceNumber,
          timestamp: now,
        };
        stockMovements.unshift(movement);
      }
    }

    // Mark sale as cancelled
    const updatedSale: Sale = {
      ...sale,
      status: 'Cancelled',
      cancelledAt: now,
      cancelReason: cleanReason,
    };

    sales[saleIndex] = updatedSale;

    // Commit changes atomically
    storage.saveProducts(products);
    storage.saveStockMovements(stockMovements);
    storage.saveSales(sales);

    return updatedSale;
  },
};
