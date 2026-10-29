import React, { useState, useEffect } from 'react';
import { Category } from '../types/product';
import { productService } from '../services/productService';
import { Plus, Trash2, Layers, CheckCircle } from 'lucide-react';

export const CategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCatName, setNewCatName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadCategories = () => {
    setCategories(productService.getCategories());
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      productService.createCategory(newCatName);
      setNewCatName('');
      setSuccess('Category created successfully!');
      loadCategories();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to create category.');
    }
  };

  const handleDelete = (cat: Category) => {
    setError(null);
    setSuccess(null);

    if (cat.itemCount && cat.itemCount > 0) {
      setError(`Cannot delete "${cat.name}" because ${cat.itemCount} product(s) are assigned to it.`);
      return;
    }

    if (window.confirm(`Are you sure you want to delete category "${cat.name}"?`)) {
      try {
        productService.deleteCategory(cat.id);
        setSuccess(`Category "${cat.name}" deleted.`);
        loadCategories();
        setTimeout(() => setSuccess(null), 3000);
      } catch (err: any) {
        setError(err.message || 'Failed to delete category.');
      }
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50">
      <div className="pb-2 border-b border-slate-200">
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Product Categories</h1>
        <p className="text-xs text-slate-600">
          Organize inventory into fast retail groups for quick filtering at the checkout counter
        </p>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
          {error}
        </div>
      )}

      {success && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>{success}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Create Category Form */}
        <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-1">Add New Category</h3>
          <p className="text-xs text-slate-600 mb-4">
            New categories appear immediately on the POS register
          </p>

          <form onSubmit={handleCreate} className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Category Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Frozen Foods, Baby Care"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Save Category</span>
            </button>
          </form>
        </div>

        {/* Categories List */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Registered Categories</h3>
            <span className="text-xs text-slate-600 font-medium">
              Total: {categories.length}
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {categories.map((cat) => (
              <div key={cat.id} className="p-4 flex items-center justify-between hover:bg-slate-50/60">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{cat.name}</h4>
                    <span className="text-[11px] text-slate-600">
                      {cat.itemCount || 0} {(cat.itemCount === 1 ? 'product' : 'products')} linked
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    {cat.itemCount || 0} Items
                  </span>
                  <button
                    onClick={() => handleDelete(cat)}
                    disabled={(cat.itemCount || 0) > 0}
                    className="p-1.5 rounded-lg border border-slate-200 hover:bg-rose-50 text-slate-600 hover:text-rose-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    title={(cat.itemCount || 0) > 0 ? 'Cannot delete category with products' : 'Delete category'}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
