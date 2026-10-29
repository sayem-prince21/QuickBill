import React, { useState } from 'react';
import { useCart } from '../../context/CartContext';
import { useSettings } from '../../context/SettingsContext';
import { formatCurrency, PAYMENT_METHODS } from '../../config/ui.config';
import { PaymentMethod } from '../../types/sale';
import {
  Trash2,
  Plus,
  Minus,
  Edit2,
  Tag,
  ShoppingBag,
  ArrowRight,
  Check,
  Percent,
} from 'lucide-react';

interface CartPanelProps {
  onOpenCheckout: (preselectedPayment?: PaymentMethod) => void;
}

export const CartPanel: React.FC<CartPanelProps> = ({ onOpenCheckout }) => {
  const {
    items,
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
    itemCount,
  } = useCart();

  const { settings } = useSettings();
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [tempPriceInput, setTempPriceInput] = useState<string>('');
  const [showDiscountBox, setShowDiscountBox] = useState(false);

  const startEditPrice = (productId: string, currentPrice: number) => {
    setEditingPriceId(productId);
    setTempPriceInput(String(currentPrice));
  };

  const saveEditPrice = (productId: string) => {
    const val = parseFloat(tempPriceInput);
    if (!isNaN(val) && val >= 0) {
      updatePriceOverride(productId, val);
    }
    setEditingPriceId(null);
  };

  const cancelEditPrice = (productId: string) => {
    updatePriceOverride(productId, undefined);
    setEditingPriceId(null);
  };

  return (
    <div className="flex flex-col h-full bg-white border-l border-slate-200 shadow-xs">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-600 text-white">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">Current Order</h2>
            <p className="text-xs text-slate-600">
              {itemCount} {itemCount === 1 ? 'line item' : 'line items'}
            </p>
          </div>
        </div>

        {items.length > 0 && (
          <button
            onClick={() => {
              if (window.confirm('Clear all items from the current cart?')) {
                clearCart();
              }
            }}
            className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2 py-1 rounded transition-colors"
          >
            Clear Cart
          </button>
        )}
      </div>

      {/* Cart Items List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 divide-y divide-slate-100">
        {items.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-600">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-3">
              <ShoppingBag className="w-8 h-8 text-slate-600" />
            </div>
            <p className="text-sm font-semibold text-slate-700">Your cart is empty</p>
            <p className="text-xs text-slate-600 mt-1 max-w-[200px]">
              Click or scan any product card on the left to start billing.
            </p>
          </div>
        ) : (
          items.map((item) => (
            <div key={item.product.id} className="pt-2 first:pt-0">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-xs font-bold text-slate-900 truncate">
                      {item.product.name}
                    </h4>
                    {item.unitPriceOverride !== undefined && (
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800">
                        Price Override
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-slate-600 mt-0.5">
                    <span className="font-mono">{item.product.sku}</span>
                    <span>•</span>
                    {/* Price edit trigger */}
                    {editingPriceId === item.product.id ? (
                      <div className="flex items-center gap-1">
                        <span className="text-xs">{settings.currencySymbol}</span>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={tempPriceInput}
                          onChange={(e) => setTempPriceInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveEditPrice(item.product.id);
                            if (e.key === 'Escape') setEditingPriceId(null);
                          }}
                          className="w-16 px-1.5 py-0.5 border border-emerald-500 rounded text-xs font-bold bg-white"
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={() => saveEditPrice(item.product.id)}
                          className="p-1 rounded bg-emerald-600 text-white hover:bg-emerald-700"
                          title="Save price override"
                        >
                          <Check className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => cancelEditPrice(item.product.id)}
                          className="text-[10px] text-slate-600 hover:underline"
                        >
                          Reset
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => startEditPrice(item.product.id, item.effectiveUnitPrice)}
                        className="inline-flex items-center gap-1 text-slate-600 hover:text-emerald-700 group hover:underline"
                        title="Click to override price for this sale only"
                      >
                        <span>{formatCurrency(item.effectiveUnitPrice, settings.currencySymbol)}</span>
                        <Edit2 className="w-2.5 h-2.5 opacity-60 group-hover:opacity-100" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-bold text-slate-900">
                    {formatCurrency(item.lineTotal, settings.currencySymbol)}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(item.product.id)}
                    aria-label={`Remove ${item.product.name} from cart`}
                    className="text-slate-600 hover:text-rose-600 p-1 mt-0.5 inline-block"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Quantity Controls */}
              <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-50">
                <span className="text-[11px] text-slate-600 font-medium">
                  Avail: {item.product.currentStock}
                </span>

                <div className="flex items-center border border-slate-200 rounded-md bg-slate-50 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                    aria-label={`Decrease quantity of ${item.product.name}`}
                    className="p-1.5 hover:bg-slate-200 text-slate-600 active:bg-slate-300 transition-colors"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <input
                    type="number"
                    min="1"
                    max={item.product.currentStock}
                    value={item.quantity}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      if (!isNaN(val)) updateQuantity(item.product.id, val);
                    }}
                    className="w-10 text-center text-xs font-bold bg-white border-x border-slate-200 py-1"
                  />
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                    disabled={item.quantity >= item.product.currentStock}
                    aria-label={`Increase quantity of ${item.product.name}`}
                    className="p-1.5 hover:bg-slate-200 text-slate-600 active:bg-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Summary and Checkout Footer */}
      <div className="p-4 border-t border-slate-200 bg-slate-50">
        {/* Discount Toggle & Box */}
        <div className="mb-3">
          <div className="flex items-center justify-between text-xs mb-1">
            <button
              type="button"
              onClick={() => setShowDiscountBox(!showDiscountBox)}
              className="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-800 font-semibold"
            >
              <Tag className="w-3.5 h-3.5" />
              {discountAmount > 0 ? 'Edit Discount' : '+ Add Discount'}
            </button>
            {discountAmount > 0 && (
              <span className="text-xs font-bold text-rose-600">
                -{formatCurrency(discountAmount, settings.currencySymbol)}
              </span>
            )}
          </div>

          {showDiscountBox && (
            <div className="p-2.5 bg-white border border-slate-200 rounded-lg shadow-xs flex items-center gap-2 mt-2">
              <div className="flex border border-slate-300 rounded overflow-hidden text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setDiscount('fixed', discountValue)}
                  className={`px-2 py-1 ${
                    discountType === 'fixed'
                      ? 'bg-slate-800 text-white'
                      : 'bg-white text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {settings.currencySymbol}
                </button>
                <button
                  type="button"
                  onClick={() => setDiscount('percentage', discountValue)}
                  className={`px-2 py-1 flex items-center ${
                    discountType === 'percentage'
                      ? 'bg-slate-800 text-white'
                      : 'bg-white text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Percent className="w-3 h-3" />
                </button>
              </div>

              <input
                type="number"
                min="0"
                step={discountType === 'percentage' ? '1' : '5'}
                value={discountValue || ''}
                placeholder="0"
                onChange={(e) => setDiscount(discountType, parseFloat(e.target.value) || 0)}
                className="flex-1 px-2 py-1 border border-slate-300 rounded text-xs font-bold"
              />

              <button
                type="button"
                onClick={() => setShowDiscountBox(false)}
                className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded"
              >
                Done
              </button>
            </div>
          )}
        </div>

        {/* Calculation Lines */}
        <div className="space-y-1.5 text-xs text-slate-600 pb-3 border-b border-slate-200">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span className="font-semibold text-slate-900">
              {formatCurrency(subtotal, settings.currencySymbol)}
            </span>
          </div>

          {discountAmount > 0 && (
            <div className="flex justify-between text-rose-600">
              <span>Discount {discountType === 'percentage' && `(${discountValue}%)`}</span>
              <span>-{formatCurrency(discountAmount, settings.currencySymbol)}</span>
            </div>
          )}

          {taxAmount > 0 && (
            <div className="flex justify-between">
              <span>VAT / Tax ({settings.defaultTaxRate}%)</span>
              <span className="font-semibold text-slate-900">
                {formatCurrency(taxAmount, settings.currencySymbol)}
              </span>
            </div>
          )}

          <div className="flex justify-between text-base font-extrabold text-slate-900 pt-1.5 border-t border-slate-200">
            <span>Payable Total</span>
            <span className="text-emerald-700 text-lg">
              {formatCurrency(finalTotal, settings.currencySymbol)}
            </span>
          </div>
        </div>

        {/* Quick Payment Buttons */}
        <div className="mt-3 grid grid-cols-2 gap-2">
          {PAYMENT_METHODS.map((pm) => (
            <button
              key={pm.id}
              type="button"
              disabled={items.length === 0}
              onClick={() => onOpenCheckout(pm.id)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:border-emerald-500 hover:bg-emerald-50/50 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-left flex items-center justify-between"
            >
              <span className="text-xs font-semibold text-slate-800">{pm.id}</span>
              <span className="text-[10px] text-slate-600">Pay</span>
            </button>
          ))}
        </div>

        {/* Big Complete Checkout Button */}
        <button
          type="button"
          disabled={items.length === 0}
          onClick={() => onOpenCheckout()}
          className="mt-3 w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-sm"
        >
          <span>Charge {formatCurrency(finalTotal, settings.currencySymbol)}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
