import React, { useState } from 'react';
import { excelService } from '../services/excelService';
import { useSettings } from '../context/SettingsContext';
import { FileSpreadsheet, Download, Calendar, Info, Layers, CheckCircle } from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const { settings } = useSettings();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  const handleExport = () => {
    setIsExporting(true);
    setExportSuccess(false);

    try {
      excelService.exportCompleteReport(startDate || undefined, endDate || undefined);
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 4000);
    } catch (err: any) {
      alert(`Export error: ${err.message || 'Failed to generate Excel file.'}`);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportAll = () => {
    setStartDate('');
    setEndDate('');
    setIsExporting(true);
    try {
      excelService.exportCompleteReport();
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 4000);
    } catch (err: any) {
      alert(`Export error: ${err.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50">
      {/* Header */}
      <div className="pb-2 border-b border-slate-200">
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
          Offline Reports & Excel Export
        </h1>
        <p className="text-xs text-slate-600">
          Generate structured, multi-worksheet Microsoft Excel (.xlsx) workbooks directly on your machine without internet
        </p>
      </div>

      {exportSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-3 animate-in fade-in">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          <div>
            <p>Excel workbook generated and downloaded successfully!</p>
            <p className="text-[11px] font-normal text-emerald-700 mt-0.5">
              Check your computer's Downloads folder for the complete multi-sheet file.
            </p>
          </div>
        </div>
      )}

      {/* Export Action Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Generate Comprehensive Store Report (.xlsx)</span>
          </h3>
          <p className="text-xs text-slate-600 mt-0.5">
            Select a custom date range or export all historical sales since store launch.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">From Date (Optional)</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">To Date (Optional)</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white font-medium"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:bg-slate-300 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 transition-all"
            >
              <Download className="w-4 h-4" />
              <span>{isExporting ? 'Generating...' : 'Export Filtered Range'}</span>
            </button>
          </div>

          <div className="flex items-end">
            <button
              onClick={handleExportAll}
              disabled={isExporting}
              className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Export All-Time Data</span>
            </button>
          </div>
        </div>
      </div>

      {/* Specification Documentation Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Layers className="w-4 h-4 text-indigo-600" />
          <span>Included Worksheets in the Exported Workbook</span>
        </h3>
        <p className="text-xs text-slate-600">
          In strict accordance with the Section 15 specifications, every export file contains 4 auto-formatted worksheets:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-1">
            <h4 className="text-xs font-bold text-slate-900">Worksheet 1: Sales Register</h4>
            <p className="text-[11px] text-slate-600">
              Complete invoice logs including Invoice Number, Sale Date & Time, Customer Name, Payment Method, Subtotal, Discount, VAT, Total, and Sale Status (Completed vs Cancelled).
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-1">
            <h4 className="text-xs font-bold text-slate-900">Worksheet 2: Sale Items</h4>
            <p className="text-[11px] text-slate-600">
              Detailed granular item lines showing Invoice Number, Product Name, SKU, Category, Quantity Sold, Exact Actual Sold Unit Price (accounting for price overrides), and Line Total.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-1">
            <h4 className="text-xs font-bold text-slate-900">Worksheet 3: Payment Summary</h4>
            <p className="text-[11px] text-slate-600">
              Aggregated settlement summary grouped by Cash, bKash, Nagad, and Other MFS. Shows Bill Count, Total Amount Collected, and Percentage Share of Store Revenue.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-1">
            <h4 className="text-xs font-bold text-slate-900">Worksheet 4: Stock Report</h4>
            <p className="text-[11px] text-slate-600">
              Full inventory count report containing Product Name, SKU, Category, Current Physical Stock, Selling Price, Cost Price, Low Stock Threshold, and Health Status (Healthy, Low Stock, Out of Stock).
            </p>
          </div>
        </div>

        {/* Warning callout */}
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5 mt-2">
          <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p>
            <strong>Note regarding data safety:</strong> An Excel export is designed for accounting, auditing, and tax filing. It is <strong className="underline">not</strong> a substitute for a full database backup. To backup your entire store including configurations, schemas, and historical logs for disaster recovery, please use the <strong>Backup & Restore</strong> page.
          </p>
        </div>
      </div>
    </div>
  );
};
