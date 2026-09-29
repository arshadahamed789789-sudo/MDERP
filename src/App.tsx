import React, { useState, useEffect } from 'react';
import { ERPProvider, useERP } from './services/erpStore';
import { Header } from './components/layout/Header';
import { Sidebar, ActiveTab } from './components/layout/Sidebar';
import { GlobalSearchModal } from './components/layout/GlobalSearchModal';
import { DashboardOverview } from './components/dashboard/DashboardOverview';
import { SalesList } from './components/sales/SalesList';
import { NewSaleModal } from './components/sales/NewSaleModal';
import { InvoicePrintModal } from './components/sales/InvoicePrintModal';
import { PurchaseList } from './components/purchase/PurchaseList';
import { NewPurchaseModal } from './components/purchase/NewPurchaseModal';
import { ImeiManager } from './components/imei/ImeiManager';
import { InventoryManager } from './components/inventory/InventoryManager';
import { CustomerManager } from './components/customers/CustomerManager';
import { SupplierManager } from './components/suppliers/SupplierManager';
import { CashBankManager } from './components/cashbank/CashBankManager';
import { ExpenseManager } from './components/expenses/ExpenseManager';
import { WarrantyManager } from './components/warranty/WarrantyManager';
import { AccountingManager } from './components/accounting/AccountingManager';
import { ReportsManager } from './components/reports/ReportsManager';
import { AuditLogManager } from './components/audit/AuditLogManager';
import { SettingsManager } from './components/settings/SettingsManager';

const ERPAppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Modals
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNewSaleOpen, setIsNewSaleOpen] = useState(false);
  const [isNewPurchaseOpen, setIsNewPurchaseOpen] = useState(false);
  const [isNewExpenseOpen, setIsNewExpenseOpen] = useState(false);
  const [viewingInvoiceNo, setViewingInvoiceNo] = useState<string | null>(null);

  // Hotkey listener for Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* Top Header */}
      <Header
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenNewSale={() => setIsNewSaleOpen(true)}
        onOpenNewPurchase={() => setIsNewPurchaseOpen(true)}
        onOpenReceivePayment={() => setActiveTab('customers')}
        onOpenPaySupplier={() => setActiveTab('suppliers')}
        onOpenNewExpense={() => setIsNewExpenseOpen(true)}
        onOpenDailyClosing={() => setActiveTab('cashbank')}
      />

      {/* Main Workspace with Sidebar */}
      <div className="flex-1 flex overflow-hidden">
        {/* Navigation Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          isOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        {/* Content View Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {activeTab === 'dashboard' && (
            <DashboardOverview
              onOpenNewSale={() => setIsNewSaleOpen(true)}
              onOpenNewPurchase={() => setIsNewPurchaseOpen(true)}
              onOpenReceivePayment={() => setActiveTab('customers')}
              onOpenPaySupplier={() => setActiveTab('suppliers')}
              onOpenNewExpense={() => setIsNewExpenseOpen(true)}
              onOpenDailyClosing={() => setActiveTab('cashbank')}
              onViewInvoice={(invNo) => setViewingInvoiceNo(invNo)}
              onNavigateTab={(tab) => setActiveTab(tab)}
            />
          )}

          {activeTab === 'sales' && (
            <SalesList
              onOpenNewSale={() => setIsNewSaleOpen(true)}
              onViewInvoice={(invNo) => setViewingInvoiceNo(invNo)}
            />
          )}

          {activeTab === 'purchase' && (
            <PurchaseList
              onOpenNewPurchase={() => setIsNewPurchaseOpen(true)}
            />
          )}

          {activeTab === 'imei' && <ImeiManager />}

          {activeTab === 'inventory' && <InventoryManager />}

          {activeTab === 'customers' && <CustomerManager />}

          {activeTab === 'suppliers' && <SupplierManager />}

          {activeTab === 'cashbank' && <CashBankManager />}

          {activeTab === 'expenses' && <ExpenseManager />}

          {activeTab === 'warranty' && <WarrantyManager />}

          {activeTab === 'accounting' && <AccountingManager />}

          {activeTab === 'reports' && <ReportsManager />}

          {activeTab === 'audit' && <AuditLogManager />}

          {activeTab === 'settings' && <SettingsManager />}
        </main>
      </div>

      {/* Global Modals */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectImei={(imei) => {
          setActiveTab('imei');
        }}
        onSelectCustomer={(custId) => {
          setActiveTab('customers');
        }}
        onSelectInvoice={(invNo) => {
          setViewingInvoiceNo(invNo);
        }}
      />

      <NewSaleModal
        isOpen={isNewSaleOpen}
        onClose={() => setIsNewSaleOpen(false)}
        onSuccess={(invNo) => {
          setViewingInvoiceNo(invNo);
        }}
      />

      <NewPurchaseModal
        isOpen={isNewPurchaseOpen}
        onClose={() => setIsNewPurchaseOpen(false)}
        onSuccess={(purNo) => {
          setActiveTab('purchase');
        }}
      />

      <InvoicePrintModal
        invoiceNo={viewingInvoiceNo}
        onClose={() => setViewingInvoiceNo(null)}
      />
    </div>
  );
};

export default function App() {
  return (
    <ERPProvider>
      <ERPAppContent />
    </ERPProvider>
  );
}
