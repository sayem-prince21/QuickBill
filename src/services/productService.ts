import { storage } from './storage';
import { Product, Category } from '../types/product';

export const productService = {
  getAll(includeInactive = false): Product[] {
    const products = storage.getProducts();
    if (includeInactive) return products;
    return products.filter((p) => p.isActive);
  },

  getById(id: string): Product | undefined {
    return storage.getProducts().find((p) => p.id === id);
  },

  getBySku(sku: string): Product | undefined {
    return storage.getProducts().find((p) => p.sku.toLowerCase() === sku.toLowerCase());
  },

  create(productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Product {
    const products = storage.getProducts();
    // Validate SKU uniqueness
    const existing = products.find((p) => p.sku.toLowerCase() === productData.sku.trim().toLowerCase());
    if (existing) {
      throw new Error(`A product with SKU "${productData.sku}" already exists.`);
    }

    if (productData.sellingPrice < 0) {
      throw new Error('Selling price cannot be negative.');
    }
    if (productData.currentStock < 0) {
      throw new Error('Initial stock cannot be negative.');
    }

    const newProduct: Product = {
      ...productData,
      id: `prod-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      sku: productData.sku.trim().toUpperCase(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    products.unshift(newProduct);
    storage.saveProducts(products);

    // Record initial stock movement if > 0
    if (newProduct.currentStock > 0) {
      const movements = storage.getStockMovements();
      movements.unshift({
        id: `sm-${Date.now()}`,
        productId: newProduct.id,
        productName: newProduct.name,
        sku: newProduct.sku,
        movementType: 'InitialStock',
        quantityChange: newProduct.currentStock,
        previousStock: 0,
        newStock: newProduct.currentStock,
        reason: 'Initial product stock creation',
        timestamp: new Date().toISOString(),
      });
      storage.saveStockMovements(movements);
    }

    return newProduct;
  },

  update(id: string, updates: Partial<Omit<Product, 'id' | 'createdAt'>>): Product {
    const products = storage.getProducts();
    const index = products.findIndex((p) => p.id === id);
    if (index === -1) {
      throw new Error('Product not found.');
    }

    const current = products[index];

    // Check SKU uniqueness if changed
    if (updates.sku && updates.sku.toLowerCase() !== current.sku.toLowerCase()) {
      const duplicate = products.find(
        (p) => p.id !== id && p.sku.toLowerCase() === updates.sku!.trim().toLowerCase()
      );
      if (duplicate) {
        throw new Error(`Another product with SKU "${updates.sku}" already exists.`);
      }
    }

    if (updates.sellingPrice !== undefined && updates.sellingPrice < 0) {
      throw new Error('Selling price cannot be negative.');
    }

    const updatedProduct: Product = {
      ...current,
      ...updates,
      sku: updates.sku ? updates.sku.trim().toUpperCase() : current.sku,
      updatedAt: new Date().toISOString(),
    };

    products[index] = updatedProduct;
    storage.saveProducts(products);
    return updatedProduct;
  },

  // Permanent price update (differs from bill override)
  updatePermanentPrice(id: string, newPrice: number): Product {
    if (newPrice < 0) throw new Error('Price cannot be negative.');
    return this.update(id, { sellingPrice: newPrice });
  },

  // Toggle active/inactive status (Soft delete to preserve sales history)
  toggleActive(id: string): Product {
    const product = this.getById(id);
    if (!product) throw new Error('Product not found.');
    return this.update(id, { isActive: !product.isActive });
  },

  // Categories CRUD
  getCategories(): Category[] {
    const categories = storage.getCategories();
    const products = storage.getProducts();
    // compute count dynamically
    return categories.map((cat) => ({
      ...cat,
      itemCount: products.filter((p) => p.category.toLowerCase() === cat.name.toLowerCase()).length,
    }));
  },

  createCategory(name: string, color = 'emerald'): Category {
    const categories = storage.getCategories();
    const cleanName = name.trim();
    if (!cleanName) throw new Error('Category name cannot be empty.');

    const exists = categories.find((c) => c.name.toLowerCase() === cleanName.toLowerCase());
    if (exists) throw new Error(`Category "${cleanName}" already exists.`);

    const newCat: Category = {
      id: `cat-${Date.now()}`,
      name: cleanName,
      color,
    };
    categories.push(newCat);
    storage.saveCategories(categories);
    return newCat;
  },

  deleteCategory(id: string): void {
    const categories = storage.getCategories();
    const cat = categories.find((c) => c.id === id);
    if (!cat) return;

    // Check if products exist in category
    const products = storage.getProducts();
    const inUse = products.some((p) => p.category.toLowerCase() === cat.name.toLowerCase());
    if (inUse) {
      throw new Error(`Cannot delete category "${cat.name}" because products are currently assigned to it.`);
    }

    const filtered = categories.filter((c) => c.id !== id);
    storage.saveCategories(filtered);
  },
};
