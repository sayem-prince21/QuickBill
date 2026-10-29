import React, { useState, useEffect } from 'react';
import { PaymentSummaryReport } from '../types/reports';
import { reportsService } from '../services/reportsService';
import { useSettings } from '../context/SettingsContext';
import { formatCurrency, PAYMENT_METHODS } from '../config/ui.config';
import { excelService } from '../services/excelService';
import { CreditCard, Calendar, FileSpreadsheet, PieChart } from 'lucide-react';

export const PaymentSummaryPage: React.FC = () => {
  const { settings } = useSettings();
  const [report, setReport] = useState<PaymentSummaryReport | null>(null);
  const [dateFilterPreset, setDateFilterPreset] = useState<'today' | 'yesterday' | 'week' | 'month' | 'all' | 'custom'>('all');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  const loadReport = () => {
    let start: string | undefined;
    let end: string | undefined;
    const today = new Date();
    const toIsoDate = (d: Date) => d.toISOString().split('T')[0];

    if (dateFilterPreset === 'today') {
      start = toIsoDate(today);
      end = toIsoDate(today);
    } else if (dateFilterPreset === 'yesterday') {
      const y = new Date(Date.now() - 86400000);
      start = toIsoDate(y);
      end = toIsoDate(y);
    } else if (dateFilterPreset === 'week') {
      const w = new Date(Date.now() - 7 * 86400000);
      start = toIsoDate(w);
      end = toIsoDate(today);
    } else if (dateFilterPreset === 'month') {
      const m = new Date(today.getFullYear(), today.getMonth(), 1);
      start = toIsoDate(m);
      end = toIsoDate(today);
    } else if (dateFilterPreset === 'custom') {
      start = customStart || undefined;
      end = customEnd || undefined;
    }

    const data = reportsService.getPaymentSummaryReport(start, end);
    setReport(data);
  };

  useEffect(() => {
    loadReport();
  }, [dateFilterPreset, customStart, customEnd]);

  if (!report) return null;

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Payment Summary</h1>
          <p className="text-xs text-slate-600">
            Reconcile payments received across Cash and Mobile Financial Services (bKash, Nagad, Other MFS)
          </p>
        </div>

        <button
          onClick={() => excelService.exportCompleteReport(report.startDate, report.endDate)}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-2 transition-all"
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Export Excel Report</span>
        </button>
      </div>

      {/* Date Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-1.5 flex-wrap text-xs">
          <span className="font-bold text-slate-700 mr-2">Filter Period:</span>
          {(['all', 'today', 'yesterday', 'week', 'month', 'custom'] as const).map((preset) => (
            <button
              key={preset}
              onClick={() => setDateFilterPreset(preset)}
              className={`px-3 py-1.5 rounded-lg font-bold capitalize transition-all ${
                dateFilterPreset === preset
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {preset === 'week' ? 'Last 7 Days' : preset === 'month' ? 'This Month' : preset}
            </button>
          ))}
        </div>

        {dateFilterPreset === 'custom' && (
          <div className="flex items-center gap-2 text-xs">
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
            />
            <span className="text-slate-600">to</span>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
            />
          </div>
        )}
      </div>

      {/* Primary Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
            Total Revenue ({report.dateRangeLabel})
          </span>
          <h2 className="text-2xl font-black text-emerald-700 mt-1">
            {formatCurrency(report.grandTotal, settings.currencySymbol)}
          </h2>
          <span className="text-[11px] text-slate-600 mt-0.5 inline-block">
            Strictly completed non-voided bills
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
            Total Bills Paid
          </span>
          <h2 className="text-2xl font-black text-slate-900 mt-1">{report.totalBills}</h2>
          <span className="text-[11px] text-slate-600 mt-0.5 inline-block">
            Across all payment channels
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
            Average Ticket Size
          </span>
          <h2 className="text-2xl font-black text-slate-900 mt-1">
            {formatCurrency(
              report.totalBills > 0 ? report.grandTotal / report.totalBills : 0,
              settings.currencySymbol
            )}
          </h2>
          <span className="text-[11px] text-slate-600 mt-0.5 inline-block">
            Per transaction
          </span>
        </div>
      </div>

      {/* Detailed Payment Methods Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {report.rows.map((row) => {
          const pmConfig = PAYMENT_METHODS.find((p) => p.id === row.paymentMethod);
          const colorBg =
            row.paymentMethod === 'Cash'
              ? 'bg-emerald-500'
              : row.paymentMethod === 'bKash'
              ? 'bg-pink-500'
              : row.paymentMethod === 'Nagad'
              ? 'bg-amber-500'
              : 'bg-indigo-500';

          return (
            <div
              key={row.paymentMethod}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${pmConfig?.badge}`}>
                    {row.paymentMethod}
                  </span>
                  <span className="text-xs font-extrabold text-slate-700">
                    {row.percentageOfTotal}% share
                  </span>
                </div>

                <div className="mt-3">
                  <h3 className="text-2xl font-black text-slate-900">
                    {formatCurrency(row.totalAmount, settings.currencySymbol)}
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5 font-medium">
                    {row.billCount} {row.billCount === 1 ? 'transaction' : 'transactions'}
                  </p>
                </div>
              </div>

              {/* Progress bar */}
              <div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${colorBg}`}
                    style={{ width: `${row.percentageOfTotal}%` }}
                  ></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200">
          <h3 className="text-sm font-bold text-slate-900">Payment Breakdown Breakdown</h3>
          <p className="text-xs text-slate-600">
            Audit-ready numbers matching sales register and Excel export
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-[11px] font-bold text-slate-600 border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Payment Method</th>
                <th className="py-3 px-4 text-center">Completed Invoices</th>
                <th className="py-3 px-4 text-right">Collected Amount</th>
                <th className="py-3 px-4 text-right">Share of Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {report.rows.map((row) => (
                <tr key={row.paymentMethod} className="hover:bg-slate-50/70">
                  <td className="py-3 px-4 font-bold text-slate-900">{row.paymentMethod}</td>
                  <td className="py-3 px-4 text-center text-slate-700 font-medium">
                    {row.billCount} bills
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-emerald-700 text-sm">
                    {formatCurrency(row.totalAmount, settings.currencySymbol)}
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-slate-800">
                    {row.percentageOfTotal}%
                  </td>
                </tr>
              ))}
              <tr className="bg-slate-50 font-black text-slate-900">
                <td className="py-3 px-4 uppercase">Total Collection</td>
                <td className="py-3 px-4 text-center">{report.totalBills} bills</td>
                <td className="py-3 px-4 text-right text-emerald-800 text-base">
                  {formatCurrency(report.grandTotal, settings.currencySymbol)}
                </td>
                <td className="py-3 px-4 text-right">100.0%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
