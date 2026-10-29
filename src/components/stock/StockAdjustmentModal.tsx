import React, { useState, useEffect } from 'react';
import { Product } from '../../types/product';
import { stockService } from '../../services/stockService';
import { X, Check, ArrowUpRight, ArrowDownRight, RefreshCw } from 'lucide-react';

interface StockAdjustmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onSuccess: (updatedProduct: Product) => void;
}

export const StockAdjustmentModal: React.FC<StockAdjustmentModalProps> = ({
  isOpen,
  onClose,
  product,
  onSuccess,
}) => {
  const [adjustmentType, setAdjustmentType] = useState<'add' | 'subtract' | 'set'>('add');
  const [quantity, setQuantity] = useState<number>(1);
  const [reason, setReason] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && product) {
      setAdjustmentType('add');
      setQuantity(1);
      setReason('');
      setError(null);
    }
  }, [isOpen, product]);

  if (!isOpen || !product) return null;

  const currentStock = product.currentStock;
  let newStockPreview = currentStock;
  if (adjustmentType === 'add') {
    newStockPreview = currentStock + quantity;
  } else if (adjustmentType === 'subtract') {
    newStockPreview = currentStock - quantity;
  } else if (adjustmentType === 'set') {
    newStockPreview = quantity;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!reason.trim()) {
      setError('Please specify a reason for this stock adjustment.');
      return;
    }

    if (newStockPreview < 0) {
      setError('Cannot adjust to a negative stock level.');
      return;
    }

    try {
      const updated = stockService.adjustStock({
        productId: product.id,
        adjustmentType,
        quantity,
        reason: reason.trim(),
      });
      onSuccess(updated);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to adjust stock.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Adjust Product Stock</h3>
            <p className="text-xs text-slate-600 font-mono">{product.sku} • {product.name}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-600 hover:text-slate-600 hover:bg-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 font-semibold">
              {error}
            </div>
          )}

          {/* Current & New Stock Comparison */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl grid grid-cols-2 gap-4 text-center">
            <div>
              <span className="text-[11px] font-bold text-slate-600 uppercase">Current Stock</span>
              <p className="text-2xl font-black text-slate-800 mt-0.5">{currentStock}</p>
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-600 uppercase">New Stock Preview</span>
              <p
                className={`text-2xl font-black mt-0.5 ${
                  newStockPreview < 0
                    ? 'text-rose-600'
                    : newStockPreview <= product.lowStockThreshold
                    ? 'text-amber-600'
                    : 'text-emerald-700'
                }`}
              >
                {newStockPreview}
              </p>
            </div>
          </div>

          {/* Adjustment Mode Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
              Adjustment Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setAdjustmentType('add')}
                className={`py-2 px-2 rounded-lg font-bold flex flex-col items-center justify-center gap-1 border transition-all ${
                  adjustmentType === 'add'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <ArrowUpRight className="w-4 h-4 text-emerald-600" />
                <span>Restock (+ Add)</span>
              </button>

              <button
                type="button"
                onClick={() => setAdjustmentType('subtract')}
                className={`py-2 px-2 rounded-lg font-bold flex flex-col items-center justify-center gap-1 border transition-all ${
                  adjustmentType === 'subtract'
                    ? 'border-rose-600 bg-rose-50 text-rose-800 ring-2 ring-rose-500/20'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <ArrowDownRight className="w-4 h-4 text-rose-600" />
                <span>Damage (- Sub)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setAdjustmentType('set');
                  setQuantity(currentStock);
                }}
                className={`py-2 px-2 rounded-lg font-bold flex flex-col items-center justify-center gap-1 border transition-all ${
                  adjustmentType === 'set'
                    ? 'border-blue-600 bg-blue-50 text-blue-800 ring-2 ring-blue-500/20'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <RefreshCw className="w-4 h-4 text-blue-600" />
                <span>Audit (Set Exact)</span>
              </button>
            </div>
          </div>

          {/* Quantity Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {adjustmentType === 'set' ? 'New Exact Quantity *' : 'Quantity Units to Change *'}
            </label>
            <input
              type="number"
              min={adjustmentType === 'set' ? 0 : 1}
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value, 10) || 0)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              required
            />
          </div>

          {/* Reason Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Reason / Explanation * (Recorded in audit trail)
            </label>
            <select
              onChange={(e) => setReason(e.target.value)}
              className="w-full mb-1.5 px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white font-medium"
            >
              <option value="">-- Choose common reason or type below --</option>
              <option value="New stock delivery shipment arrived">New stock delivery shipment arrived</option>
              <option value="Physical shelf inventory cycle count adjustment">Physical shelf inventory cycle count adjustment</option>
              <option value="Damaged / broken packaging discarded">Damaged / broken packaging discarded</option>
              <option value="Expired date threshold passed">Expired date threshold passed</option>
              <option value="Vendor return / defect warranty swap">Vendor return / defect warranty swap</option>
            </select>
            <input
              type="text"
              required
              placeholder="e.g. Received carton from distributor invoice #781..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
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
              <span>Apply Adjustment</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
