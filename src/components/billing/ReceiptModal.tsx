import React, { useRef, useState } from 'react';
import { Sale } from '../../types/sale';
import { useSettings } from '../../context/SettingsContext';
import { formatCurrency, formatDateTime } from '../../config/ui.config';
import { Printer, X, Check, Copy } from 'lucide-react';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  sale: Sale | null;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ isOpen, onClose, sale }) => {
  const { settings } = useSettings();
  const [copied, setCopied] = useState(false);
  const [printFormat, setPrintFormat] = useState<'80mm' | 'A4'>(
    settings.receiptPaperSize === 'A4' ? 'A4' : '80mm'
  );

  const receiptRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !sale) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyInvoiceNumber = () => {
    navigator.clipboard.writeText(sale.invoiceNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      {/* Non-printed modal wrapper */}
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 my-8">
        {/* Header Controls (Hidden during print) */}
        <div className="print:hidden px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-slate-800">Invoice Receipt</span>
            <span className="text-xs font-mono bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
              {sale.invoiceNumber}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Format toggle */}
            <div className="flex bg-slate-200 p-0.5 rounded-lg text-xs font-semibold">
              <button
                type="button"
                onClick={() => setPrintFormat('80mm')}
                className={`px-2 py-1 rounded-md transition-all ${
                  printFormat === '80mm' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                Thermal (80mm)
              </button>
              <button
                type="button"
                onClick={() => setPrintFormat('A4')}
                className={`px-2 py-1 rounded-md transition-all ${
                  printFormat === 'A4' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                A4 Standard
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-slate-600 hover:text-slate-600 hover:bg-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Receipt Area */}
        <div className="p-6 overflow-y-auto max-h-[70vh] bg-slate-100/60 flex justify-center">
          {/* THE RECEIPT CONTAINER (Formatted for Print) */}
          <div
            ref={receiptRef}
            id="printable-receipt"
            className={`bg-white p-6 shadow-sm border border-slate-200 text-slate-900 print:shadow-none print:border-none print:p-0 ${
              printFormat === '80mm'
                ? 'w-full max-w-[340px] text-xs font-mono'
                : 'w-full max-w-[460px] text-xs font-sans'
            }`}
          >
            {/* Store Branding */}
            <div className="text-center pb-3 border-b border-dashed border-slate-300">
              <h2 className="text-base font-extrabold uppercase tracking-wide text-slate-900">
                {settings.shopName}
              </h2>
              {settings.tagline && (
                <p className="text-[11px] text-slate-600 mt-0.5">{settings.tagline}</p>
              )}
              <p className="text-[10px] text-slate-600 mt-1">{settings.address}</p>
              <p className="text-[10px] text-slate-600">Tel: {settings.phone}</p>
              {settings.vatRegNumber && (
                <p className="text-[9px] text-slate-600 mt-0.5">{settings.vatRegNumber}</p>
              )}
            </div>

            {/* Invoice Meta */}
            <div className="py-2.5 border-b border-dashed border-slate-300 text-[11px] space-y-0.5">
              <div className="flex justify-between">
                <span className="text-slate-600">Invoice:</span>
                <span className="font-bold">{sale.invoiceNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Date/Time:</span>
                <span>{formatDateTime(sale.saleDateTime)}</span>
              </div>
              {sale.customerName && (
                <div className="flex justify-between">
                  <span className="text-slate-600">Customer:</span>
                  <span>{sale.customerName}</span>
                </div>
              )}
              {sale.customerPhone && (
                <div className="flex justify-between">
                  <span className="text-slate-600">Phone:</span>
                  <span>{sale.customerPhone}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-600">Payment:</span>
                <span className="font-bold">{sale.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Status:</span>
                <span
                  className={`font-bold ${
                    sale.status === 'Cancelled' ? 'text-rose-600' : 'text-emerald-700'
                  }`}
                >
                  {sale.status.toUpperCase()}
                </span>
              </div>
            </div>

            {/* Items Table */}
            <div className="py-2.5 border-b border-dashed border-slate-300">
              <div className="flex justify-between font-bold text-[10px] uppercase text-slate-600 pb-1 border-b border-slate-200">
                <span className="w-1/2">Item Description</span>
                <span className="w-1/6 text-center">Qty</span>
                <span className="w-1/6 text-right">Price</span>
                <span className="w-1/6 text-right">Total</span>
              </div>

              <div className="divide-y divide-slate-100 py-1 space-y-1">
                {sale.items.map((item, idx) => (
                  <div key={idx} className="pt-1 text-[11px]">
                    <div className="font-medium text-slate-800 line-clamp-1">{item.productName}</div>
                    <div className="flex justify-between text-[10px] text-slate-600">
                      <span className="text-slate-600 font-mono text-[9px]">{item.sku}</span>
                      <span className="w-1/6 text-center">{item.quantity}</span>
                      <span className="w-1/6 text-right">
                        {item.unitPrice.toFixed(2)}
                      </span>
                      <span className="w-1/6 text-right font-semibold text-slate-800">
                        {item.lineTotal.toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Calculations Breakdown */}
            <div className="py-2.5 border-b border-dashed border-slate-300 space-y-1 text-[11px]">
              <div className="flex justify-between">
                <span className="text-slate-600">Subtotal:</span>
                <span>{formatCurrency(sale.subtotal, settings.currencySymbol)}</span>
              </div>

              {sale.discountAmount > 0 && (
                <div className="flex justify-between text-rose-600">
                  <span>Discount:</span>
                  <span>-{formatCurrency(sale.discountAmount, settings.currencySymbol)}</span>
                </div>
              )}

              {sale.taxAmount > 0 && (
                <div className="flex justify-between">
                  <span>VAT ({settings.defaultTaxRate}%):</span>
                  <span>{formatCurrency(sale.taxAmount, settings.currencySymbol)}</span>
                </div>
              )}

              <div className="flex justify-between text-sm font-extrabold pt-1 border-t border-slate-200">
                <span>TOTAL:</span>
                <span>{formatCurrency(sale.finalTotal, settings.currencySymbol)}</span>
              </div>

              {sale.paymentMethod === 'Cash' && (
                <>
                  <div className="flex justify-between text-[10px] text-slate-600 pt-1">
                    <span>Cash Received:</span>
                    <span>{formatCurrency(sale.amountReceived, settings.currencySymbol)}</span>
                  </div>
                  <div className="flex justify-between text-[10px] font-bold text-slate-700">
                    <span>Change Returned:</span>
                    <span>{formatCurrency(sale.changeGiven, settings.currencySymbol)}</span>
                  </div>
                </>
              )}
            </div>

            {/* Footer Message */}
            <div className="text-center pt-3 text-[10px] text-slate-600 space-y-1">
              <p className="font-semibold">{settings.receiptHeader}</p>
              <p className="whitespace-pre-line text-[9px]">{settings.receiptFooter}</p>
              <p className="pt-2 text-[8px] text-slate-600 font-mono">
                System: QuickBilling v1.0 • Offline Desktop POS
              </p>
            </div>
          </div>
        </div>

        {/* Modal Bottom Actions (Hidden during print) */}
        <div className="print:hidden px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={handleCopyInvoiceNumber}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied Invoice #' : 'Copy Invoice #'}</span>
          </button>

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
              onClick={handlePrint}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              <span>Print Receipt</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
