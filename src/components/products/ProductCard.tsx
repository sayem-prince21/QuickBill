import React from 'react';
import { Product, ProductCardConfig } from '../../types/product';
import { useSettings } from '../../context/SettingsContext';
import { formatCurrency } from '../../config/ui.config';
import { Plus, AlertTriangle, XCircle, ShoppingCart } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  config?: ProductCardConfig;
  cartQuantity?: number;
  isSelected?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  config: propConfig,
  cartQuantity = 0,
  isSelected = false,
}) => {
  const { settings } = useSettings();
  const config = propConfig || settings.productCardConfig;

  const isOutOfStock = product.currentStock <= 0;
  const isLowStock = !isOutOfStock && product.currentStock <= product.lowStockThreshold;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isOutOfStock) {
      onAddToCart(product);
    }
  };

  // Determine border radius class
  const radiusClass = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    '2xl': 'rounded-2xl',
  }[config.borderRadius || 'lg'];

  // Determine shadow class
  const shadowClass = {
    none: 'shadow-none',
    sm: 'shadow-xs',
    md: 'shadow-sm',
    lg: 'shadow-md',
  }[config.shadowStyle || 'sm'];

  // Determine aspect ratio class
  const aspectClass = {
    square: 'aspect-square',
    video: 'aspect-video',
    auto: 'h-28',
  }[config.imageAspectRatio || 'square'];

  // Price tag styling
  const renderPrice = () => {
    const formatted = formatCurrency(product.sellingPrice, settings.currencySymbol);

    switch (config.priceTagStyle) {
      case 'prominent':
        return (
          <div className="flex items-baseline gap-1">
            <span className="text-base font-bold text-emerald-700 tracking-tight">
              {formatted}
            </span>
          </div>
        );
      case 'badge':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-800">
            {formatted}
          </span>
        );
      case 'pill':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-slate-900 text-white">
            {formatted}
          </span>
        );
      default:
        return (
          <span className="text-sm font-semibold text-slate-900">
            {formatted}
          </span>
        );
    }
  };

  // ----------------------------------------------------
  // LAYOUT 1: COMPACT (High-density retail barcode/touch mode)
  // ----------------------------------------------------
  if (config.layout === 'compact') {
    return (
      <div
        role="button"
        tabIndex={isOutOfStock ? -1 : 0}
        onClick={handleClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick(e as any);
          }
        }}
        className={`group relative flex flex-col justify-between p-2.5 bg-white border transition-all text-left select-none cursor-pointer ${radiusClass} ${shadowClass} ${
          isOutOfStock
            ? 'opacity-60 bg-slate-50 border-slate-200 cursor-not-allowed'
            : isSelected
            ? 'border-emerald-500 ring-2 ring-emerald-200 bg-emerald-50/20'
            : 'border-slate-200 hover:border-emerald-500 hover:shadow-md'
        }`}
      >
        <div className="flex items-start justify-between gap-1 mb-1.5">
          <span className="text-xs font-semibold text-slate-800 line-clamp-2 leading-tight">
            {product.name}
          </span>
          {cartQuantity > 0 && (
            <span className="shrink-0 bg-emerald-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {cartQuantity}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
          <div>{renderPrice()}</div>
          {config.showStock && (
            <span
              className={`text-[11px] font-medium ${
                isOutOfStock
                  ? 'text-rose-600 font-bold'
                  : isLowStock
                  ? 'text-amber-600 font-bold'
                  : 'text-slate-600'
              }`}
            >
              {isOutOfStock ? 'OUT' : `Stk: ${product.currentStock}`}
            </span>
          )}
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // LAYOUT 2: DETAILED (Horizontal card with image on left)
  // ----------------------------------------------------
  if (config.layout === 'detailed' || config.imagePosition === 'left') {
    return (
      <div
        role="button"
        tabIndex={isOutOfStock ? -1 : 0}
        onClick={handleClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick(e as any);
          }
        }}
        className={`group relative flex items-stretch p-3 bg-white border transition-all text-left select-none cursor-pointer gap-3 ${radiusClass} ${shadowClass} ${
          isOutOfStock
            ? 'opacity-60 bg-slate-50 border-slate-200 cursor-not-allowed'
            : 'border-slate-200 hover:border-emerald-500 hover:shadow-md'
        }`}
      >
        {config.showImage && (
          <div className="relative w-24 h-24 shrink-0 overflow-hidden rounded-lg bg-slate-100 flex items-center justify-center">
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                loading="lazy"
              />
            ) : (
              <div className="text-slate-600 text-xs font-medium">No Image</div>
            )}
            {cartQuantity > 0 && (
              <div className="absolute top-1 left-1 bg-emerald-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow">
                {cartQuantity} in cart
              </div>
            )}
          </div>
        )}

        <div className="flex-1 flex flex-col justify-between min-w-0">
          <div>
            <div className="flex items-center gap-1.5 flex-wrap mb-1">
              {config.showCategory && (
                <span className="text-[10px] font-medium uppercase tracking-wider text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                  {product.category}
                </span>
              )}
              {config.showSku && (
                <span className="text-[10px] font-mono text-slate-600">
                  {product.sku}
                </span>
              )}
            </div>

            <h4 className="text-sm font-semibold text-slate-900 truncate" title={product.name}>
              {product.name}
            </h4>

            {product.description && (
              <p className="text-xs text-slate-600 line-clamp-1 mt-0.5">{product.description}</p>
            )}
          </div>

          <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-100">
            <div>{renderPrice()}</div>

            <div className="flex items-center gap-2">
              {config.showStock && (
                <span
                  className={`text-xs ${
                    isOutOfStock
                      ? 'text-rose-600 font-bold'
                      : isLowStock
                      ? 'text-amber-600 font-medium'
                      : 'text-slate-600'
                  }`}
                >
                  {isOutOfStock ? 'Out of stock' : `${product.currentStock} left`}
                </span>
              )}

              {config.showAddButton && !isOutOfStock && (
                <button
                  type="button"
                  aria-label={`Add ${product.name} to cart`}
                  className="p-1 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // LAYOUT 3: STANDARD & MINIMAL (Vertical Card)
  // ----------------------------------------------------
  return (
    <div
      role="button"
      tabIndex={isOutOfStock ? -1 : 0}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick(e as any);
        }
      }}
      className={`group relative flex flex-col justify-between bg-white border transition-all text-left select-none overflow-hidden cursor-pointer ${radiusClass} ${shadowClass} ${
        config.hoverEffect ? 'hover:-translate-y-0.5 hover:shadow-md' : ''
      } ${
        isOutOfStock
          ? 'opacity-65 bg-slate-50 border-slate-200 cursor-not-allowed'
          : isSelected
          ? 'border-emerald-500 ring-2 ring-emerald-200'
          : 'border-slate-200 hover:border-emerald-500'
      }`}
    >
      {/* Top Media / Thumbnail */}
      {config.showImage && (
        <div className={`relative w-full ${aspectClass} overflow-hidden bg-slate-100`}>
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-600 text-xs font-medium">
              No Photo
            </div>
          )}

          {/* Badges on image */}
          <div className="absolute top-2 left-2 flex flex-col gap-1 items-start">
            {cartQuantity > 0 && (
              <span className="inline-flex items-center gap-1 bg-emerald-600 text-white text-[11px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                <ShoppingCart className="w-3 h-3" />
                {cartQuantity}
              </span>
            )}
            {config.showCategory && config.layout !== 'minimal' && (
              <span className="text-[10px] font-semibold bg-white/90 backdrop-blur-xs text-slate-700 px-1.5 py-0.5 rounded shadow-xs">
                {product.category}
              </span>
            )}
          </div>

          <div className="absolute top-2 right-2">
            {isOutOfStock ? (
              <span className="inline-flex items-center gap-1 bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
                <XCircle className="w-3 h-3" />
                Out of Stock
              </span>
            ) : isLowStock && config.showLowStockBadge ? (
              <span className="inline-flex items-center gap-1 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
                <AlertTriangle className="w-3 h-3" />
                {product.currentStock} left
              </span>
            ) : null}
          </div>
        </div>
      )}

      {/* Content Area */}
      <div className="p-3 flex-1 flex flex-col justify-between">
        <div>
          {/* Header row: SKU & Category if no image */}
          {(!config.showImage || config.layout === 'minimal') && (
            <div className="flex items-center justify-between text-[11px] text-slate-600 mb-1">
              {config.showSku && <span className="font-mono text-slate-600">{product.sku}</span>}
              {config.showCategory && <span>{product.category}</span>}
            </div>
          )}

          {config.showImage && config.showSku && (
            <div className="text-[10px] font-mono text-slate-600 mb-0.5">
              {product.sku}
            </div>
          )}

          <h4
            className="text-sm font-semibold text-slate-900 line-clamp-2 leading-snug group-hover:text-emerald-700 transition-colors"
            title={product.name}
          >
            {product.name}
          </h4>
        </div>

        {/* Footer: Price & Stock / Add button */}
        <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
          <div>{renderPrice()}</div>

          <div className="flex items-center gap-1.5">
            {config.showStock && !isOutOfStock && !isLowStock && (
              <span className="text-xs text-slate-600 font-medium">
                {product.currentStock} in stock
              </span>
            )}

            {config.showAddButton && (
              <button
                type="button"
                disabled={isOutOfStock}
                aria-label={`Add ${product.name} to cart`}
                className={`p-1.5 rounded-md transition-colors ${
                  isOutOfStock
                    ? 'bg-slate-100 text-slate-600 cursor-not-allowed'
                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white'
                }`}
              >
                <Plus className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
