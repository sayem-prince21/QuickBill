import React from 'react';
import { Sale } from '../../types/sale';
import { useSettings } from '../../context/SettingsContext';
import { formatCurrency, formatDateTime } from '../../config/ui.config';
import { X, Printer, AlertOctagon, User, Phone, Calendar, Clock, CreditCard } from 'lucide-react';

interface SaleDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  sale: Sale | null;
  onReprintReceipt: (sale: Sale) => void;
  onOpenCancelModal: (sale: Sale) => void;
}

export const SaleDetailModal: React.FC<SaleDetailModalProps> = ({
  isOpen,
  onClose,
  sale,
  onReprintReceipt,
  onOpenCancelModal,
}) => {
  const { settings } = useSettings();

  if (!isOpen || !sale) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">{sale.invoiceNumber}</h3>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    sale.status === 'Cancelled'
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {sale.status}
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5 flex items-center gap-1.5">
                <Calendar className="w-3 h-3 text-slate-600" />
                <span>{formatDateTime(sale.saleDateTime)}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-600 hover:text-slate-600 hover:bg-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Cancellation Alert Banner */}
          {sale.status === 'Cancelled' && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2.5">
              <AlertOctagon className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              <div>
                <p className="font-bold">This sale was cancelled & voided</p>
                <p className="mt-0.5">
                  <span className="font-semibold">Reason:</span> {sale.cancelReason}
                </p>
                {sale.cancelledAt && (
                  <p className="text-[11px] text-rose-600 mt-0.5">
                    Cancelled at: {formatDateTime(sale.cancelledAt)} (Stock has been returned to inventory)
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Customer & Payment Meta Cards */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
              <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                Payment Info
              </span>
              <div className="flex items-center gap-1.5 font-bold text-slate-800">
                <CreditCard className="w-3.5 h-3.5 text-slate-600" />
                <span>{sale.paymentMethod}</span>
              </div>
              {sale.paymentMethod === 'Cash' && (
                <div className="text-[11px] text-slate-600 mt-1">
                  Received: {formatCurrency(sale.amountReceived, settings.currencySymbol)} | Change: {formatCurrency(sale.changeGiven, settings.currencySymbol)}
                </div>
              )}
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
              <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                Customer Details
              </span>
              <div className="flex items-center gap-1.5 font-medium text-slate-800">
                <User className="w-3.5 h-3.5 text-slate-600" />
                <span>{sale.customerName || 'Walk-in Customer'}</span>
              </div>
              {sale.customerPhone && (
                <div className="flex items-center gap-1 text-[11px] text-slate-600 mt-0.5">
                  <Phone className="w-3 h-3 text-slate-600" />
                  <span>{sale.customerPhone}</span>
                </div>
              )}
            </div>
          </div>

          {/* Line Items Table */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Purchased Items ({sale.items.length})
            </h4>
            <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-[11px] font-bold text-slate-600 border-b border-slate-200">
                  <tr>
                    <th className="py-2 px-3">Item</th>
                    <th className="py-2 px-3 text-center">Qty</th>
                    <th className="py-2 px-3 text-right">Sold Unit Price</th>
                    <th className="py-2 px-3 text-right">Line Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sale.items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-3">
                        <div className="font-semibold text-slate-900">{item.productName}</div>
                        <div className="text-[10px] text-slate-600 font-mono">
                          {item.sku} • {item.category}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-center font-bold text-slate-800">
                        {item.quantity}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <span>{formatCurrency(item.unitPrice, settings.currencySymbol)}</span>
                        {item.isPriceOverridden && (
                          <div className="text-[9px] text-amber-600 font-bold">
                            Override (Orig: {formatCurrency(item.originalPrice, settings.currencySymbol)})
                          </div>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                        {formatCurrency(item.lineTotal, settings.currencySymbol)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals Summary */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1.5 text-xs text-slate-600">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span className="font-semibold text-slate-800">
                {formatCurrency(sale.subtotal, settings.currencySymbol)}
              </span>
            </div>

            {sale.discountAmount > 0 && (
              <div className="flex justify-between text-rose-600 font-medium">
                <span>Discount:</span>
                <span>-{formatCurrency(sale.discountAmount, settings.currencySymbol)}</span>
              </div>
            )}

            {sale.taxAmount > 0 && (
              <div className="flex justify-between">
                <span>VAT / Tax:</span>
                <span>{formatCurrency(sale.taxAmount, settings.currencySymbol)}</span>
              </div>
            )}

            <div className="flex justify-between text-base font-extrabold text-slate-900 pt-1.5 border-t border-slate-200">
              <span>Final Total Paid:</span>
              <span className="text-emerald-700">
                {formatCurrency(sale.finalTotal, settings.currencySymbol)}
              </span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div>
            {sale.status === 'Completed' && (
              <button
                type="button"
                onClick={() => onOpenCancelModal(sale)}
                className="px-3.5 py-1.5 rounded-lg border border-rose-300 text-rose-700 hover:bg-rose-50 text-xs font-bold transition-colors flex items-center gap-1.5"
              >
                <AlertOctagon className="w-3.5 h-3.5" />
                <span>Cancel & Return Stock</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 text-xs font-bold hover:bg-slate-100"
            >
              Close
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                onReprintReceipt(sale);
              }}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" />
              <span>Reprint Receipt</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
