import React, { useState, useEffect } from 'react';
import { Product } from '../types/product';
import { StockMovement } from '../types/stock';
import { productService } from '../services/productService';
import { stockService } from '../services/stockService';
import { useSettings } from '../context/SettingsContext';
import { formatCurrency, formatDateTime } from '../config/ui.config';
import { StockAdjustmentModal } from '../components/stock/StockAdjustmentModal';
import {
  Boxes,
  History,
  AlertTriangle,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  PlusCircle,
} from 'lucide-react';

export const InventoryPage: React.FC = () => {
  const { settings } = useSettings();
  const [activeTab, setActiveTab] = useState<'stock' | 'movements'>('stock');
  const [products, setProducts] = useState<Product[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLowStockOnly, setFilterLowStockOnly] = useState(false);
  const [selectedProductForAdjust, setSelectedProductForAdjust] = useState<Product | null>(null);
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);

  const loadData = () => {
    setProducts(productService.getAll(true));
    setMovements(stockService.getMovements());
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredProducts = products.filter((p) => {
    const isLow = p.currentStock <= p.lowStockThreshold;
    if (filterLowStockOnly && !isLow) return false;
    const q = searchQuery.toLowerCase().trim();
    return !q || p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q);
  });

  const lowStockCount = products.filter(
    (p) => p.isActive && p.currentStock <= p.lowStockThreshold
  ).length;

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-slate-50">
      {/* Page Header */}
      <div className="flex items-center justify-between flex-wrap gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Inventory & Stock Management
          </h1>
          <p className="text-xs text-slate-600">
            Real-time shelf counts, threshold warnings, and transactional audit trails
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-xs text-xs font-bold">
          <button
            onClick={() => setActiveTab('stock')}
            className={`px-4 py-1.5 rounded-lg flex items-center gap-2 transition-all ${
              activeTab === 'stock'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Boxes className="w-4 h-4" />
            <span>Current Stock ({products.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('movements')}
            className={`px-4 py-1.5 rounded-lg flex items-center gap-2 transition-all ${
              activeTab === 'movements'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Movement Audit Trail ({movements.length})</span>
          </button>
        </div>
      </div>

      {/* Low stock alert banner */}
      {lowStockCount > 0 && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between text-xs text-amber-900">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <p className="font-bold">
                {lowStockCount} product(s) are at or below their low-stock replenishment threshold!
              </p>
              <p className="text-[11px] text-amber-700">
                Consider reordering soon to avoid running out during peak store hours.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setFilterLowStockOnly(!filterLowStockOnly);
              setActiveTab('stock');
            }}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              filterLowStockOnly
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-white border border-amber-300 text-amber-800 hover:bg-amber-100'
            }`}
          >
            {filterLowStockOnly ? 'Show All Products' : 'Filter Low Stock Items'}
          </button>
        </div>
      )}

      {/* VIEW 1: CURRENT STOCK TAB */}
      {activeTab === 'stock' && (
        <div className="space-y-4">
          {/* Search bar */}
          <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 text-slate-600 absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="text"
                placeholder="Search stock by product name or SKU barcode..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>

            {filterLowStockOnly && (
              <span className="text-xs font-semibold px-2.5 py-1 bg-amber-100 text-amber-800 rounded-lg">
                Filtered: Low Stock
              </span>
            )}
          </div>

          {/* Stock Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-[11px] font-bold text-slate-600 border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Item & SKU</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4 text-center">Current Stock</th>
                    <th className="py-3 px-4 text-center">Alert Threshold</th>
                    <th className="py-3 px-4 text-center">Health Status</th>
                    <th className="py-3 px-4 text-right">Selling Price</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-600">
                        No products match your filter.
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((p) => {
                      const isOutOfStock = p.currentStock <= 0;
                      const isLowStock = !isOutOfStock && p.currentStock <= p.lowStockThreshold;

                      return (
                        <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3 px-4">
                            <div className="font-bold text-slate-900">{p.name}</div>
                            <div className="font-mono text-[10px] text-slate-600">{p.sku}</div>
                          </td>

                          <td className="py-3 px-4 text-slate-700">{p.category}</td>

                          <td className="py-3 px-4 text-center">
                            <span className="text-sm font-black text-slate-900">
                              {p.currentStock}
                            </span>
                          </td>

                          <td className="py-3 px-4 text-center text-slate-600 font-semibold">
                            {p.lowStockThreshold}
                          </td>

                          <td className="py-3 px-4 text-center">
                            {isOutOfStock ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                                OUT OF STOCK
                              </span>
                            ) : isLowStock ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                                LOW STOCK
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                HEALTHY
                              </span>
                            )}
                          </td>

                          <td className="py-3 px-4 text-right font-bold text-slate-800">
                            {formatCurrency(p.sellingPrice, settings.currencySymbol)}
                          </td>

                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => {
                                setSelectedProductForAdjust(p);
                                setIsAdjustModalOpen(true);
                              }}
                              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 font-bold text-xs border border-slate-200 transition-colors"
                            >
                              Adjust Stock
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: MOVEMENT AUDIT TRAIL TAB */}
      {activeTab === 'movements' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200">
            <h3 className="text-sm font-bold text-slate-900">Stock Movements Log</h3>
            <p className="text-xs text-slate-600">
              Audit record of all sales, restocks, cancellations, and manual adjustments
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-[11px] font-bold text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Product Name & SKU</th>
                  <th className="py-3 px-4">Activity Type</th>
                  <th className="py-3 px-4 text-center">Change</th>
                  <th className="py-3 px-4 text-center">Stock Path</th>
                  <th className="py-3 px-4">Reason / Reference</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {movements.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-600">
                      No stock movements recorded yet.
                    </td>
                  </tr>
                ) : (
                  movements.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                        {formatDateTime(m.timestamp)}
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{m.productName}</div>
                        <span className="font-mono text-[10px] text-slate-600">{m.sku}</span>
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            m.movementType === 'Sale'
                              ? 'bg-blue-100 text-blue-800'
                              : m.movementType === 'SaleCancellation'
                              ? 'bg-purple-100 text-purple-800'
                              : m.movementType === 'Restock' || m.quantityChange > 0
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {m.movementType}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center font-bold">
                        <span
                          className={m.quantityChange > 0 ? 'text-emerald-600' : 'text-rose-600'}
                        >
                          {m.quantityChange > 0 ? `+${m.quantityChange}` : m.quantityChange}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center text-slate-600 font-mono text-[11px]">
                        {m.previousStock} &rarr; <strong className="text-slate-900">{m.newStock}</strong>
                      </td>

                      <td className="py-3 px-4 text-slate-700">
                        <span className="text-xs">{m.reason}</span>
                        {m.referenceId && (
                          <span className="block font-mono text-[10px] text-slate-600">
                            Ref: {m.referenceId}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Stock Adjustment Modal */}
      <StockAdjustmentModal
        isOpen={isAdjustModalOpen}
        onClose={() => setIsAdjustModalOpen(false)}
        product={selectedProductForAdjust}
        onSuccess={() => {
          loadData();
        }}
      />
    </div>
  );
};
