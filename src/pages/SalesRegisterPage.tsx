import React, { useState, useEffect } from 'react';
import { Sale, PaymentMethod, SaleStatus } from '../types/sale';
import { salesService } from '../services/salesService';
import { useSettings } from '../context/SettingsContext';
import { formatCurrency, formatDateTime } from '../config/ui.config';
import { SaleDetailModal } from '../components/sales/SaleDetailModal';
import { CancelSaleModal } from '../components/sales/CancelSaleModal';
import { ReceiptModal } from '../components/billing/ReceiptModal';
import { Search, Calendar, Filter, Printer, Eye, AlertOctagon } from 'lucide-react';

export const SalesRegisterPage: React.FC = () => {
  const { settings } = useSettings();
  const [sales, setSales] = useState<Sale[]>([]);
  const [searchInvoice, setSearchInvoice] = useState('');
  const [paymentFilter, setPaymentFilter] = useState<PaymentMethod | 'All'>('All');
  const [statusFilter, setStatusFilter] = useState<SaleStatus | 'All'>('All');
  const [dateFilterPreset, setDateFilterPreset] = useState<'all' | 'today' | 'yesterday' | 'week' | 'month' | 'custom'>('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  const loadSales = () => {
    let startDate: string | undefined;
    let endDate: string | undefined;

    const today = new Date();
    const toIsoDate = (d: Date) => d.toISOString().split('T')[0];

    if (dateFilterPreset === 'today') {
      startDate = toIsoDate(today);
      endDate = toIsoDate(today);
    } else if (dateFilterPreset === 'yesterday') {
      const y = new Date(Date.now() - 86400000);
      startDate = toIsoDate(y);
      endDate = toIsoDate(y);
    } else if (dateFilterPreset === 'week') {
      const w = new Date(Date.now() - 7 * 86400000);
      startDate = toIsoDate(w);
      endDate = toIsoDate(today);
    } else if (dateFilterPreset === 'month') {
      const m = new Date(today.getFullYear(), today.getMonth(), 1);
      startDate = toIsoDate(m);
      endDate = toIsoDate(today);
    } else if (dateFilterPreset === 'custom') {
      startDate = customStartDate || undefined;
      endDate = customEndDate || undefined;
    }

    const data = salesService.getAll({
      invoiceNumber: searchInvoice,
      paymentMethod: paymentFilter,
      status: statusFilter,
      startDate,
      endDate,
    });
    setSales(data);
  };

  useEffect(() => {
    loadSales();
  }, [searchInvoice, paymentFilter, statusFilter, dateFilterPreset, customStartDate, customEndDate]);

  // Aggregate stats from current filtered list
  const totalCompletedAmount = sales
    .filter((s) => s.status === 'Completed')
    .reduce((acc, s) => acc + s.finalTotal, 0);

  const completedCount = sales.filter((s) => s.status === 'Completed').length;
  const cancelledCount = sales.filter((s) => s.status === 'Cancelled').length;

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-slate-50">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Sales Register</h1>
          <p className="text-xs text-slate-600">
            Audit history of all invoices generated on this terminal with reprint and void options
          </p>
        </div>

        {/* Quick KPI badges */}
        <div className="flex items-center gap-3 text-xs">
          <div className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl shadow-xs">
            <span className="text-slate-600">Filtered Total:</span>{' '}
            <span className="font-extrabold text-emerald-700">
              {formatCurrency(totalCompletedAmount, settings.currencySymbol)}
            </span>
          </div>
          <div className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl shadow-xs">
            <span className="text-slate-600">Completed:</span>{' '}
            <span className="font-bold text-slate-900">{completedCount}</span>
          </div>
          {cancelledCount > 0 && (
            <div className="px-3 py-1.5 bg-rose-50 border border-rose-200 rounded-xl shadow-xs text-rose-800">
              <span>Voided/Cancelled:</span>{' '}
              <span className="font-bold">{cancelledCount}</span>
            </div>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Invoice search */}
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-600 absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by invoice number (e.g. INV-2026...)..."
              value={searchInvoice}
              onChange={(e) => setSearchInvoice(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>

          {/* Payment filter */}
          <div className="md:col-span-3">
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            >
              <option value="All">All Payment Methods</option>
              <option value="Cash">Cash (নগদ)</option>
              <option value="bKash">bKash (বিকাশ)</option>
              <option value="Nagad">Nagad (নগদ)</option>
              <option value="Other MFS">Other MFS</option>
            </select>
          </div>

          {/* Status filter */}
          <div className="md:col-span-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            >
              <option value="All">All Statuses (Active & Cancelled)</option>
              <option value="Completed">Completed Only</option>
              <option value="Cancelled">Cancelled Only</option>
            </select>
          </div>
        </div>

        {/* Date presets */}
        <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-slate-100 text-xs">
          <span className="text-slate-600 font-semibold mr-1">Period:</span>
          {(['all', 'today', 'yesterday', 'week', 'month', 'custom'] as const).map((preset) => (
            <button
              key={preset}
              onClick={() => setDateFilterPreset(preset)}
              className={`px-3 py-1 rounded-lg font-bold capitalize transition-all ${
                dateFilterPreset === preset
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {preset === 'week' ? 'Last 7 Days' : preset === 'month' ? 'This Month' : preset}
            </button>
          ))}

          {dateFilterPreset === 'custom' && (
            <div className="flex items-center gap-2 ml-2">
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="px-2 py-1 bg-white border border-slate-300 rounded-md text-xs"
              />
              <span className="text-slate-600">to</span>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="px-2 py-1 bg-white border border-slate-300 rounded-md text-xs"
              />
            </div>
          )}
        </div>
      </div>

      {/* Sales Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-[11px] font-bold text-slate-600 border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4 text-center">Items</th>
                <th className="py-3 px-4 text-right">Subtotal</th>
                <th className="py-3 px-4 text-right">Discount</th>
                <th className="py-3 px-4 text-right">Total Amount</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sales.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-600">
                    No sales invoices found matching the current filters.
                  </td>
                </tr>
              ) : (
                sales.map((sale) => (
                  <tr
                    key={sale.id}
                    className={`hover:bg-slate-50/70 transition-colors ${
                      sale.status === 'Cancelled' ? 'bg-rose-50/30' : ''
                    }`}
                  >
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {sale.invoiceNumber}
                    </td>

                    <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                      {formatDateTime(sale.saleDateTime)}
                    </td>

                    <td className="py-3 px-4 text-slate-700">
                      {sale.customerName || 'Walk-in'}
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-800">{sale.paymentMethod}</span>
                    </td>

                    <td className="py-3 px-4 text-center text-slate-700 font-medium">
                      {sale.itemCount} ({sale.totalQuantity} pcs)
                    </td>

                    <td className="py-3 px-4 text-right text-slate-600">
                      {formatCurrency(sale.subtotal, settings.currencySymbol)}
                    </td>

                    <td className="py-3 px-4 text-right text-rose-600">
                      {sale.discountAmount > 0
                        ? `-${formatCurrency(sale.discountAmount, settings.currencySymbol)}`
                        : '-'}
                    </td>

                    <td className="py-3 px-4 text-right font-black text-slate-900 text-sm">
                      {formatCurrency(sale.finalTotal, settings.currencySymbol)}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          sale.status === 'Cancelled'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {sale.status}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right whitespace-nowrap space-x-1.5">
                      <button
                        onClick={() => {
                          setSelectedSale(sale);
                          setIsDetailOpen(true);
                        }}
                        className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 hover:text-emerald-700 transition-colors inline-block"
                        title="View Sale Details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => {
                          setSelectedSale(sale);
                          setIsReceiptOpen(true);
                        }}
                        className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 hover:text-emerald-700 transition-colors inline-block"
                        title="Reprint Receipt"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>

                      {sale.status === 'Completed' && (
                        <button
                          onClick={() => {
                            setSelectedSale(sale);
                            setIsCancelOpen(true);
                          }}
                          className="p-1.5 rounded-lg border border-slate-200 hover:bg-rose-50 text-slate-600 hover:text-rose-600 transition-colors inline-block"
                          title="Cancel Sale & Void"
                        >
                          <AlertOctagon className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <SaleDetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        sale={selectedSale}
        onReprintReceipt={(s) => {
          setSelectedSale(s);
          setIsReceiptOpen(true);
        }}
        onOpenCancelModal={(s) => {
          setIsDetailOpen(false);
          setSelectedSale(s);
          setIsCancelOpen(true);
        }}
      />

      <CancelSaleModal
        isOpen={isCancelOpen}
        onClose={() => setIsCancelOpen(false)}
        sale={selectedSale}
        onSuccess={() => {
          loadSales();
        }}
      />

      <ReceiptModal
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        sale={selectedSale}
      />
    </div>
  );
};
