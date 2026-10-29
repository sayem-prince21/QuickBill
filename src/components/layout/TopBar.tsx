import React, { useState, useEffect } from 'react';
import { AppPage } from './Sidebar';
import { useSettings } from '../../context/SettingsContext';
import { useCart } from '../../context/CartContext';
import { ShoppingCart, Clock, ShieldCheck } from 'lucide-react';
import { formatCurrency } from '../../config/ui.config';

interface TopBarProps {
  currentPage: AppPage;
  onNavigate: (page: AppPage) => void;
}

export const TopBar: React.FC<TopBarProps> = ({ currentPage, onNavigate }) => {
  const { settings } = useSettings();
  const { finalTotal, itemCount } = useCart();
  const [timeStr, setTimeStr] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const titles: Record<AppPage, { title: string; subtitle: string }> = {
    pos: { title: 'Point of Sale & Quick Billing', subtitle: 'Search products, scan SKU, or click to add to bill' },
    dashboard: { title: 'Executive Retail Dashboard', subtitle: 'Daily revenue, payment methods & inventory health' },
    products: { title: 'Product Catalog Management', subtitle: 'Manage retail catalog, SKU codes, prices & stock alerts' },
    categories: { title: 'Product Categories', subtitle: 'Organize inventory into fast retail groups' },
    inventory: { title: 'Inventory & Stock Control', subtitle: 'Track physical stock, adjust quantities & review movement history' },
    sales: { title: 'Sales Register & Invoices', subtitle: 'Review historical bills, reprint receipts & handle customer returns' },
    payments: { title: 'Payment Method Breakdown', subtitle: 'Reconcile Cash, bKash, Nagad and MFS receipts' },
    reports: { title: 'Reports & Excel Export', subtitle: 'Generate authentic multi-worksheet .xlsx reports locally' },
    backup: { title: 'Database Backup & Restore', subtitle: 'Export full database snapshot or restore with safety backup' },
    settings: { title: 'Shop & POS Settings', subtitle: 'Customize store details, receipts, and product card appearance' },
    deployment: { title: 'Windows Desktop Installer & Publish', subtitle: 'Inno Setup script & self-contained Windows x64 .exe packaging instructions' },
  };

  const currentInfo = titles[currentPage] || { title: 'QuickBilling', subtitle: '' };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0 select-none">
      <div>
        <h2 className="text-sm font-bold text-slate-900">{currentInfo.title}</h2>
        <p className="text-[11px] text-slate-600">{currentInfo.subtitle}</p>
      </div>

      <div className="flex items-center gap-4">
        {/* Offline & Database Status Badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-semibold">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Local SQLite Database</span>
        </div>

        {/* Live Clock */}
        <div className="hidden md:flex items-center gap-1.5 text-xs font-mono font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md">
          <Clock className="w-3.5 h-3.5 text-slate-600" />
          <span>{timeStr}</span>
        </div>

        {/* Quick Cart Pill if not on POS */}
        {currentPage !== 'pos' && itemCount > 0 && (
          <button
            onClick={() => onNavigate('pos')}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>
              Cart: {itemCount} items ({formatCurrency(finalTotal, settings.currencySymbol)})
            </span>
          </button>
        )}
      </div>
    </header>
  );
};
