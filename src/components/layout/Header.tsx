import React, { useState } from 'react';
import { 
  Search, Bell, Plus, Building2, UserCheck, Smartphone, 
  ChevronDown, Globe, Store, AlertTriangle, Menu, LogOut
} from 'lucide-react';
import { useERP } from '../../services/erpStore';
import { UserRole, BusinessType } from '../../types/erp';

interface HeaderProps {
  onToggleMobileSidebar: () => void;
  onOpenSearch: () => void;
  onOpenNewSale: () => void;
  onOpenNewPurchase: () => void;
  onOpenReceivePayment: () => void;
  onOpenPaySupplier: () => void;
  onOpenNewExpense: () => void;
  onOpenDailyClosing: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleMobileSidebar,
  onOpenSearch,
  onOpenNewSale,
  onOpenNewPurchase,
  onOpenReceivePayment,
  onOpenPaySupplier,
  onOpenNewExpense,
  onOpenDailyClosing
}) => {
  const {
    businessConfig,
    businessType,
    setBusinessType,
    currentUser,
    setCurrentUser,
    users,
    branches,
    currentBranchId,
    setCurrentBranchId,
    language,
    setLanguage,
    imeis,
    customers,
    warrantyClaims,
    logout
  } = useERP();

  const [showQuickMenu, setShowQuickMenu] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showBranchMenu, setShowBranchMenu] = useState(false);
  const [showBizMenu, setShowBizMenu] = useState(false);
  const [showNotificationMenu, setShowNotificationMenu] = useState(false);

  // Compute live notifications
  const lowStockCount = 2; // e.g. iPhone 16 Pro low stock
  const highDueCustomers = customers.filter(c => c.currentDue > 100000).length;
  const pendingWarranties = warrantyClaims.filter(w => w.status === 'PENDING' || w.status === 'IN_REPAIR').length;
  const totalNotifications = lowStockCount + highDueCustomers + pendingWarranties;

  return (
    <header className="h-16 bg-slate-900 text-white border-b border-slate-800 px-4 flex items-center justify-between sticky top-0 z-30 shadow-md">
      {/* Brand & Tagline */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Mobile Hamburger Drawer Toggle */}
        <button
          type="button"
          onClick={onToggleMobileSidebar}
          className="md:hidden p-2 -ml-1 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition flex items-center justify-center"
          title="Open Menu"
          aria-label="Toggle navigation drawer"
        >
          <Menu className="w-5 h-5 text-emerald-400" />
        </button>

        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-950/40 text-white font-black text-lg sm:text-xl tracking-tighter shrink-0">
          D
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-sm sm:text-base tracking-wide text-white">MOBILE D-ERP</span>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-1.5 py-0.5 rounded border border-emerald-500/30">
              BD v2.6
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
            {language === 'bn' ? 'মোবাইল ব্যবসার সম্পূর্ণ ডিজিটাল ব্যবস্থাপনা' : 'Specialized Mobile Retail & Wholesale ERP'}
          </p>
        </div>
      </div>

      {/* Global Search Bar (Trigger) */}
      <div className="flex-1 max-w-md mx-4 hidden md:block">
        <button
          onClick={onOpenSearch}
          className="w-full h-9 px-3 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 hover:border-slate-600 rounded-xl flex items-center justify-between text-xs text-slate-400 transition"
        >
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-emerald-400" />
            <span>{language === 'bn' ? 'IMEI / কাস্টমার / মেমো সার্চ করুন...' : 'Search IMEI, Customer, Invoice # (Ctrl+K)...'}</span>
          </div>
          <kbd className="px-1.5 py-0.5 text-[10px] bg-slate-700/70 text-slate-300 rounded border border-slate-600 font-mono">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Mobile Search Button */}
        <button
          onClick={onOpenSearch}
          className="md:hidden p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg"
          title="Search"
        >
          <Search className="w-4 h-4" />
        </button>

        {/* Business Type Selector */}
        <div className="relative">
          <button
            onClick={() => setShowBizMenu(!showBizMenu)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700/90 text-xs font-semibold rounded-lg text-emerald-400 border border-slate-700 transition"
            title="Switch Business Mode (Retail / Wholesale / Hybrid)"
          >
            <Store className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">
              {businessType === 'RETAIL' ? '🛒 Retail' : businessType === 'WHOLESALE' ? '🏢 Wholesale' : '⚡ Retail+Wholesale'}
            </span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {showBizMenu && (
            <div className="absolute right-0 mt-2 w-60 bg-slate-800 border border-slate-700 rounded-xl shadow-xl py-1 z-40 text-xs animate-in fade-in-50">
              <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-700">
                Business Mode (ব্যবসার ধরন)
              </div>
              <button
                onClick={() => { setBusinessType('RETAIL_WHOLESALE'); setShowBizMenu(false); }}
                className={`w-full text-left px-3 py-2 hover:bg-slate-700 flex flex-col ${businessType === 'RETAIL_WHOLESALE' ? 'text-emerald-400 font-bold bg-slate-700/40' : 'text-slate-200'}`}
              >
                <div className="flex items-center justify-between">
                  <span>⚡ Retail + Wholesale (Both)</span>
                  {businessType === 'RETAIL_WHOLESALE' && <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1 rounded">Active</span>}
                </div>
                <span className="text-[10px] text-slate-400">Full ERP with counter POS and dealer cartons</span>
              </button>
              <button
                onClick={() => { setBusinessType('WHOLESALE'); setShowBizMenu(false); }}
                className={`w-full text-left px-3 py-2 hover:bg-slate-700 flex flex-col ${businessType === 'WHOLESALE' ? 'text-emerald-400 font-bold bg-slate-700/40' : 'text-slate-200'}`}
              >
                <div className="flex items-center justify-between">
                  <span>🏢 Wholesale Dealer Mode</span>
                  {businessType === 'WHOLESALE' && <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1 rounded">Active</span>}
                </div>
                <span className="text-[10px] text-slate-400">Dealers, credit limits, quotations & master cartons</span>
              </button>
              <button
                onClick={() => { setBusinessType('RETAIL'); setShowBizMenu(false); }}
                className={`w-full text-left px-3 py-2 hover:bg-slate-700 flex flex-col ${businessType === 'RETAIL' ? 'text-emerald-400 font-bold bg-slate-700/40' : 'text-slate-200'}`}
              >
                <div className="flex items-center justify-between">
                  <span>🛒 Retail Shop Mode</span>
                  {businessType === 'RETAIL' && <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1 rounded">Active</span>}
                </div>
                <span className="text-[10px] text-slate-400">Single phone sales, counter cash & warranties</span>
              </button>
            </div>
          )}
        </div>

        {/* Operating Branch Selector */}
        <div className="relative">
          <button
            onClick={() => setShowBranchMenu(!showBranchMenu)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700/90 text-xs font-medium rounded-lg text-slate-200 border border-slate-700 transition"
            title="Filter by Operating Branch"
          >
            <Building2 className="w-3.5 h-3.5 text-blue-400" />
            <span className="max-w-[120px] truncate hidden md:inline">
              {currentBranchId === 'all' ? 'All Branches' : branches.find(b => b.id === currentBranchId)?.name.split(' ')[0]}
            </span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {showBranchMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-slate-800 border border-slate-700 rounded-xl shadow-xl py-1 z-40 text-xs animate-in fade-in-50">
              <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-700">
                Operating Branch (দোকানের শাখা)
              </div>
              <button
                onClick={() => { setCurrentBranchId('all'); setShowBranchMenu(false); }}
                className={`w-full text-left px-3 py-2 hover:bg-slate-700 flex items-center justify-between ${currentBranchId === 'all' ? 'text-blue-400 font-bold bg-slate-700/40' : 'text-slate-200'}`}
              >
                <span>🏛️ All Branches (Consolidated)</span>
                {currentBranchId === 'all' && <span className="text-[10px] bg-blue-500/20 text-blue-300 px-1 rounded">Active</span>}
              </button>
              {branches.map(b => (
                <button
                  key={b.id}
                  onClick={() => { setCurrentBranchId(b.id); setShowBranchMenu(false); }}
                  className={`w-full text-left px-3 py-2 hover:bg-slate-700 flex flex-col ${currentBranchId === b.id ? 'text-blue-400 font-bold bg-slate-700/40' : 'text-slate-200'}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">📍 {b.name}</span>
                    {currentBranchId === b.id && <span className="text-[10px] bg-blue-500/20 text-blue-300 px-1 rounded">Active</span>}
                  </div>
                  <span className="text-[10px] text-slate-400">{b.type} • {b.location.split(',')[0]}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Switch Role (RBAC Simulator) */}
        <div className="relative">
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700/90 text-xs font-medium rounded-lg text-amber-400 border border-slate-700 transition"
            title="Switch User Role (RBAC Simulator)"
          >
            <UserCheck className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden xl:inline">{currentUser.role}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {showRoleMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-slate-800 border border-slate-700 rounded-xl shadow-xl py-1 z-40 text-xs animate-in fade-in-50">
              <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-700">
                Switch Role (RBAC Simulator)
              </div>
              {users.map(u => (
                <button
                  key={u.id}
                  onClick={() => { setCurrentUser(u); setShowRoleMenu(false); }}
                  className={`w-full text-left px-3 py-2 hover:bg-slate-700 flex flex-col ${currentUser.id === u.id ? 'text-amber-400 font-bold bg-slate-700/40' : 'text-slate-200'}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{u.name}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-700 text-amber-300 font-mono">
                      {u.role}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400">
                    {u.role === 'Super Admin' || u.role === 'Business Owner' ? 'Full unrestricted access' :
                     u.role === 'Accountant' ? 'Accounts, sales, cash & ledgers' :
                     u.role === 'Salesman' ? 'POS, IMEI scanning, warranty' :
                     u.role === 'Store Keeper' ? 'Purchases, stock & suppliers' : 'Management permissions'}
                  </span>
                </button>
              ))}
              <div className="p-1 border-t border-slate-700/80 mt-1">
                <button
                  type="button"
                  onClick={() => {
                    setShowRoleMenu(false);
                    logout();
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-rose-500/20 text-rose-300 rounded-lg flex items-center gap-2 font-bold text-xs transition"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-400" />
                  <span>{language === 'bn' ? 'সিস্টেম থেকে লগআউট' : 'Sign Out / Logout'}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Language Toggle (Bangla / English) */}
        <button
          onClick={() => setLanguage(language === 'en' ? 'bn' : 'en')}
          className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-xs font-bold rounded-lg border border-slate-700 text-slate-300 flex items-center gap-1 transition"
          title="Toggle Language"
        >
          <Globe className="w-3.5 h-3.5 text-teal-400" />
          <span>{language === 'en' ? 'বাং' : 'EN'}</span>
        </button>

        {/* Direct Link to Sign In / Sign Up Screen */}
        <button
          onClick={() => {
            logout();
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600/90 hover:bg-rose-600 text-xs font-bold rounded-lg text-white shadow-xs transition active:scale-98"
          title={language === 'bn' ? 'লগআউট করে সাইন ইন পেজে যান' : 'Logout & Sign In'}
        >
          <LogOut className="w-3.5 h-3.5 text-white" />
          <span>{language === 'bn' ? 'লগআউট' : 'Logout'}</span>
        </button>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotificationMenu(!showNotificationMenu)}
            className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg relative"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {totalNotifications > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] font-black flex items-center justify-center animate-pulse">
                {totalNotifications}
              </span>
            )}
          </button>

          {showNotificationMenu && (
            <div className="absolute right-0 mt-2 w-72 bg-slate-800 border border-slate-700 rounded-xl shadow-xl py-2 z-40 text-xs animate-in fade-in-50">
              <div className="px-3 py-1 font-bold text-slate-300 border-b border-slate-700 flex items-center justify-between">
                <span>Business Alerts</span>
                <span className="text-[10px] bg-rose-500/20 text-rose-300 px-1.5 py-0.5 rounded">
                  {totalNotifications} New
                </span>
              </div>
              <div className="divide-y divide-slate-700/60 max-h-64 overflow-y-auto">
                <div className="p-2.5 hover:bg-slate-700/40">
                  <p className="font-semibold text-rose-300 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                    Customer Due Reminder
                  </p>
                  <p className="text-[11px] text-slate-300 mt-0.5">
                    Rahman Telecom has ৳1,45,000 due (over 7 days).
                  </p>
                </div>
                <div className="p-2.5 hover:bg-slate-700/40">
                  <p className="font-semibold text-amber-300 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                    Low Stock Alert
                  </p>
                  <p className="text-[11px] text-slate-300 mt-0.5">
                    iPhone 16 Pro Natural Titanium has only 2 units left.
                  </p>
                </div>
                <div className="p-2.5 hover:bg-slate-700/40">
                  <p className="font-semibold text-blue-300 flex items-center gap-1">
                    <Smartphone className="w-3.5 h-3.5 text-blue-400" />
                    Pending Warranty Claim
                  </p>
                  <p className="text-[11px] text-slate-300 mt-0.5">
                    Samsung S24 FE (IMEI: 864209061001242) is in repair.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quick Action Button */}
        <div className="relative">
          <button
            onClick={() => setShowQuickMenu(!showQuickMenu)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold rounded-lg shadow-md transition"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">{language === 'bn' ? 'নতুন হিসাব' : 'Quick Action'}</span>
            <ChevronDown className="w-3 h-3" />
          </button>

          {showQuickMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white text-slate-800 rounded-xl shadow-2xl border border-slate-200 py-1.5 z-40 text-xs animate-in fade-in-50">
              <button
                onClick={() => { onOpenNewSale(); setShowQuickMenu(false); }}
                className="w-full text-left px-3.5 py-2 hover:bg-emerald-50 font-semibold text-emerald-800 flex items-center gap-2"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                + {language === 'bn' ? 'নতুন মেমো / বিক্রি (Sale POS)' : 'New Sale / POS Invoice'}
              </button>
              <button
                onClick={() => { onOpenNewPurchase(); setShowQuickMenu(false); }}
                className="w-full text-left px-3.5 py-2 hover:bg-blue-50 font-semibold text-blue-800 flex items-center gap-2"
              >
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                + {language === 'bn' ? 'নতুন মাল ক্রয় (Purchase)' : 'New Purchase (With Landed Cost)'}
              </button>
              <button
                onClick={() => { onOpenReceivePayment(); setShowQuickMenu(false); }}
                className="w-full text-left px-3.5 py-2 hover:bg-violet-50 font-medium text-slate-700 flex items-center gap-2"
              >
                <span className="w-2 h-2 rounded-full bg-violet-500"></span>
                {language === 'bn' ? 'কাস্টমার বাকি আদায় (Collect Due)' : 'Receive Customer Due'}
              </button>
              <button
                onClick={() => { onOpenPaySupplier(); setShowQuickMenu(false); }}
                className="w-full text-left px-3.5 py-2 hover:bg-amber-50 font-medium text-slate-700 flex items-center gap-2"
              >
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                {language === 'bn' ? 'মহাজন/সাপ্লায়ার দেনা পরিশোধ' : 'Pay Supplier'}
              </button>
              <button
                onClick={() => { onOpenNewExpense(); setShowQuickMenu(false); }}
                className="w-full text-left px-3.5 py-2 hover:bg-rose-50 font-medium text-slate-700 flex items-center gap-2"
              >
                <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                {language === 'bn' ? 'দোকানের খরচ লিখুন (Expense)' : 'Add Expense'}
              </button>
              <div className="border-t border-slate-100 my-1"></div>
              <button
                onClick={() => { onOpenDailyClosing(); setShowQuickMenu(false); }}
                className="w-full text-left px-3.5 py-2 hover:bg-slate-100 font-semibold text-slate-900 flex items-center gap-2"
              >
                <span className="w-2 h-2 rounded-full bg-slate-700"></span>
                {language === 'bn' ? 'দিনের হিসাব ক্লোজিং (Daily Closing)' : 'Perform Daily Closing'}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
