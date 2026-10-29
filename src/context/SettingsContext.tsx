import React, { createContext, useContext, useState } from 'react';
import { ShopSettings } from '../types/settings';
import { ProductCardConfig } from '../types/product';
import { storage } from '../services/storage';

interface SettingsContextType {
  settings: ShopSettings;
  updateSettings: (newSettings: Partial<ShopSettings>) => void;
  updateProductCardConfig: (cardConfig: Partial<ProductCardConfig>) => void;
  resetSettings: () => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<ShopSettings>(() => storage.getSettings());

  const updateSettings = (newSettings: Partial<ShopSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      storage.saveSettings(updated);
      return updated;
    });
  };

  const updateProductCardConfig = (cardConfig: Partial<ProductCardConfig>) => {
    setSettings((prev) => {
      const updatedConfig = { ...prev.productCardConfig, ...cardConfig };
      const updated = { ...prev, productCardConfig: updatedConfig };
      storage.saveSettings(updated);
      return updated;
    });
  };

  const resetSettings = () => {
    storage.resetAllToDefaults();
    setSettings(storage.getSettings());
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        updateSettings,
        updateProductCardConfig,
        resetSettings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
