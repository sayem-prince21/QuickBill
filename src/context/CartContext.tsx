import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '../types/product';
import { CartItem } from '../types/sale';
import { useSettings } from './SettingsContext';

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product) => { success: boolean; message?: string };
  updateQuantity: (productId: string, newQty: number) => { success: boolean; message?: string };
  updatePriceOverride: (productId: string, overridePrice: number | undefined) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  discountType: 'fixed' | 'percentage';
  discountValue: number;
  setDiscount: (type: 'fixed' | 'percentage', value: number) => void;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  finalTotal: number;
  totalQuantity: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [discountType, setDiscountType] = useState<'fixed' | 'percentage'>('fixed');
  const [discountValue, setDiscountValue] = useState<number>(0);
  const { settings } = useSettings();

  const addItem = (product: Product): { success: boolean; message?: string } => {
    if (!product.isActive) {
      return { success: false, message: `"${product.name}" is marked inactive.` };
    }

    if (product.currentStock <= 0) {
      return { success: false, message: `"${product.name}" is OUT OF STOCK!` };
    }

    const existingIndex = items.findIndex((i) => i.product.id === product.id);

    if (existingIndex > -1) {
      const currentQty = items[existingIndex].quantity;
      if (currentQty + 1 > product.currentStock) {
        return {
          success: false,
          message: `Cannot add more. Available stock limit is ${product.currentStock}.`,
        };
      }

      setItems((prev) => {
        const next = [...prev];
        const item = next[existingIndex];
        const nextQty = item.quantity + 1;
        const lineTotal = Number((item.effectiveUnitPrice * nextQty).toFixed(2));
        next[existingIndex] = {
          ...item,
          quantity: nextQty,
          lineTotal,
        };
        return next;
      });
      return { success: true };
    } else {
      const lineTotal = Number(product.sellingPrice.toFixed(2));
      const newItem: CartItem = {
        product: {
          id: product.id,
          name: product.name,
          sku: product.sku,
          category: product.category,
          sellingPrice: product.sellingPrice,
          currentStock: product.currentStock,
          imageUrl: product.imageUrl,
        },
        quantity: 1,
        effectiveUnitPrice: product.sellingPrice,
        lineTotal,
      };
      setItems((prev) => [newItem, ...prev]);
      return { success: true };
    }
  };

  const updateQuantity = (productId: string, newQty: number): { success: boolean; message?: string } => {
    if (newQty <= 0) {
      removeItem(productId);
      return { success: true };
    }

    const item = items.find((i) => i.product.id === productId);
    if (!item) return { success: false, message: 'Item not in cart' };

    if (newQty > item.product.currentStock) {
      return {
        success: false,
        message: `Maximum stock available for "${item.product.name}" is ${item.product.currentStock}.`,
      };
    }

    setItems((prev) =>
      prev.map((i) => {
        if (i.product.id !== productId) return i;
        const lineTotal = Number((i.effectiveUnitPrice * newQty).toFixed(2));
        return {
          ...i,
          quantity: newQty,
          lineTotal,
        };
      })
    );

    return { success: true };
  };

  const updatePriceOverride = (productId: string, overridePrice: number | undefined) => {
    setItems((prev) =>
      prev.map((i) => {
        if (i.product.id !== productId) return i;

        const effective =
          overridePrice !== undefined && overridePrice !== null && !isNaN(overridePrice)
            ? Math.max(0, Number(overridePrice))
            : i.product.sellingPrice;

        return {
          ...i,
          unitPriceOverride: overridePrice !== undefined && !isNaN(overridePrice) ? overridePrice : undefined,
          effectiveUnitPrice: effective,
          lineTotal: Number((effective * i.quantity).toFixed(2)),
        };
      })
    );
  };

  const removeItem = (productId: string) => {
    setItems((prev) => prev.filter((i) => i.product.id !== productId));
  };

  const clearCart = () => {
    setItems([]);
    setDiscountValue(0);
    setDiscountType('fixed');
  };

  const setDiscount = (type: 'fixed' | 'percentage', value: number) => {
    setDiscountType(type);
    setDiscountValue(Math.max(0, value));
  };

  // Calculations
  const subtotal = Number(items.reduce((acc, i) => acc + i.lineTotal, 0).toFixed(2));

  let discountAmount = 0;
  if (discountType === 'percentage') {
    discountAmount = Number(((subtotal * discountValue) / 100).toFixed(2));
  } else {
    discountAmount = Math.min(subtotal, Number(discountValue || 0));
  }

  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const taxRate = settings.defaultTaxRate || 0;
  const taxAmount = Number(((taxableAmount * taxRate) / 100).toFixed(2));
  const finalTotal = Number((taxableAmount + taxAmount).toFixed(2));

  const totalQuantity = items.reduce((acc, i) => acc + i.quantity, 0);
  const itemCount = items.length;

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        updateQuantity,
        updatePriceOverride,
        removeItem,
        clearCart,
        discountType,
        discountValue,
        setDiscount,
        subtotal,
        discountAmount,
        taxAmount,
        finalTotal,
        totalQuantity,
        itemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
