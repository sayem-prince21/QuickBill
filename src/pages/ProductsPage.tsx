import React, { useState, useEffect } from 'react';
import { Product, Category } from '../types/product';
import { productService } from '../services/productService';
import { useSettings } from '../context/SettingsContext';
import { formatCurrency } from '../config/ui.config';
import { ProductFormModal } from '../components/products/ProductFormModal';
import { Plus, Search, Edit3, Power, AlertTriangle, ArrowUpDown } from 'lucide-react';

export const ProductsPage: React.FC = () => {
  const { settings } = useSettings();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Inactive'>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const loadData = () => {
    setProducts(productService.getAll(true)); // include inactive
    setCategories(productService.getCategories());
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleActive = (id: string) => {
    try {
      productService.toggleActive(id);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to toggle product status');
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesCat =
      selectedCategory === 'All' || p.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesStatus =
      statusFilter === 'All' ||
      (statusFilter === 'Active' && p.isActive) ||
      (statusFilter === 'Inactive' && !p.isActive);
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q || p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q);
    return matchesCat && matchesStatus && matchesSearch;
  });

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-slate-50">
      {/* Page Header */}
      <div className="flex items-center justify-between flex-wrap gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Product Catalog</h1>
          <p className="text-xs text-slate-600">
            Manage your store's inventory items, barcode SKUs, and retail pricing
          </p>
        </div>

        <button
          onClick={() => {
            setEditingProduct(null);
            setIsModalOpen(true);
          }}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-2 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center gap-3">
        {/* Search Input */}
        <div className="flex-1 relative w-full">
          <Search className="w-4 h-4 text-slate-600 absolute left-3 top-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by product name or SKU barcode..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
          />
        </div>

        {/* Category Filter */}
        <div className="w-full md:w-52">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
          >
            <option value="All">All Categories ({categories.length})</option>
            {categories.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div className="w-full md:w-36">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active Only</option>
            <option value="Inactive">Inactive (Archived)</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-[11px] font-bold text-slate-600 border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Item Details</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-right">Selling Price</th>
                <th className="py-3 px-4 text-right">Cost Price</th>
                <th className="py-3 px-4 text-center">Stock Level</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-600">
                    No products found matching your search criteria.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const isOutOfStock = p.currentStock <= 0;
                  const isLowStock = !isOutOfStock && p.currentStock <= p.lowStockThreshold;

                  return (
                    <tr
                      key={p.id}
                      className={`hover:bg-slate-50/70 transition-colors ${
                        !p.isActive ? 'bg-slate-50/40 opacity-70' : ''
                      }`}
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          {p.imageUrl ? (
                            <img
                              src={p.imageUrl}
                              alt={p.name}
                              className="w-10 h-10 rounded-lg object-cover bg-slate-100 border border-slate-200 shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 text-[10px] font-mono shrink-0">
                              No Pic
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-slate-900">{p.name}</p>
                            <span className="font-mono text-[10px] text-slate-600">{p.sku}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                          {p.category}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right font-bold text-emerald-700 text-sm">
                        {formatCurrency(p.sellingPrice, settings.currencySymbol)}
                      </td>

                      <td className="py-3 px-4 text-right text-slate-600">
                        {p.costPrice ? formatCurrency(p.costPrice, settings.currencySymbol) : '-'}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded-full text-[11px] ${
                            isOutOfStock
                              ? 'bg-rose-100 text-rose-800'
                              : isLowStock
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-800'
                          }`}
                        >
                          {isLowStock && <AlertTriangle className="w-3 h-3 text-amber-600" />}
                          {p.currentStock} units
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                            p.isActive
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-200 text-slate-600'
                          }`}
                        >
                          {p.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                        <button
                          onClick={() => {
                            setEditingProduct(p);
                            setIsModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 hover:text-emerald-700 transition-colors inline-block"
                          title="Edit Product"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleToggleActive(p.id)}
                          className={`p-1.5 rounded-lg border transition-colors inline-block ${
                            p.isActive
                              ? 'border-slate-200 hover:bg-rose-50 text-slate-600 hover:text-rose-600'
                              : 'border-slate-200 hover:bg-emerald-50 text-slate-600 hover:text-emerald-600'
                          }`}
                          title={p.isActive ? 'Deactivate Product' : 'Activate Product'}
                        >
                          <Power className="w-3.5 h-3.5" />
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

      {/* Product Form Modal */}
      <ProductFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        productToEdit={editingProduct}
        categories={categories}
        onSuccess={() => {
          loadData();
        }}
      />
    </div>
  );
};
