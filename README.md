# QuickBilling - Offline Quick Billing & Mini POS Desktop Application

A complete, production-oriented, offline-first Quick Billing and Mini POS desktop application for retail shops and grocery superstores. Designed to run completely standalone on Windows 10/11 64-bit with a local database, zero internet requirement, customizable product cards, transactional billing, stock tracking, sales register, Excel reporting, and Inno Setup installer packaging.

---

## 1. Architectural Overview & Separation of Responsibilities

```
QuickBilling/
├── QuickBilling.sln                             # Visual Studio Solution
├── src/
│   ├── components/                              # Reusable React UI components
│   │   ├── products/
│   │   │   ├── ProductCard.tsx                  # Core customizable card (Section 5)
│   │   │   ├── ProductGrid.tsx                  # Dynamic responsive grid
│   │   │   ├── ProductFormModal.tsx             # Product CRUD & SKU generator
│   │   │   └── ProductCardPreview.tsx           # Live interactive customizer
│   │   ├── billing/
│   │   │   ├── CartPanel.tsx                    # Persistent cart & price override
│   │   │   ├── CheckoutModal.tsx                # Payment selection & change due
│   │   │   └── ReceiptModal.tsx                 # Thermal (80mm/58mm) & A4 printable receipts
│   │   ├── sales/
│   │   │   ├── SaleDetailModal.tsx              # Snapshot audit of historical sold price
│   │   │   └── CancelSaleModal.tsx              # 1-time transactional stock restoration
│   │   ├── stock/
│   │   │   └── StockAdjustmentModal.tsx         # Add/subtract/set stock with reason
│   │   └── layout/
│   │       ├── Sidebar.tsx                      # Main navigation
│   │       └── TopBar.tsx                       # Live clock & offline status
│   ├── config/
│   │   ├── product-card.config.ts               # Layout presets (compact, standard, detailed, minimal)
│   │   └── ui.config.ts                         # Store defaults, currency formatters (BDT ৳)
│   ├── context/
│   │   ├── CartContext.tsx                      # Single centralized cart state
│   │   └── SettingsContext.tsx                  # Reactive settings & card customizer
│   ├── pages/                                   # All 10 required operational pages
│   │   ├── PosPage.tsx                          # Fast billing terminal (F2, F4 shortcuts)
│   │   ├── DashboardPage.tsx                    # Daily metrics, payment breakdown, top items
│   │   ├── ProductsPage.tsx                     # Catalog CRUD & soft-delete toggles
│   │   ├── CategoriesPage.tsx                   # Category grouping with safety checks
│   │   ├── InventoryPage.tsx                    # Stock health & movement audit trail
│   │   ├── SalesRegisterPage.tsx                # Historical invoices & reprint
│   │   ├── PaymentSummaryPage.tsx               # Cash, bKash, Nagad, Other MFS breakdown
│   │   ├── ReportsPage.tsx                      # 4-worksheet Excel export
│   │   ├── BackupRestorePage.tsx                # Disaster recovery & safety snapshots
│   │   ├── SettingsPage.tsx                     # Store identity & visual card customizer
│   │   └── DeploymentGuidePage.tsx              # Interactive Windows packaging guide
│   ├── services/                                # Business logic & persistence services
│   │   ├── billingService.ts                    # Transactional checkout & price snapshots
│   │   ├── productService.ts                    # Unique SKU validation & active toggles
│   │   ├── salesService.ts                      # Strict single-time cancellation & stock restore
│   │   ├── stockService.ts                      # Non-negative validation & movement log
│   │   ├── reportsService.ts                    # Metrics calculation excluding cancelled sales
│   │   ├── excelService.ts                      # Authentic multi-sheet .xlsx generation
│   │   ├── backupService.ts                     # Full JSON export with pre-restore guard
│   │   └── storage.ts                           # Offline-first persistence engine
│   └── dotnet/                                  # C# ASP.NET Core & SQLite backend solution
│       ├── QuickBilling.Domain/                 # Entities, enums, domain rules
│       ├── QuickBilling.Infrastructure/         # EF Core SQLite DbContext
│       ├── QuickBilling.Application/            # ClosedXML Excel service & DTOs
│       └── QuickBilling.Api/                    # Program.cs, loopback server, wwwroot host
├── installer/
│   ├── installer.iss                            # Inno Setup 6 compiler configuration
│   └── README.md                                # Installer instructions
└── scripts/
    └── publish-windows.ps1                      # Automated build & publish PowerShell script
```

---

## 2. Critical Requirement: Customizable Product Cards

Product cards can be customized without touching billing logic or modifying multiple components:
- **Centralized Config:** `src/config/product-card.config.ts`
- **Supported Layouts:**
  - `standard`: Balanced vertical card with thumbnail, SKU, price, stock, and add button.
  - `compact`: Ultra-dense barcode scanning mode for high-volume retail.
  - `detailed`: Horizontal row layout with media thumbnail on the left and full description.
  - `minimal`: Streamlined video-aspect layout.
- **Toggles & Flags:** `showImage`, `showSku`, `showStock`, `showCategory`, `showAddButton`, `showLowStockBadge`, `imagePosition` (top/left), `borderRadius`, `shadowStyle`, `priceTagStyle` (prominent green, dark pill, subtle badge, plain text).
- **Interactive Customizer:** Visit the **Settings** page in the application to visually toggle settings and observe live updates on the POS terminal in real time.

---

## 3. Billing & Pricing Rules

- **Price Snapshotting:** Every sale item stores the exact `unitPrice` charged at the time of sale. If a store manager updates the permanent product price later, all previous invoices and reports continue to show the historical sold price.
- **Bill-Specific Price Overrides:** Cashiers can click any price in the cart to set a temporary price override. This applies only to that specific sale line and does **not** change the master product price.
- **Atomic Stock Checks:** The checkout transaction validates that every line item has sufficient stock before committing changes. If any item has insufficient stock, the transaction fails with an informative error.
- **Sale Cancellation:** Cancelling an invoice restores stock to inventory **strictly once**, marks the sale as Cancelled, records a mandatory reason for auditing, and excludes the invoice from completed payment summaries.

---

## 4. Multi-Worksheet Offline Excel Export (Section 15)

Clicking **Export Excel** generates an authentic Microsoft Excel `.xlsx` workbook locally with 4 worksheets:
1. **Sales Register:** Invoice Number, Sale Date & Time, Customer Name, Payment Method, Subtotal, Discount, VAT, Total, and Status.
2. **Sale Items:** Invoice Number, Product Name, SKU, Category, Quantity, Sold Unit Price, Price Overridden flag, Line Total.
3. **Payment Summary:** Cash, bKash, Nagad, Other MFS breakdown with Bill Count, Total Amount, and Share of Revenue %.
4. **Stock Report:** Product Name, SKU, Category, Current Stock, Selling Price, Cost Price, Low Stock Threshold, Health Status.

---

## 5. Local Database Backup & Safety Snapshot (Section 16)

- **Backup:** Downloads a full standalone JSON archive of all products, stock levels, categories, invoices, and settings.
- **Pre-Restore Safety Guard:** When restoring an archive, QuickBilling creates an internal safety snapshot before overwriting the active database. If an accidental restore occurs, click **Revert Snapshot** to undo.

---

## 6. How to Build `QuickBilling-Setup.exe` for Windows

### Build Machine Requirements:
- Windows 10 or 11 (64-bit)
- Node.js 18+
- .NET 8.0 SDK
- Inno Setup 6

### Build Steps:
1. Open PowerShell in the project directory:
   ```powershell
   .\scripts\publish-windows.ps1
   ```
2. The script compiles the React frontend, copies the bundle into ASP.NET Core `wwwroot`, publishes a self-contained single-file x64 binary, and compiles the Inno Setup installer.
3. Your final installer will be located at:
   ```
   installer\output\QuickBilling-Setup.exe
   ```

### User Data Preservation:
The SQLite database is stored at:
```
%LOCALAPPDATA%\QuickBilling\quickbilling.db
```
When updating the application or running the uninstaller, customer data and historical sales are preserved by default.
