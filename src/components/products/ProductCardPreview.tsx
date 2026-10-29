import React from 'react';
import { ProductCardConfig, ProductCardLayout, Product } from '../../types/product';
import { ProductCard } from './ProductCard';
import { PRODUCT_CARD_PRESETS } from '../../config/product-card.config';

interface ProductCardPreviewProps {
  config: ProductCardConfig;
  onChangeConfig: (newConfig: Partial<ProductCardConfig>) => void;
  onApplyPreset: (layout: ProductCardLayout) => void;
}

const SAMPLE_PREVIEW_PRODUCT: Product = {
  id: 'preview-sample-01',
  name: 'Premium Roasted Cashew Nuts 250g',
  sku: 'SNK-880',
  category: 'Snacks & Bakery',
  description: 'Slow roasted lightly sea-salted gourmet cashews in a resealable pouch.',
  sellingPrice: 380.0,
  costPrice: 310.0,
  currentStock: 14,
  lowStockThreshold: 5,
  imageUrl: 'https://images.unsplash.com/photo-1509358271058-acd22cc93898?auto=format&fit=crop&w=400&q=80',
  isActive: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const ProductCardPreview: React.FC<ProductCardPreviewProps> = ({
  config,
  onChangeConfig,
  onApplyPreset,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-3">
        <div>
          <h3 className="text-base font-bold text-slate-900">
            Interactive Product Card Customizer
          </h3>
          <p className="text-xs text-slate-600">
            Change layout, visibility, and styles. All changes persist and update the POS grid immediately.
          </p>
        </div>

        {/* Preset Selector */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-semibold text-slate-600">Presets:</span>
          {(['standard', 'compact', 'detailed', 'minimal'] as ProductCardLayout[]).map((layout) => (
            <button
              key={layout}
              type="button"
              onClick={() => onApplyPreset(layout)}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition-all ${
                config.layout === layout
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {layout.charAt(0).toUpperCase() + layout.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6 items-start">
        {/* Live Preview Box */}
        <div className="lg:col-span-5 bg-slate-50/70 border border-slate-200/80 rounded-xl p-6 flex flex-col items-center justify-center min-h-[320px]">
          <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-4">
            Live Preview (Clickable)
          </span>

          <div className="w-full max-w-[280px]">
            <ProductCard
              product={SAMPLE_PREVIEW_PRODUCT}
              config={config}
              onAddToCart={() => alert('Add to cart clicked! (Testing card action)')}
              cartQuantity={1}
            />
          </div>

          <p className="text-[11px] text-slate-600 mt-4 text-center">
            Click the card to test its click-to-add action.
          </p>
        </div>

        {/* Customization Controls */}
        <div className="lg:col-span-7 space-y-4">
          {/* Layout Mode */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Card Layout Mode
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(['standard', 'compact', 'detailed', 'minimal'] as ProductCardLayout[]).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => onChangeConfig({ layout: mode })}
                  className={`py-2 px-2 rounded-lg text-xs font-bold border capitalize transition-all ${
                    config.layout === mode
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          {/* Visibility Toggles */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Element Visibility
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              <label className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 bg-slate-50/50 cursor-pointer hover:bg-slate-50 text-xs">
                <input
                  type="checkbox"
                  checked={config.showImage}
                  onChange={(e) => onChangeConfig({ showImage: e.target.checked })}
                  className="w-4 h-4 text-emerald-600 rounded border-slate-300"
                />
                <span className="font-semibold text-slate-700">Product Image</span>
              </label>

              <label className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 bg-slate-50/50 cursor-pointer hover:bg-slate-50 text-xs">
                <input
                  type="checkbox"
                  checked={config.showSku}
                  onChange={(e) => onChangeConfig({ showSku: e.target.checked })}
                  className="w-4 h-4 text-emerald-600 rounded border-slate-300"
                />
                <span className="font-semibold text-slate-700">SKU / Code</span>
              </label>

              <label className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 bg-slate-50/50 cursor-pointer hover:bg-slate-50 text-xs">
                <input
                  type="checkbox"
                  checked={config.showCategory}
                  onChange={(e) => onChangeConfig({ showCategory: e.target.checked })}
                  className="w-4 h-4 text-emerald-600 rounded border-slate-300"
                />
                <span className="font-semibold text-slate-700">Category Tag</span>
              </label>

              <label className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 bg-slate-50/50 cursor-pointer hover:bg-slate-50 text-xs">
                <input
                  type="checkbox"
                  checked={config.showStock}
                  onChange={(e) => onChangeConfig({ showStock: e.target.checked })}
                  className="w-4 h-4 text-emerald-600 rounded border-slate-300"
                />
                <span className="font-semibold text-slate-700">Stock Count</span>
              </label>

              <label className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 bg-slate-50/50 cursor-pointer hover:bg-slate-50 text-xs">
                <input
                  type="checkbox"
                  checked={config.showLowStockBadge}
                  onChange={(e) => onChangeConfig({ showLowStockBadge: e.target.checked })}
                  className="w-4 h-4 text-emerald-600 rounded border-slate-300"
                />
                <span className="font-semibold text-slate-700">Low Stock Badge</span>
              </label>

              <label className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 bg-slate-50/50 cursor-pointer hover:bg-slate-50 text-xs">
                <input
                  type="checkbox"
                  checked={config.showAddButton}
                  onChange={(e) => onChangeConfig({ showAddButton: e.target.checked })}
                  className="w-4 h-4 text-emerald-600 rounded border-slate-300"
                />
                <span className="font-semibold text-slate-700">Add (+) Button</span>
              </label>
            </div>
          </div>

          {/* Aspect Ratio and Image Position */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Image Aspect Ratio
              </label>
              <select
                value={config.imageAspectRatio}
                onChange={(e) => onChangeConfig({ imageAspectRatio: e.target.value as any })}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white font-medium"
              >
                <option value="square">1:1 Square</option>
                <option value="video">16:9 Video Wide</option>
                <option value="auto">Auto Height (h-28)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Image Position
              </label>
              <select
                value={config.imagePosition}
                onChange={(e) => onChangeConfig({ imagePosition: e.target.value as any })}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white font-medium"
              >
                <option value="top">Top (Standard)</option>
                <option value="left">Left (Horizontal row)</option>
              </select>
            </div>
          </div>

          {/* Styling: Border Radius, Shadow, Price Tag */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Corner Radius</label>
              <select
                value={config.borderRadius}
                onChange={(e) => onChangeConfig({ borderRadius: e.target.value as any })}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white font-medium"
              >
                <option value="none">Square (none)</option>
                <option value="sm">Small (rounded-sm)</option>
                <option value="md">Medium (rounded-md)</option>
                <option value="lg">Large (rounded-lg)</option>
                <option value="xl">Extra Large (rounded-xl)</option>
                <option value="2xl">2X Large (rounded-2xl)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Shadow</label>
              <select
                value={config.shadowStyle}
                onChange={(e) => onChangeConfig({ shadowStyle: e.target.value as any })}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white font-medium"
              >
                <option value="none">Flat (no shadow)</option>
                <option value="sm">Soft (shadow-xs)</option>
                <option value="md">Medium (shadow-sm)</option>
                <option value="lg">Elevated (shadow-md)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Price Tag Style</label>
              <select
                value={config.priceTagStyle}
                onChange={(e) => onChangeConfig({ priceTagStyle: e.target.value as any })}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white font-medium"
              >
                <option value="prominent">Prominent Green</option>
                <option value="pill">Dark Pill</option>
                <option value="badge">Subtle Badge</option>
                <option value="plain">Simple Text</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
