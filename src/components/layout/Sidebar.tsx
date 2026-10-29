import React from 'react';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Layers,
  Boxes,
  Receipt,
  CreditCard,
  FileSpreadsheet,
  Database,
  Settings,
  HardDriveDownload,
  AlertTriangle,
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useSettings } from '../../context/SettingsContext';
import { stockService } from '../../services/stockService';

export type AppPage =
  | 'dashboard'
  | 'pos'
  | 'products'
  | 'categories'
  | 'inventory'
  | 'sales'
  | 'payments'
  | 'reports'
  | 'backup'
  | 'settings'
  | 'deployment';

interface SidebarProps {
  currentPage: AppPage;
  onNavigate: (page: AppPage) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentPage, onNavigate }) => {
  const { itemCount } = useCart();
  const { settings } = useSettings();
  const lowStockCount = stockService.getLowStockProducts().length;

  const navItems: { id: AppPage; label: string; icon: React.ElementType; badge?: string | number; badgeColor?: string }[] = [
    { id: 'pos', label: 'Quick POS (Billing)', icon: ShoppingCart, badge: itemCount > 0 ? itemCount : undefined, badgeColor: 'bg-emerald-500' },
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'categories', label: 'Categories', icon: Layers },
    {
      id: 'inventory',
      label: 'Inventory & Stock',
      icon: Boxes,
      badge: lowStockCount > 0 ? lowStockCount : undefined,
      badgeColor: 'bg-amber-500',
    },
    { id: 'sales', label: 'Sales Register', icon: Receipt },
    { id: 'payments', label: 'Payment Summary', icon: CreditCard },
    { id: 'reports', label: 'Reports & Export', icon: FileSpreadsheet },
    { id: 'backup', label: 'Backup & Restore', icon: Database },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'deployment', label: 'Windows Installer', icon: HardDriveDownload },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 select-none border-r border-slate-800">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-md font-black text-lg">
          QB
        </div>
        <div className="min-w-0">
          <h1 className="text-sm font-extrabold text-white truncate tracking-tight">
            {settings.shopName}
          </h1>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span className="text-[10px] text-emerald-400 font-semibold tracking-wide">
              OFFLINE LOCAL DB
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-sm font-bold'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>

              {item.badge !== undefined && (
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full text-white ${
                    item.badgeColor || 'bg-slate-700'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="p-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
        <div>
          <p className="text-white font-bold">QuickBilling v1.0</p>
          <p className="text-[10px]">Windows Desktop & POS</p>
        </div>
        <div className="p-1 rounded bg-slate-800 text-emerald-400 text-[10px] font-mono">
          Win64
        </div>
      </div>
    </aside>
  );
};
