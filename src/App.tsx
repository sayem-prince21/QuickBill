import React, { useState } from 'react';
import { SettingsProvider } from './context/SettingsContext';
import { CartProvider } from './context/CartContext';
import { Sidebar, AppPage } from './components/layout/Sidebar';
import { TopBar } from './components/layout/TopBar';

// Pages
import { PosPage } from './pages/PosPage';
import { DashboardPage } from './pages/DashboardPage';
import { ProductsPage } from './pages/ProductsPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { InventoryPage } from './pages/InventoryPage';
import { SalesRegisterPage } from './pages/SalesRegisterPage';
import { PaymentSummaryPage } from './pages/PaymentSummaryPage';
import { ReportsPage } from './pages/ReportsPage';
import { BackupRestorePage } from './pages/BackupRestorePage';
import { SettingsPage } from './pages/SettingsPage';
import { DeploymentGuidePage } from './pages/DeploymentGuidePage';

export default function App() {
  const [currentPage, setCurrentPage] = useState<AppPage>('pos');

  const renderPage = () => {
    switch (currentPage) {
      case 'pos':
        return <PosPage />;
      case 'dashboard':
        return <DashboardPage onNavigate={setCurrentPage} />;
      case 'products':
        return <ProductsPage />;
      case 'categories':
        return <CategoriesPage />;
      case 'inventory':
        return <InventoryPage />;
      case 'sales':
        return <SalesRegisterPage />;
      case 'payments':
        return <PaymentSummaryPage />;
      case 'reports':
        return <ReportsPage />;
      case 'backup':
        return <BackupRestorePage />;
      case 'settings':
        return <SettingsPage />;
      case 'deployment':
        return <DeploymentGuidePage />;
      default:
        return <PosPage />;
    }
  };

  return (
    <SettingsProvider>
      <CartProvider>
        <div className="flex h-screen w-screen overflow-hidden bg-slate-100 font-sans antialiased text-slate-800">
          {/* Main Sidebar */}
          <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            <TopBar currentPage={currentPage} onNavigate={setCurrentPage} />
            <main className="flex-1 flex overflow-hidden">{renderPage()}</main>
          </div>
        </div>
      </CartProvider>
    </SettingsProvider>
  );
}
