import React from 'react';
import { Product, ProductCardConfig } from '../../types/product';
import { ProductCard } from './ProductCard';
import { useCart } from '../../context/CartContext';
import { useSettings } from '../../context/SettingsContext';

interface ProductGridProps {
  products: Product[];
  onAddToCart?: (product: Product) => void;
  config?: ProductCardConfig;
  selectedProductId?: string;
  emptyMessage?: string;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  onAddToCart,
  config: propConfig,
  selectedProductId,
  emptyMessage = 'No products found matching your search.',
}) => {
  const { addItem, items } = useCart();
  const { settings } = useSettings();
  const config = propConfig || settings.productCardConfig;

  // Single centralized cart handler
  const handleAddToCart = (product: Product) => {
    if (onAddToCart) {
      onAddToCart(product);
    } else {
      addItem(product);
    }
  };

  // Map cart quantities for quick lookup
  const cartQtyMap = new Map<string, number>();
  for (const item of items) {
    cartQtyMap.set(item.product.id, item.quantity);
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-white rounded-xl border border-dashed border-slate-200">
        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 mb-3 text-lg font-bold">
          📦
        </div>
        <p className="text-slate-600 font-medium">{emptyMessage}</p>
        <p className="text-slate-600 text-xs mt-1">
          Try adjusting your search terms or category filters.
        </p>
      </div>
    );
  }

  // Dynamic grid classes based on configuration
  const gridClasses = (() => {
    if (config.layout === 'compact') {
      return 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5';
    }
    if (config.layout === 'detailed' || config.imagePosition === 'left') {
      return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5';
    }
    return 'grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3.5';
  })();

  return (
    <div className={gridClasses}>
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          config={config}
          onAddToCart={handleAddToCart}
          cartQuantity={cartQtyMap.get(product.id) || 0}
          isSelected={selectedProductId === product.id}
        />
      ))}
    </div>
  );
};
