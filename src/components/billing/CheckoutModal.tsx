import React, { useState, useEffect } from 'react';
import { useCart } from '../../context/CartContext';
import { useSettings } from '../../context/SettingsContext';
import { billingService } from '../../services/billingService';
import { PaymentMethod, Sale } from '../../types/sale';
import { PAYMENT_METHODS, formatCurrency } from '../../config/ui.config';
import { X, CheckCircle, Banknote, User, Phone, FileText } from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (sale: Sale) => void;
  initialPaymentMethod?: PaymentMethod;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialPaymentMethod = 'Cash',
}) => {
  const { items, discountType, discountValue, finalTotal, clearCart } = useCart();
  const { settings } = useSettings();

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(initialPaymentMethod);
  const [amountReceived, setAmountReceived] = useState<number>(finalTotal);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setPaymentMethod(initialPaymentMethod);
      setAmountReceived(finalTotal);
      setError(null);
      setIsSubmitting(false);
    }
  }, [isOpen, initialPaymentMethod, finalTotal]);

  if (!isOpen) return null;

  const changeDue = Math.max(0, amountReceived - finalTotal);

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (items.length === 0) {
      setError('Cannot checkout with an empty cart.');
      return;
    }

    if (paymentMethod === 'Cash' && amountReceived < finalTotal) {
      setError(`Amount received cannot be less than the payable total (${formatCurrency(finalTotal, settings.currencySymbol)}).`);
      return;
    }

    setIsSubmitting(true);

    try {
      const sale = billingService.processCheckout({
        items: items.map((i) => ({
          productId: i.product.id,
          quantity: i.quantity,
          unitPriceOverride: i.unitPriceOverride,
        })),
        discountType,
        discountValue,
        paymentMethod,
        amountReceived: paymentMethod === 'Cash' ? amountReceived : finalTotal,
        customerName,
        customerPhone,
        notes,
      });

      clearCart();
      onSuccess(sale);
    } catch (err: any) {
      setError(err.message || 'Failed to complete transaction.');
      setIsSubmitting(false);
    }
  };

  const quickDenominations = [
    { label: 'Exact', value: finalTotal },
    { label: '+50', value: Math.ceil(finalTotal / 50) * 50 },
    { label: '+100', value: Math.ceil(finalTotal / 100) * 100 },
    { label: '+500', value: Math.ceil(finalTotal / 500) * 500 },
    { label: '+1000', value: Math.ceil(finalTotal / 1000) * 1000 },
  ].filter((d, index, self) => self.findIndex((o) => o.value === d.value) === index && d.value >= finalTotal);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Finalize & Pay</h3>
            <p className="text-xs text-slate-600">Select payment method and confirm total</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-600 hover:text-slate-600 hover:bg-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleCheckout} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
              {error}
            </div>
          )}

          {/* Big Amount Banner */}
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-between">
            <span className="text-sm font-semibold text-emerald-900">Total Payable:</span>
            <span className="text-2xl font-black text-emerald-700">
              {formatCurrency(finalTotal, settings.currencySymbol)}
            </span>
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Payment Method
            </label>
            <div className="grid grid-cols-2 gap-2">
              {PAYMENT_METHODS.map((pm) => {
                const isSelected = paymentMethod === pm.id;
                return (
                  <button
                    key={pm.id}
                    type="button"
                    onClick={() => {
                      setPaymentMethod(pm.id);
                      if (pm.id !== 'Cash') {
                        setAmountReceived(finalTotal);
                      }
                    }}
                    className={`py-2.5 px-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                      isSelected
                        ? 'border-emerald-600 ring-2 ring-emerald-500/20 bg-emerald-50/40 text-emerald-900 font-bold'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <span className="text-xs">{pm.name}</span>
                    {isSelected && <CheckCircle className="w-4 h-4 text-emerald-600" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cash Handling: Received and Change */}
          {paymentMethod === 'Cash' && (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Cash Received ({settings.currencySymbol})
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-600">
                    <Banknote className="w-4 h-4" />
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    min={finalTotal}
                    value={amountReceived}
                    onChange={(e) => setAmountReceived(parseFloat(e.target.value) || 0)}
                    className="w-full pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-lg text-lg font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Quick Chip Buttons */}
              <div className="flex flex-wrap gap-1.5">
                {quickDenominations.map((denom, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setAmountReceived(denom.value)}
                    className="px-2.5 py-1 text-xs font-semibold rounded-md bg-white border border-slate-200 hover:bg-slate-100 text-slate-700"
                  >
                    {denom.label} ({formatCurrency(denom.value, settings.currencySymbol)})
                  </button>
                ))}
              </div>

              {/* Change calculation */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                <span className="text-xs font-semibold text-slate-600">Change Due:</span>
                <span className="text-lg font-bold text-amber-600">
                  {formatCurrency(changeDue, settings.currencySymbol)}
                </span>
              </div>
            </div>
          )}

          {/* Optional Customer Details */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">
                Customer Name (Optional)
              </label>
              <div className="relative">
                <User className="w-3.5 h-3.5 text-slate-600 absolute left-2.5 top-2.5 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Walk-in Customer"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full pl-8 pr-2.5 py-1.5 border border-slate-200 rounded-lg text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">
                Customer Phone (Optional)
              </label>
              <div className="relative">
                <Phone className="w-3.5 h-3.5 text-slate-600 absolute left-2.5 top-2.5 pointer-events-none" />
                <input
                  type="text"
                  placeholder="017xxxxxxxx"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full pl-8 pr-2.5 py-1.5 border border-slate-200 rounded-lg text-xs"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-[11px] font-medium text-slate-600 mb-1">
              Bill Notes / Reference (Optional)
            </label>
            <div className="relative">
              <FileText className="w-3.5 h-3.5 text-slate-600 absolute left-2.5 top-2.5 pointer-events-none" />
              <input
                type="text"
                placeholder="e.g. Transaction TrxID, delivery note..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full pl-8 pr-2.5 py-1.5 border border-slate-200 rounded-lg text-xs"
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 text-xs font-bold hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:bg-slate-300 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5"
            >
              <CheckCircle className="w-4 h-4" />
              <span>{isSubmitting ? 'Processing...' : 'Complete & Print Invoice'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
