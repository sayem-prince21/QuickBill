import { storage } from './storage';
import { StockAdjustmentRequest, StockMovement } from '../types/stock';
import { Product } from '../types/product';

export const stockService = {
  adjustStock(request: StockAdjustmentRequest): Product {
    const { productId, adjustmentType, quantity, reason } = request;

    if (quantity <= 0 && adjustmentType !== 'set') {
      throw new Error('Adjustment quantity must be greater than zero.');
    }

    const cleanReason = reason.trim();
    if (!cleanReason) {
      throw new Error('A reason is required for manual stock adjustments.');
    }

    const products = storage.getProducts();
    const index = products.findIndex((p) => p.id === productId);
    if (index === -1) {
      throw new Error('Product not found.');
    }

    const product = products[index];
    const previousStock = product.currentStock;
    let newStock = previousStock;
    let quantityChange = 0;

    if (adjustmentType === 'add') {
      newStock = previousStock + quantity;
      quantityChange = quantity;
    } else if (adjustmentType === 'subtract') {
      if (previousStock < quantity) {
        throw new Error(
          `Cannot reduce stock by ${quantity}. Current stock is only ${previousStock}. Negative stock is not allowed.`
        );
      }
      newStock = previousStock - quantity;
      quantityChange = -quantity;
    } else if (adjustmentType === 'set') {
      if (quantity < 0) {
        throw new Error('Stock cannot be set to a negative number.');
      }
      newStock = quantity;
      quantityChange = newStock - previousStock;
    }

    const now = new Date().toISOString();
    product.currentStock = newStock;
    product.updatedAt = now;
    products[index] = product;

    // Log movement
    const stockMovements = storage.getStockMovements();
    const movement: StockMovement = {
      id: `sm-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      productId: product.id,
      productName: product.name,
      sku: product.sku,
      movementType: 'ManualAdjustment',
      quantityChange,
      previousStock,
      newStock,
      reason: cleanReason,
      timestamp: now,
    };
    stockMovements.unshift(movement);

    storage.saveProducts(products);
    storage.saveStockMovements(stockMovements);

    return product;
  },

  getMovements(productId?: string): StockMovement[] {
    const movements = storage.getStockMovements();
    if (productId) {
      return movements.filter((m) => m.productId === productId);
    }
    return movements;
  },

  getLowStockProducts(): Product[] {
    const products = storage.getProducts();
    return products.filter((p) => p.isActive && p.currentStock <= p.lowStockThreshold);
  },
};
