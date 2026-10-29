import React, { useState, useEffect } from 'react';
import { DashboardMetrics } from '../types/reports';
import { Sale } from '../types/sale';
import { reportsService } from '../services/reportsService';
import { useSettings } from '../context/SettingsContext';
import { formatCurrency, formatDateTime } from '../config/ui.config';
import { SaleDetailModal } from '../components/sales/SaleDetailModal';
import { CancelSaleModal } from '../components/sales/CancelSaleModal';
import { ReceiptModal } from '../components/billing/ReceiptModal';
import {
  TrendingUp,
  Receipt,
  Scale,
  AlertTriangle,
  ArrowRight,
  ShoppingCart,
  PlusCircle,
  FileSpreadsheet,
  Boxes,
} from 'lucide-react';
import { AppPage } from '../components/layout/Sidebar';
import { excelService } from '../services/excelService';

interface DashboardPageProps {
  onNavigate: (page: AppPage) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const { settings } = useSettings();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  const loadMetrics = () => {
    setMetrics(reportsService.getDashboardMetrics());
  };

  useEffect(() => {
    loadMetrics();
  }, []);

  if (!metrics) return null;

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50">
      {/* Quick Action Bar */}
      <div className="flex items-center justify-between flex-wrap gap-3 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Today's Overview</h1>
          <p className="text-xs text-slate-600">
            Real-time financial and inventory data from your local offline database
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('pos')}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-2 transition-all"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Open POS Terminal</span>
          </button>
          <button
            onClick={() => onNavigate('products')}
            className="px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold text-xs rounded-xl flex items-center gap-1.5 transition-all"
          >
            <PlusCircle className="w-4 h-4 text-emerald-600" />
            <span>Add Product</span>
          </button>
          <button
            onClick={() => excelService.exportCompleteReport()}
            className="px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold text-xs rounded-xl flex items-center gap-1.5 transition-all"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Export Excel</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Today Completed Sales */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              Today's Revenue
            </span>
            <h3 className="text-2xl font-black text-slate-900 mt-1">
              {formatCurrency(metrics.todaySalesTotal, settings.currencySymbol)}
            </h3>
            <span className="text-[11px] font-medium text-emerald-600 mt-0.5 inline-block">
              Excludes cancelled sales
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* Bill Count */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              Completed Bills
            </span>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{metrics.todayBillCount}</h3>
            <span className="text-[11px] font-medium text-slate-600 mt-0.5 inline-block">
              Invoices generated today
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Receipt className="w-6 h-6" />
          </div>
        </div>

        {/* Average Bill Value */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              Avg Ticket Size
            </span>
            <h3 className="text-2xl font-black text-slate-900 mt-1">
              {formatCurrency(metrics.todayAverageBill, settings.currencySymbol)}
            </h3>
            <span className="text-[11px] font-medium text-slate-600 mt-0.5 inline-block">
              Per completed bill
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Scale className="w-6 h-6" />
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div
          onClick={() => onNavigate('inventory')}
          className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between cursor-pointer hover:border-amber-400 transition-all group"
        >
          <div>
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              Low Stock Alert
            </span>
            <h3
              className={`text-2xl font-black mt-1 ${
                metrics.lowStockCount > 0 ? 'text-amber-600' : 'text-slate-800'
              }`}
            >
              {metrics.lowStockCount} items
            </h3>
            <span className="text-[11px] font-medium text-amber-600 group-hover:underline mt-0.5 inline-flex items-center gap-1">
              Manage inventory <ArrowRight className="w-3 h-3" />
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Grid: Payment Method Breakdown & Top Sellers */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Today Payment Breakdown */}
        <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Today's Payment Methods</h3>
              <button
                onClick={() => onNavigate('payments')}
                className="text-xs font-semibold text-emerald-700 hover:underline"
              >
                View Full Summary
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {(['Cash', 'bKash', 'Nagad', 'Other MFS'] as const).map((method) => {
                const total = metrics.todaySalesByPayment[method] || 0;
                const count = metrics.todayBillsByPayment[method] || 0;
                const pct =
                  metrics.todaySalesTotal > 0
                    ? ((total / metrics.todaySalesTotal) * 100).toFixed(0)
                    : 0;

                const colorBg =
                  method === 'Cash'
                    ? 'bg-emerald-500'
                    : method === 'bKash'
                    ? 'bg-pink-500'
                    : method === 'Nagad'
                    ? 'bg-amber-500'
                    : 'bg-indigo-500';

                return (
                  <div key={method} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-slate-800">
                        {method} ({count} {count === 1 ? 'bill' : 'bills'})
                      </span>
                      <span className="font-bold text-slate-900">
                        {formatCurrency(total, settings.currencySymbol)}{' '}
                        <span className="text-[10px] text-slate-600 font-normal">({pct}%)</span>
                      </span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full ${colorBg}`} style={{ width: `${pct}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-600 flex justify-between">
            <span>Total Collected Today:</span>
            <span className="font-bold text-slate-900">
              {formatCurrency(metrics.todaySalesTotal, settings.currencySymbol)}
            </span>
          </div>
        </div>

        {/* Top Selling Products */}
        <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">Top Selling Products</h3>
            <button
              onClick={() => onNavigate('products')}
              className="text-xs font-semibold text-emerald-700 hover:underline"
            >
              Catalog ({metrics.totalProductsCount})
            </button>
          </div>

          <div className="mt-3 divide-y divide-slate-100">
            {metrics.topSellingProducts.length === 0 ? (
              <p className="text-xs text-slate-600 py-6 text-center">
                No completed sales recorded yet. Start billing on the POS to see top items!
              </p>
            ) : (
              metrics.topSellingProducts.map((prod, idx) => (
                <div key={prod.productId} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-[11px]">
                      {idx + 1}
                    </span>
                    <div>
                      <p className="font-semibold text-slate-900">{prod.productName}</p>
                      <span className="text-[10px] text-slate-600">{prod.category}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="font-bold text-slate-900">{prod.quantitySold} units sold</p>
                    <span className="text-[11px] text-emerald-700 font-semibold">
                      {formatCurrency(prod.totalRevenue, settings.currencySymbol)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recent Sales Register */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Recent Transactions</h3>
            <p className="text-xs text-slate-600">Latest invoices processed on this terminal</p>
          </div>
          <button
            onClick={() => onNavigate('sales')}
            className="text-xs font-semibold text-emerald-700 hover:underline flex items-center gap-1"
          >
            <span>View All Invoices</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto mt-2">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-[11px] font-bold text-slate-600 border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Invoice Number</th>
                <th className="py-2.5 px-3">Date & Time</th>
                <th className="py-2.5 px-3">Products Sold</th>
                <th className="py-2.5 px-3">Payment</th>
                <th className="py-2.5 px-3 text-center">Qty</th>
                <th className="py-2.5 px-3">Total Amount</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {metrics.recentSales.map((sale) => (
                <tr key={sale.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-900 whitespace-nowrap">
                    {sale.invoiceNumber}
                  </td>
                  <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap">
                    {formatDateTime(sale.saleDateTime)}
                  </td>
                  <td className="py-2.5 px-3 max-w-[200px]">
                    <div className="space-y-0.5">
                      {sale.products?.map((p, idx) => (
                        <div key={idx} className="flex items-center gap-1.5 text-xs">
                          <span className="font-semibold text-slate-800 line-clamp-1" title={p.productName}>
                            {p.productName}
                          </span>
                          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-1 rounded shrink-0">
                            ×{p.quantity}
                          </span>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="py-2.5 px-3 font-medium text-slate-800">
                    {sale.paymentMethod}
                  </td>
                  <td className="py-2.5 px-3 font-bold text-slate-900">
                    {formatCurrency(sale.finalTotal, settings.currencySymbol)}
                  </td>
                  <td className="py-2.5 px-3">
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
                  <td className="py-2.5 px-3 text-right space-x-2">
                    <button
                      onClick={() => {
                        const fullSale = reportsService
                          .getDashboardMetrics()
                          .recentSales.find((s) => s.id === sale.id);
                        // fetch complete sale object from salesService
                        import('../services/salesService').then(({ salesService }) => {
                          const s = salesService.getById(sale.id);
                          if (s) {
                            setSelectedSale(s);
                            setIsDetailOpen(true);
                          }
                        });
                      }}
                      className="text-xs font-semibold text-emerald-700 hover:underline"
                    >
                      Details
                    </button>
                  </td>
                </tr>
              ))}
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
          loadMetrics();
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
