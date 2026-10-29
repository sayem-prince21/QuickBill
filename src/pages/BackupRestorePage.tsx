import React, { useState, useRef } from 'react';
import { backupService } from '../services/backupService';
import { storage } from '../services/storage';
import { useSettings } from '../context/SettingsContext';
import {
  Database,
  Download,
  Upload,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
  CheckCircle,
  FileJson,
} from 'lucide-react';

export const BackupRestorePage: React.FC = () => {
  const { settings, resetSettings } = useSettings();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );
  const [hasSafetyBackup, setHasSafetyBackup] = useState<boolean>(() =>
    backupService.hasSafetyBackup()
  );

  const handleDownloadBackup = () => {
    try {
      backupService.downloadBackupFile();
      setStatusMessage({
        type: 'success',
        text: 'Backup file created and downloaded successfully! Store it safely on an external USB drive.',
      });
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: `Backup failed: ${err.message}`,
      });
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!window.confirm(`Are you sure you want to restore data from "${file.name}"? Current data will be replaced, but an automated safety snapshot will be created.`)) {
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = backupService.restoreFromJson(content);
      if (res.success) {
        setStatusMessage({
          type: 'success',
          text: `${res.message} (${res.details?.productsCount || 0} products, ${res.details?.salesCount || 0} invoices)`,
        });
        setHasSafetyBackup(true);
        setTimeout(() => window.location.reload(), 1500);
      } else {
        setStatusMessage({
          type: 'error',
          text: res.message,
        });
      }
    };
    reader.readAsText(file);
  };

  const handleRestoreSafety = () => {
    if (!window.confirm('Revert database to the state prior to your last restore?')) return;

    const res = backupService.restoreSafetyBackup();
    if (res.success) {
      setStatusMessage({
        type: 'success',
        text: 'Safety snapshot restored successfully! Reloading...',
      });
      setTimeout(() => window.location.reload(), 1500);
    } else {
      setStatusMessage({
        type: 'error',
        text: res.message,
      });
    }
  };

  const handleResetDemoData = () => {
    if (
      window.confirm(
        'WARNING: This will reset all products, inventory counts, categories, and sales to default demo values. Are you sure?'
      )
    ) {
      backupService.createBackupObject(); // take backup just in case
      storage.resetAllToDefaults();
      resetSettings();
      setStatusMessage({
        type: 'success',
        text: 'Database successfully reset to default retail demo dataset. Reloading...',
      });
      setTimeout(() => window.location.reload(), 1500);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50">
      {/* Header */}
      <div className="pb-2 border-b border-slate-200">
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
          Database Backup & Restore
        </h1>
        <p className="text-xs text-slate-600">
          Create complete offline backups, safeguard user data during hardware swaps, and restore previous snapshots
        </p>
      </div>

      {statusMessage && (
        <div
          className={`p-4 rounded-2xl border text-xs font-bold flex items-center gap-3 animate-in fade-in ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Backup Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3">
              <Download className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Create Complete Local Backup</h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Downloads a complete standalone JSON archive containing your full catalog, prices, categories, historical invoices, and stock logs. Can be archived on an external drive or USB stick.
            </p>

            <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-[11px] space-y-1 text-slate-600">
              <div className="flex justify-between">
                <span>Products stored:</span>
                <span className="font-bold text-slate-900">{storage.getProducts().length} items</span>
              </div>
              <div className="flex justify-between">
                <span>Invoices stored:</span>
                <span className="font-bold text-slate-900">{storage.getSales().length} sales</span>
              </div>
              <div className="flex justify-between">
                <span>Stock movements:</span>
                <span className="font-bold text-slate-900">{storage.getStockMovements().length} logs</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleDownloadBackup}
            className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Download Backup File (.json)</span>
          </button>
        </div>

        {/* Restore Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center mb-3">
              <Upload className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Restore from Backup Archive</h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Upload a previously exported backup file to restore products, inventory, and sales history.
            </p>

            <div className="mt-4 p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 text-[11px] text-indigo-900 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <p>
                <strong>Pre-Restore Safety Guard:</strong> QuickBilling automatically creates an internal safety snapshot before applying any restore. If anything goes wrong, you can revert instantly.
              </p>
            </div>
          </div>

          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileSelect}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 transition-all"
            >
              <Upload className="w-4 h-4" />
              <span>Select Backup File & Restore</span>
            </button>
          </div>
        </div>
      </div>

      {/* Safety Revert & Demo Reset Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Revert Safety Backup */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <h4 className="text-xs font-bold text-slate-900">Emergency Revert</h4>
            <p className="text-[11px] text-slate-600 mt-0.5">
              Revert database to the state prior to your most recent restore
            </p>
          </div>
          <button
            onClick={handleRestoreSafety}
            disabled={!hasSafetyBackup}
            className="px-3.5 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-bold text-slate-700 transition-colors flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Revert Snapshot</span>
          </button>
        </div>

        {/* Demo Data Reset */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <h4 className="text-xs font-bold text-rose-700">Factory Reset / Demo Data</h4>
            <p className="text-[11px] text-slate-600 mt-0.5">
              Reload initial grocery catalog with sample sales & categories
            </p>
          </div>
          <button
            onClick={handleResetDemoData}
            className="px-3.5 py-2 rounded-xl border border-rose-200 hover:bg-rose-50 text-xs font-bold text-rose-700 transition-colors flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5 text-rose-600" />
            <span>Reset Demo Data</span>
          </button>
        </div>
      </div>
    </div>
  );
};
