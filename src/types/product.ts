export interface Category {
  id: string;
  name: string;
  color?: string;
  icon?: string;
  itemCount?: number;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  description?: string;
  sellingPrice: number;
  costPrice?: number;
  currentStock: number;
  lowStockThreshold: number;
  imageUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type ProductCardLayout = 'compact' | 'standard' | 'detailed' | 'minimal';

export interface ProductCardConfig {
  layout: ProductCardLayout;
  showImage: boolean;
  showSku: boolean;
  showStock: boolean;
  showCategory: boolean;
  showAddButton: boolean;
  showLowStockBadge: boolean;
  imageAspectRatio: 'square' | 'video' | 'auto';
  imagePosition: 'top' | 'left';
  borderRadius: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  shadowStyle: 'none' | 'sm' | 'md' | 'lg';
  fontSize: 'sm' | 'base' | 'lg';
  hoverEffect: boolean;
  priceTagStyle: 'pill' | 'badge' | 'plain' | 'prominent';
  gridColumns: {
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
}
