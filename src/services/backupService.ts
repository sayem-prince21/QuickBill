import { storage } from './storage';
import { BackupData } from '../types/settings';

const SAFETY_BACKUP_KEY = 'qb_pre_restore_safety_backup';

export const backupService = {
  createBackupObject(): BackupData {
    const settings = storage.getSettings();
    return {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      shopName: settings.shopName,
      products: storage.getProducts(),
      categories: storage.getCategories(),
      sales: storage.getSales(),
      stockMovements: storage.getStockMovements(),
      settings,
    };
  },

  downloadBackupFile(): void {
    const backupObj = this.createBackupObject();
    const jsonString = JSON.stringify(backupObj, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const d = new Date();
    const dateStr = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(
      d.getDate()
    ).padStart(2, '0')}_${String(d.getHours()).padStart(2, '0')}${String(d.getMinutes()).padStart(
      2,
      '0'
    )}`;
    const filename = `QuickBilling_Backup_${dateStr}.json`;

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  /**
   * Restores database from JSON string.
   * Creates an automated safety snapshot before overwriting!
   */
  restoreFromJson(jsonString: string): { success: boolean; message: string; details?: any } {
    try {
      const data: BackupData = JSON.parse(jsonString);

      // Validate structure
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid file format: Backup file must be a valid JSON object.');
      }

      if (!Array.isArray(data.products)) {
        throw new Error('Validation failed: Missing or invalid "products" array in backup.');
      }

      if (!Array.isArray(data.sales)) {
        throw new Error('Validation failed: Missing or invalid "sales" array in backup.');
      }

      // Safety step: create pre-restore snapshot of current database
      const currentSnapshot = this.createBackupObject();
      localStorage.setItem(SAFETY_BACKUP_KEY, JSON.stringify(currentSnapshot));

      // Apply restore safely
      storage.saveProducts(data.products);
      if (Array.isArray(data.categories)) {
        storage.saveCategories(data.categories);
      }
      storage.saveSales(data.sales);
      if (Array.isArray(data.stockMovements)) {
        storage.saveStockMovements(data.stockMovements);
      }
      if (data.settings && typeof data.settings === 'object') {
        storage.saveSettings(data.settings);
      }

      return {
        success: true,
        message: 'Backup restored successfully! A safety snapshot of your previous data was saved.',
        details: {
          productsCount: data.products.length,
          salesCount: data.sales.length,
          exportedAt: data.exportedAt,
        },
      };
    } catch (err: any) {
      return {
        success: false,
        message: `Restore failed: ${err.message || 'Corrupt or incompatible backup file.'}`,
      };
    }
  },

  hasSafetyBackup(): boolean {
    return !!localStorage.getItem(SAFETY_BACKUP_KEY);
  },

  restoreSafetyBackup(): { success: boolean; message: string } {
    const raw = localStorage.getItem(SAFETY_BACKUP_KEY);
    if (!raw) {
      return { success: false, message: 'No safety snapshot found.' };
    }
    return this.restoreFromJson(raw);
  },
};
