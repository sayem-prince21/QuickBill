import React, { useState } from 'react';
import { useSettings } from '../context/SettingsContext';
import { ProductCardPreview } from '../components/products/ProductCardPreview';
import { PRODUCT_CARD_PRESETS } from '../config/product-card.config';
import { ProductCardLayout } from '../types/product';
import { Store, Receipt, Settings as SettingsIcon, Check, CheckCircle2 } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { settings, updateSettings, updateProductCardConfig } = useSettings();

  const [shopName, setShopName] = useState(settings.shopName);
  const [tagline, setTagline] = useState(settings.tagline);
  const [address, setAddress] = useState(settings.address);
  const [phone, setPhone] = useState(settings.phone);
  const [email, setEmail] = useState(settings.email);
  const [currencySymbol, setCurrencySymbol] = useState(settings.currencySymbol);
  const [defaultLowStockThreshold, setDefaultLowStockThreshold] = useState(
    settings.defaultLowStockThreshold
  );
  const [receiptHeader, setReceiptHeader] = useState(settings.receiptHeader);
  const [receiptFooter, setReceiptFooter] = useState(settings.receiptFooter);
  const [receiptPaperSize, setReceiptPaperSize] = useState(settings.receiptPaperSize);
  const [defaultTaxRate, setDefaultTaxRate] = useState(settings.defaultTaxRate);

  const [saveToast, setSaveToast] = useState(false);

  const handleSaveShopSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      shopName: shopName.trim(),
      tagline: tagline.trim(),
      address: address.trim(),
      phone: phone.trim(),
      email: email.trim(),
      currencySymbol: currencySymbol.trim() || '৳',
      defaultLowStockThreshold: Number(defaultLowStockThreshold) || 5,
      receiptHeader: receiptHeader.trim(),
      receiptFooter: receiptFooter.trim(),
      receiptPaperSize,
      defaultTaxRate: Number(defaultTaxRate) || 0,
    });

    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2500);
  };

  const handleApplyPreset = (layout: ProductCardLayout) => {
    const preset = PRODUCT_CARD_PRESETS[layout];
    if (preset) {
      updateProductCardConfig(preset);
      setSaveToast(true);
      setTimeout(() => setSaveToast(false), 2000);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50 relative">
      {/* Toast */}
      {saveToast && (
        <div className="fixed top-6 right-6 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Settings saved successfully!</span>
        </div>
      )}

      {/* Header */}
      <div className="pb-2 border-b border-slate-200">
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Shop & POS Settings</h1>
        <p className="text-xs text-slate-600">
          Configure store identity, receipt layouts, currency display, and customize product card designs
        </p>
      </div>

      {/* Section 1: Product Card Customization (CRITICAL REQUIREMENT SECTION 5) */}
      <ProductCardPreview
        config={settings.productCardConfig}
        onChangeConfig={(newCfg) => {
          updateProductCardConfig(newCfg);
        }}
        onApplyPreset={handleApplyPreset}
      />

      {/* Section 2: Store Information Form */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100 mb-4">
          <Store className="w-4 h-4 text-emerald-600" />
          <h3 className="text-sm font-bold text-slate-900">Store Profile & Receipts</h3>
        </div>

        <form onSubmit={handleSaveShopSettings} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Store / Shop Name *</label>
              <input
                type="text"
                required
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Store Tagline / Slogan</label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number *</label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Currency Symbol * (e.g. ৳, $, €, £, ₹)
              </label>
              <input
                type="text"
                required
                value={currencySymbol}
                onChange={(e) => setCurrencySymbol(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold text-emerald-700 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Shop Address</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Default Low-Stock Threshold
              </label>
              <input
                type="number"
                min="1"
                value={defaultLowStockThreshold}
                onChange={(e) => setDefaultLowStockThreshold(parseInt(e.target.value, 10) || 5)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Default Sales Tax / VAT Rate (%)
              </label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={defaultTaxRate}
                onChange={(e) => setDefaultTaxRate(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Receipt Customization */}
          <div className="pt-2 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Receipt className="w-3.5 h-3.5 text-slate-600" />
              <span>Receipt Printing Customization</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Default Receipt Paper Format
                </label>
                <select
                  value={receiptPaperSize}
                  onChange={(e) => setReceiptPaperSize(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-medium bg-white"
                >
                  <option value="80mm">Thermal 80mm (Standard POS roll)</option>
                  <option value="58mm">Thermal 58mm (Compact roll)</option>
                  <option value="A4">A4 Full Page Invoice</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Receipt Header Text</label>
                <input
                  type="text"
                  value={receiptHeader}
                  onChange={(e) => setReceiptHeader(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Receipt Footer Note</label>
                <textarea
                  rows={2}
                  value={receiptFooter}
                  onChange={(e) => setReceiptFooter(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-xl text-xs font-medium"
                />
              </div>
            </div>
          </div>

          <div className="pt-3 flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-2 transition-all"
            >
              <Check className="w-4 h-4" />
              <span>Save All Settings</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
