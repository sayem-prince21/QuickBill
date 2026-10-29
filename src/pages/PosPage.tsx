import React, { useState, useEffect, useRef } from 'react';
import { Product, Category } from '../types/product';
import { Sale, PaymentMethod } from '../types/sale';
import { productService } from '../services/productService';
import { ProductGrid } from '../components/products/ProductGrid';
import { CartPanel } from '../components/billing/CartPanel';
import { CheckoutModal } from '../components/billing/CheckoutModal';
import { ReceiptModal } from '../components/billing/ReceiptModal';
import { useCart } from '../context/CartContext';
import { Search, Barcode, Filter, CheckCircle2 } from 'lucide-react';

export const PosPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [preselectedPayment, setPreselectedPayment] = useState<PaymentMethod | undefined>(undefined);
  const [completedSale, setCompletedSale] = useState<Sale | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const { addItem, items } = useCart();

  const loadData = () => {
    setProducts(productService.getAll(false)); // active only
    setCategories(productService.getCategories());
  };

  useEffect(() => {
    loadData();
  }, []);

  // Keyboard shortcuts (F2 to focus search, F4 to open checkout)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F2') {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === 'F4' && items.length > 0) {
        e.preventDefault();
        setIsCheckoutOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [items]);

  // Barcode / SKU auto-enter handler
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      const match = products.find(
        (p) =>
          p.sku.toLowerCase() === searchQuery.trim().toLowerCase() ||
          p.name.toLowerCase() === searchQuery.trim().toLowerCase()
      );
      if (match) {
        const res = addItem(match);
        if (res.success) {
          showToast(`Added ${match.name}`);
          setSearchQuery('');
        } else if (res.message) {
          alert(res.message);
        }
      }
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const filteredProducts = products.filter((prod) => {
    const matchesCat =
      selectedCategory === 'All' || prod.category.toLowerCase() === selectedCategory.toLowerCase();
    const q = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !q || prod.name.toLowerCase().includes(q) || prod.sku.toLowerCase().includes(q);
    return matchesCat && matchesQuery;
  });

  const handleOpenCheckout = (payment?: PaymentMethod) => {
    setPreselectedPayment(payment);
    setIsCheckoutOpen(true);
  };

  const handleCheckoutSuccess = (sale: Sale) => {
    setIsCheckoutOpen(false);
    setCompletedSale(sale);
    setIsReceiptOpen(true);
    // Reload products to reflect freshly reduced stock
    loadData();
  };

  return (
    <div className="flex-1 flex overflow-hidden relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 bg-slate-900 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Catalog View (Left) */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-100/60 overflow-hidden">
        {/* Search & Category Filter Toolbar */}
        <div className="p-4 bg-white border-b border-slate-200 space-y-3">
          <div className="flex items-center gap-3">
            {/* Search Input */}
            <div className="flex-1 relative">
              <Search className="w-4 h-4 text-slate-600 absolute left-3 top-3 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search products by name or scan SKU barcode... (Press F2)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                className="w-full pl-9 pr-24 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
              <span className="absolute right-3 top-2.5 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-200 text-slate-600">
                F2
              </span>
            </div>

            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                Clear
              </button>
            )}
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setSelectedCategory('All')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === 'All'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              All Items ({products.length})
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.name)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                  selectedCategory.toLowerCase() === cat.name.toLowerCase()
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {cat.name} ({cat.itemCount || 0})
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable Product Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          <ProductGrid
            products={filteredProducts}
            onAddToCart={(prod) => {
              const res = addItem(prod);
              if (res.success) {
                showToast(`Added ${prod.name}`);
              } else if (res.message) {
                alert(res.message);
              }
            }}
          />
        </div>
      </div>

      {/* Persistent POS Cart Panel (Right) */}
      <div className="w-80 md:w-96 shrink-0 h-full">
        <CartPanel onOpenCheckout={handleOpenCheckout} />
      </div>

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onSuccess={handleCheckoutSuccess}
        initialPaymentMethod={preselectedPayment}
      />

      {/* Printable Receipt Modal */}
      <ReceiptModal
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        sale={completedSale}
      />
    </div>
  );
};
