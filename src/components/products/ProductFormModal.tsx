import React, { useState, useEffect } from 'react';
import { Product, Category } from '../../types/product';
import { productService } from '../../services/productService';
import { useSettings } from '../../context/SettingsContext';
import { X, Check, Sparkles } from 'lucide-react';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (product: Product) => void;
  productToEdit?: Product | null;
  categories: Category[];
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  productToEdit,
  categories,
}) => {
  const { settings } = useSettings();

  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [sellingPrice, setSellingPrice] = useState<number>(0);
  const [costPrice, setCostPrice] = useState<number>(0);
  const [currentStock, setCurrentStock] = useState<number>(0);
  const [lowStockThreshold, setLowStockThreshold] = useState<number>(settings.defaultLowStockThreshold);
  const [imageUrl, setImageUrl] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (productToEdit) {
      setName(productToEdit.name);
      setSku(productToEdit.sku);
      setCategory(productToEdit.category);
      setDescription(productToEdit.description || '');
      setSellingPrice(productToEdit.sellingPrice);
      setCostPrice(productToEdit.costPrice || 0);
      setCurrentStock(productToEdit.currentStock);
      setLowStockThreshold(productToEdit.lowStockThreshold);
      setImageUrl(productToEdit.imageUrl || '');
      setIsActive(productToEdit.isActive);
    } else {
      setName('');
      setSku('');
      setCategory(categories[0]?.name || 'Groceries');
      setDescription('');
      setSellingPrice(0);
      setCostPrice(0);
      setCurrentStock(10);
      setLowStockThreshold(settings.defaultLowStockThreshold);
      setImageUrl('');
      setIsActive(true);
    }
    setError(null);
  }, [productToEdit, isOpen, categories, settings]);

  if (!isOpen) return null;

  const handleGenerateSku = () => {
    const prefix = category ? category.substring(0, 3).toUpperCase() : 'PRD';
    const randomNum = Math.floor(100 + Math.random() * 900);
    setSku(`${prefix}-${randomNum}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Product name is required.');
      return;
    }
    if (!sku.trim()) {
      setError('SKU / Product Code is required.');
      return;
    }
    if (sellingPrice < 0) {
      setError('Selling price cannot be negative.');
      return;
    }

    try {
      if (productToEdit) {
        const updated = productService.update(productToEdit.id, {
          name: name.trim(),
          sku: sku.trim(),
          category,
          description: description.trim() || undefined,
          sellingPrice,
          costPrice,
          lowStockThreshold,
          imageUrl: imageUrl.trim() || undefined,
          isActive,
        });
        onSuccess(updated);
      } else {
        const created = productService.create({
          name: name.trim(),
          sku: sku.trim(),
          category,
          description: description.trim() || undefined,
          sellingPrice,
          costPrice,
          currentStock,
          lowStockThreshold,
          imageUrl: imageUrl.trim() || undefined,
          isActive,
        });
        onSuccess(created);
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save product.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {productToEdit ? 'Edit Product' : 'Add New Product'}
            </h3>
            <p className="text-xs text-slate-600">
              {productToEdit
                ? 'Update price, category, or product details'
                : 'Register a new retail product in inventory'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-600 hover:text-slate-600 hover:bg-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-3.5 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Product Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Premium Basmati Rice 5kg"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700">SKU / Barcode *</label>
                <button
                  type="button"
                  onClick={handleGenerateSku}
                  className="text-[10px] text-emerald-700 hover:underline flex items-center gap-0.5"
                >
                  <Sparkles className="w-2.5 h-2.5" />
                  Auto
                </button>
              </div>
              <input
                type="text"
                required
                placeholder="e.g. GROC-001"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono uppercase focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Selling Price ({settings.currencySymbol}) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={sellingPrice}
                onChange={(e) => setSellingPrice(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-bold text-emerald-700 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Cost Price ({settings.currencySymbol})
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={costPrice}
                onChange={(e) => setCostPrice(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-600 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {productToEdit ? 'Current Stock (Units)' : 'Initial Stock (Units)'}
              </label>
              <input
                type="number"
                min="0"
                disabled={!!productToEdit}
                value={currentStock}
                onChange={(e) => setCurrentStock(parseInt(e.target.value, 10) || 0)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-bold bg-white disabled:bg-slate-100 disabled:text-slate-600 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
              {productToEdit && (
                <span className="text-[10px] text-slate-600">
                  Use Inventory Stock screen for audit adjustments
                </span>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Low Stock Threshold
              </label>
              <input
                type="number"
                min="0"
                value={lowStockThreshold}
                onChange={(e) => setLowStockThreshold(parseInt(e.target.value, 10) || 0)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Image URL (Optional)
            </label>
            <input
              type="url"
              placeholder="https://... or local relative path"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Description / Notes (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="Pack size, supplier info, brand details..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="isActiveToggle"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
            />
            <label htmlFor="isActiveToggle" className="text-xs font-semibold text-slate-800">
              Active for Sale (Uncheck to hide without deleting historical sales)
            </label>
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 text-xs font-bold hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>{productToEdit ? 'Save Changes' : 'Create Product'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
