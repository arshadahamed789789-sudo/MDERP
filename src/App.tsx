import React, { useState, useEffect } from 'react';
import { ERPProvider, useERP } from './services/erpStore';
import { Header } from './components/layout/Header';
import { Sidebar, ActiveTab } from './components/layout/Sidebar';
import { GlobalSearchModal } from './components/layout/GlobalSearchModal';
import { MobileBottomNav } from './components/layout/MobileBottomNav';
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
import { NewExpenseModal } from './components/expenses/NewExpenseModal';
import { WarrantyManager } from './components/warranty/WarrantyManager';
import { AccountingManager } from './components/accounting/AccountingManager';
import { ReportsManager } from './components/reports/ReportsManager';
import { AuditLogManager } from './components/audit/AuditLogManager';
import { SettingsManager } from './components/settings/SettingsManager';
import { AuthScreen } from './components/auth/AuthScreen';

import { UserRole } from './types/erp';
import { ShieldAlert, UserCheck, ArrowRight } from 'lucide-react';

const ROLE_TAB_PERMISSIONS: Record<UserRole, ActiveTab[]> = {
  'Super Admin': ['dashboard', 'sales', 'purchase', 'imei', 'inventory', 'customers', 'suppliers', 'cashbank', 'expenses', 'warranty', 'accounting', 'reports', 'audit', 'settings'],
  'Business Owner': ['dashboard', 'sales', 'purchase', 'imei', 'inventory', 'customers', 'suppliers', 'cashbank', 'expenses', 'warranty', 'accounting', 'reports', 'audit', 'settings'],
  'Manager': ['dashboard', 'sales', 'purchase', 'imei', 'inventory', 'customers', 'suppliers', 'cashbank', 'expenses', 'warranty', 'accounting', 'reports', 'audit', 'settings'],
  'Accountant': ['dashboard', 'sales', 'purchase', 'customers', 'suppliers', 'cashbank', 'expenses', 'accounting', 'reports'],
  'Salesman': ['dashboard', 'sales', 'imei', 'inventory', 'customers', 'warranty'],
  'Store Keeper': ['dashboard', 'purchase', 'imei', 'inventory', 'suppliers']
};

const ERPAppContent: React.FC = () => {
  const { currentUser, setCurrentUser, users, language, isAuthenticated } = useERP();
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Modals
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNewSaleOpen, setIsNewSaleOpen] = useState(false);
  const [isNewPurchaseOpen, setIsNewPurchaseOpen] = useState(false);
  const [isNewExpenseOpen, setIsNewExpenseOpen] = useState(false);
  const [viewingInvoiceNo, setViewingInvoiceNo] = useState<string | null>(null);
  const [selectedImeiSearch, setSelectedImeiSearch] = useState<string>('');

  // Auto-redirect if switched role does not have permission for activeTab
  useEffect(() => {
    if (!isAuthenticated) return;
    const allowed = ROLE_TAB_PERMISSIONS[currentUser.role] || ['dashboard'];
    if (!allowed.includes(activeTab)) {
      setActiveTab('dashboard');
    }
  }, [currentUser.role, isAuthenticated, activeTab]);

  // Hotkey listener for Ctrl+K / Cmd+K
  useEffect(() => {
    if (!isAuthenticated) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAuthenticated]);

  // If not authenticated, display the Sign In / Sign Up portal
  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* Top Header */}
      <Header
        onToggleMobileSidebar={() => setIsMobileSidebarOpen(prev => !prev)}
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
        <main className="flex-1 overflow-y-auto p-3 sm:p-6 lg:p-8 pb-24 md:pb-8 space-y-4">
          {/* RBAC Role Simulator Banner (if not Super Admin) */}
          {currentUser.role !== 'Super Admin' && (
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center justify-between gap-3 text-xs text-amber-900 animate-in fade-in-50">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0">
                  <UserCheck className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="font-bold">
                    {language === 'bn' ? 'রোল সিমুলেটর সক্রিয়:' : 'RBAC Simulator Active:'}
                  </span>{' '}
                  <span>
                    {currentUser.name} (<strong>{currentUser.role}</strong>)
                  </span>
                  <span className="text-[11px] text-amber-700 block sm:inline sm:ml-2">
                    • {language === 'bn' ? 'মেনু এবং অনুমোদন এই রোলের উপর কার্যকর' : 'Permissions & menus restricted to this role'}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  const superAdmin = users.find(u => u.role === 'Super Admin') || users[0];
                  setCurrentUser(superAdmin);
                }}
                className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-[11px] font-bold shrink-0 transition"
              >
                {language === 'bn' ? 'অ্যাডমিন রিস্টোর' : 'Reset to Admin'}
              </button>
            </div>
          )}

          {!ROLE_TAB_PERMISSIONS[currentUser.role]?.includes(activeTab) ? (
            <div className="bg-white p-8 rounded-2xl border border-rose-200 text-center space-y-4 max-w-lg mx-auto my-12 shadow-sm">
              <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h2 className="text-base font-bold text-slate-900">
                {language === 'bn' ? 'অ্যাক্সেস সীমাবদ্ধ (Access Restricted)' : 'Access Restricted by Role'}
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                {language === 'bn' 
                  ? `আপনার বর্তমান ভূমিকা (${currentUser.role}) এই মডিউলটি দেখার অনুমতি প্রাপ্ত নয়। অ্যাডমিন বা ম্যানেজারের সাথে যোগাযোগ করুন।`
                  : `Your active role (${currentUser.role}) is not authorized to access this module under company security policy.`}
              </p>
              <div className="flex items-center justify-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('dashboard')}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition"
                >
                  {language === 'bn' ? 'ড্যাশবোর্ডে ফিরুন' : 'Return to Dashboard'}
                </button>
              </div>
            </div>
          ) : (
            <>
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

          {activeTab === 'imei' && <ImeiManager initialSearchQuery={selectedImeiSearch} />}

          {activeTab === 'inventory' && <InventoryManager />}

          {activeTab === 'customers' && <CustomerManager />}

          {activeTab === 'suppliers' && <SupplierManager />}

          {activeTab === 'cashbank' && <CashBankManager />}

          {activeTab === 'expenses' && (
            <ExpenseManager 
              onOpenNewExpense={() => setIsNewExpenseOpen(true)}
            />
          )}

          {activeTab === 'warranty' && <WarrantyManager />}

          {activeTab === 'accounting' && <AccountingManager />}

          {activeTab === 'reports' && <ReportsManager />}

          {activeTab === 'audit' && <AuditLogManager />}

          {activeTab === 'settings' && <SettingsManager />}
            </>
          )}
        </main>
      </div>

      {/* Mobile Sticky Bottom Navigation Bar */}
      <MobileBottomNav
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenMenu={() => setIsMobileSidebarOpen(true)}
        onOpenNewSale={() => setIsNewSaleOpen(true)}
      />

      {/* Global Modals */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectImei={(imei) => {
          setSelectedImeiSearch(imei);
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

      <NewExpenseModal
        isOpen={isNewExpenseOpen}
        onClose={() => setIsNewExpenseOpen(false)}
        onSuccess={() => {
          setActiveTab('expenses');
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
