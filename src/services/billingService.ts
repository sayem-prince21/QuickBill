import { storage } from './storage';
import { CheckoutRequest, Sale, SaleItem } from '../types/sale';
import { StockMovement } from '../types/stock';

export const billingService = {
  processCheckout(request: CheckoutRequest): Sale {
    if (!request.items || request.items.length === 0) {
      throw new Error('Cart is empty. Please add items to checkout.');
    }

    const products = storage.getProducts();
    const stockMovements = storage.getStockMovements();
    const sales = storage.getSales();
    const settings = storage.getSettings();

    // 1. Transaction validation: Verify all products exist, are active, and have sufficient stock
    for (const item of request.items) {
      if (item.quantity <= 0) {
        throw new Error('All item quantities must be greater than zero.');
      }

      const product = products.find((p) => p.id === item.productId);
      if (!product) {
        throw new Error(`Product with ID "${item.productId}" no longer exists.`);
      }

      if (!product.isActive) {
        throw new Error(`Product "${product.name}" is currently inactive.`);
      }

      if (product.currentStock < item.quantity) {
        throw new Error(
          `Insufficient stock for "${product.name}". Available: ${product.currentStock}, Requested: ${item.quantity}`
        );
      }
    }

    // 2. Build Sale Items with price snapshots
    let subtotal = 0;
    let totalQty = 0;
    const saleItems: SaleItem[] = [];
    const stockUpdates: { productIndex: number; previousStock: number; newStock: number; movement: StockMovement }[] = [];

    const now = new Date().toISOString();
    const invoiceNumber = storage.getNextInvoiceNumber();

    for (const reqItem of request.items) {
      const pIndex = products.findIndex((p) => p.id === reqItem.productId);
      const product = products[pIndex];

      const isPriceOverridden =
        reqItem.unitPriceOverride !== undefined &&
        reqItem.unitPriceOverride !== null &&
        reqItem.unitPriceOverride !== product.sellingPrice;

      const effectivePrice = isPriceOverridden
        ? Math.max(0, Number(reqItem.unitPriceOverride))
        : product.sellingPrice;

      const lineTotal = Number((effectivePrice * reqItem.quantity).toFixed(2));
      subtotal += lineTotal;
      totalQty += reqItem.quantity;

      const saleItem: SaleItem = {
        id: `si-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        productId: product.id,
        productName: product.name,
        sku: product.sku,
        category: product.category,
        quantity: reqItem.quantity,
        unitPrice: effectivePrice,
        originalPrice: product.sellingPrice,
        isPriceOverridden,
        costPrice: product.costPrice,
        lineTotal,
      };

      saleItems.push(saleItem);

      // Prepare atomic stock update
      const previousStock = product.currentStock;
      const newStock = previousStock - reqItem.quantity;

      const movement: StockMovement = {
        id: `sm-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        productId: product.id,
        productName: product.name,
        sku: product.sku,
        movementType: 'Sale',
        quantityChange: -reqItem.quantity,
        previousStock,
        newStock,
        reason: `Sold on invoice ${invoiceNumber}`,
        referenceId: invoiceNumber,
        timestamp: now,
      };

      stockUpdates.push({ productIndex: pIndex, previousStock, newStock, movement });
    }

    // 3. Compute discount
    let discountAmount = 0;
    const discType = request.discountType || 'fixed';
    const discVal = Math.max(0, Number(request.discountValue || 0));

    if (discType === 'percentage') {
      discountAmount = Number(((subtotal * discVal) / 100).toFixed(2));
    } else {
      discountAmount = Math.min(subtotal, discVal);
    }

    const taxableAmount = Math.max(0, subtotal - discountAmount);
    const taxRate = settings.defaultTaxRate || 0;
    const taxAmount = Number(((taxableAmount * taxRate) / 100).toFixed(2));
    const finalTotal = Number((taxableAmount + taxAmount).toFixed(2));

    const amountReceived = Math.max(finalTotal, Number(request.amountReceived || finalTotal));
    const changeGiven = Number(Math.max(0, amountReceived - finalTotal).toFixed(2));

    // 4. Atomically commit stock changes and stock movements
    for (const update of stockUpdates) {
      products[update.productIndex].currentStock = update.newStock;
      products[update.productIndex].updatedAt = now;
      stockMovements.unshift(update.movement);
    }

    // 5. Create Sale
    const newSale: Sale = {
      id: `sale-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      invoiceNumber,
      saleDateTime: now,
      items: saleItems,
      itemCount: saleItems.length,
      totalQuantity: totalQty,
      subtotal: Number(subtotal.toFixed(2)),
      discountType: discType,
      discountValue: discVal,
      discountAmount,
      taxAmount,
      finalTotal,
      paymentMethod: request.paymentMethod,
      amountReceived,
      changeGiven,
      status: 'Completed',
      customerName: request.customerName?.trim() || undefined,
      customerPhone: request.customerPhone?.trim() || undefined,
      notes: request.notes?.trim() || undefined,
    };

    sales.unshift(newSale);

    // Commit all state changes atomically
    storage.saveProducts(products);
    storage.saveStockMovements(stockMovements);
    storage.saveSales(sales);

    return newSale;
  },
};
