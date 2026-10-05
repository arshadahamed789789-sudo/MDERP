import React, { useState } from 'react';
import { 
  Search, Bell, Plus, Building2, UserCheck, Smartphone, 
  ChevronDown, Globe, Store, AlertTriangle, Menu, LogOut,
  Sparkles, Check, Boxes, ShieldAlert, CreditCard, ArrowRight, CheckCheck, X, Clock
} from 'lucide-react';
import { useERP } from '../../services/erpStore';
import { UserRole, BusinessType } from '../../types/erp';
import { formatBDT } from '../../utils/formatters';

interface HeaderProps {
  onToggleMobileSidebar: () => void;
  onOpenSearch: () => void;
  onOpenNewSale: () => void;
  onOpenNewPurchase: () => void;
  onOpenReceivePayment: () => void;
  onOpenPaySupplier: () => void;
  onOpenNewExpense: () => void;
  onOpenDailyClosing: () => void;
  onOpenRegisterWarranty?: () => void;
  onNavigateTab?: (tab: any) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleMobileSidebar,
  onOpenSearch,
  onOpenNewSale,
  onOpenNewPurchase,
  onOpenReceivePayment,
  onOpenPaySupplier,
  onOpenNewExpense,
  onOpenDailyClosing,
  onOpenRegisterWarranty,
  onNavigateTab
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
    products,
    customers,
    suppliers,
    warrantyClaims,
    logout
  } = useERP();

  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showBranchMenu, setShowBranchMenu] = useState(false);
  const [showBizMenu, setShowBizMenu] = useState(false);
  const [showNotificationMenu, setShowNotificationMenu] = useState(false);
  const [notifFilter, setNotifFilter] = useState<'ALL' | 'LOW_STOCK' | 'WARRANTY' | 'SUPPLIER'>('ALL');
  const [dismissedNotifIds, setDismissedNotifIds] = useState<string[]>([]);

  // 1. Low Stock Alerts (computed from products vs reorderLevel)
  const lowStockAlerts = products.flatMap(p => {
    const stock = p.variants.reduce((sum, v) => sum + (v.currentStock || 0), 0);
    const reorder = p.reorderLevel || 3;
    if (stock <= reorder) {
      return [{
        id: `stock-${p.id}`,
        category: 'LOW_STOCK' as const,
        title: `${p.model} (${p.brandName})`,
        message: language === 'bn' 
          ? `বর্তমান স্টক মাত্র ${stock} টি (রি-অর্ডার লেভেল: ${reorder})` 
          : `Stock at ${stock} units (below reorder level of ${reorder})`,
        badge: `${stock} in stock`,
        badgeColor: 'bg-rose-100 text-rose-700 border-rose-200',
        icon: Boxes,
        actionLabel: language === 'bn' ? 'স্টক যোগ করুন' : 'Reorder / Add Stock',
        onAction: () => {
          setShowNotificationMenu(false);
          onOpenNewPurchase();
        }
      }];
    }
    return [];
  });

  // 2. Pending Warranty Claims (PENDING or IN_REPAIR)
  const pendingWarrantyAlerts = warrantyClaims
    .filter(w => w.status === 'PENDING' || w.status === 'IN_REPAIR')
    .map(w => ({
      id: `warr-${w.id}`,
      category: 'WARRANTY' as const,
      title: `Claim #${w.claimNo} - ${w.customerName}`,
      message: `${w.problemDescription} (IMEI: ${w.imei})`,
      badge: w.status === 'PENDING' ? (language === 'bn' ? 'অনুমোদন বাকি' : 'Pending Claim') : (language === 'bn' ? 'সার্ভিস চলছে' : 'In Repair'),
      badgeColor: 'bg-purple-100 text-purple-700 border-purple-200',
      icon: ShieldAlert,
      actionLabel: language === 'bn' ? 'ওয়ারেন্টি খতিয়ান' : 'Inspect Ticket',
      onAction: () => {
        setShowNotificationMenu(false);
        if (onNavigateTab) onNavigateTab('warranty');
      }
    }));

  // 3. Upcoming Supplier Payment Deadlines & Payables
  const supplierPaymentAlerts = suppliers
    .filter(s => s.currentPayable > 0)
    .map(s => ({
      id: `supp-${s.id}`,
      category: 'SUPPLIER' as const,
      title: `${s.company} (${s.name})`,
      message: language === 'bn'
        ? `বকেয়া মহাজন পাওনা: ${formatBDT(s.currentPayable)}`
        : `Outstanding payable: ${formatBDT(s.currentPayable)}`,
      badge: formatBDT(s.currentPayable),
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
      icon: CreditCard,
      actionLabel: language === 'bn' ? 'পেমেন্ট করুন' : 'Pay Supplier',
      onAction: () => {
        setShowNotificationMenu(false);
        onOpenPaySupplier();
      }
    }));

  const allAlerts = [...lowStockAlerts, ...pendingWarrantyAlerts, ...supplierPaymentAlerts]
    .filter(item => !dismissedNotifIds.includes(item.id));

  const filteredAlerts = allAlerts.filter(item => {
    if (notifFilter === 'ALL') return true;
    return item.category === notifFilter;
  });

  const totalNotifications = allAlerts.length;

  return (
    <header className="h-16 bg-white/85 backdrop-blur-xl text-slate-900 border-b border-slate-200/70 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-[0_2px_20px_rgba(15,23,42,0.03)] select-none">
      {/* Brand & Breadcrumb */}
      <div className="flex items-center gap-3">
        {/* Mobile Hamburger Drawer Toggle */}
        <button
          type="button"
          onClick={onToggleMobileSidebar}
          className="md:hidden p-2 -ml-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition flex items-center justify-center"
          title="Open Menu"
          aria-label="Toggle navigation drawer"
        >
          <Menu className="w-5 h-5 text-[#00B074]" />
        </button>

        {/* DEALERFLOW ERP Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-[#00B074] to-[#00D2B4] flex items-center justify-center shadow-md shadow-emerald-500/20 text-white font-black text-xl tracking-tighter shrink-0">
            D
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-sm sm:text-base tracking-tight text-slate-900">
                DEALERFLOW ERP
              </span>
              <span className="text-[10px] bg-[#00B074]/15 text-[#00B074] font-black px-2 py-0.5 rounded-full border border-[#00B074]/20 hidden sm:inline-block">
                Pro
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium hidden lg:block">
              {language === 'bn' ? 'মোবাইল শোরুম ও ডিলারশিপ ম্যানেজমেন্ট' : 'Mobile Showroom & Dealer Management'}
            </p>
          </div>
        </div>
      </div>

      {/* Global Search Bar (Trigger) */}
      <div className="flex-1 max-w-md mx-4 hidden md:block">
        <button
          type="button"
          onClick={onOpenSearch}
          className="w-full h-10 px-4 bg-slate-100/80 hover:bg-slate-100 border border-slate-200/80 hover:border-slate-300 rounded-full flex items-center justify-between text-xs text-slate-500 transition shadow-inner-xs cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <Search className="w-4 h-4 text-slate-400" />
            <span className="font-medium">
              {language === 'bn' ? 'আইএমইআই, বিক্রয় চালান, কাস্টমার খুঁজুন...' : 'Search IMEI, Customer, Invoice # (Ctrl+K)...'}
            </span>
          </div>
          <kbd className="px-2 py-0.5 text-[10px] bg-white text-slate-500 rounded-full border border-slate-200 font-mono shadow-2xs">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Mobile Search Button */}
        <button
          type="button"
          onClick={onOpenSearch}
          className="md:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl"
          title="Search"
        >
          <Search className="w-4 h-4" />
        </button>

        {/* Business Type Selector Pill */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowBizMenu(!showBizMenu)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100/90 hover:bg-slate-200/80 text-xs font-bold rounded-full text-slate-700 border border-slate-200/80 transition"
            title="Switch Business Mode (Retail / Wholesale / Hybrid)"
          >
            <Store className="w-3.5 h-3.5 text-[#00B074]" />
            <span className="hidden sm:inline">
              {businessType === 'RETAIL' ? 'Retail' : businessType === 'WHOLESALE' ? 'Wholesale' : 'Retail+Wholesale'}
            </span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {showBizMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-40 text-xs animate-in fade-in-50">
              <div className="px-4 py-1 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                Business Mode (ব্যবসার ধরন)
              </div>
              <button
                type="button"
                onClick={() => { setBusinessType('RETAIL_WHOLESALE'); setShowBizMenu(false); }}
                className={`w-full text-left px-4 py-2 hover:bg-slate-50 flex flex-col ${businessType === 'RETAIL_WHOLESALE' ? 'text-[#00B074] font-bold bg-[#00B074]/5' : 'text-slate-700'}`}
              >
                <div className="flex items-center justify-between">
                  <span>⚡ Retail + Wholesale (Both)</span>
                  {businessType === 'RETAIL_WHOLESALE' && <span className="text-[10px] bg-emerald-100 text-[#00B074] px-1.5 py-0.5 rounded font-bold">Active</span>}
                </div>
                <span className="text-[10px] text-slate-400">Full ERP with counter POS and dealer cartons</span>
              </button>
              <button
                type="button"
                onClick={() => { setBusinessType('WHOLESALE'); setShowBizMenu(false); }}
                className={`w-full text-left px-4 py-2 hover:bg-slate-50 flex flex-col ${businessType === 'WHOLESALE' ? 'text-[#00B074] font-bold bg-[#00B074]/5' : 'text-slate-700'}`}
              >
                <div className="flex items-center justify-between">
                  <span>🏢 Wholesale Dealer Mode</span>
                  {businessType === 'WHOLESALE' && <span className="text-[10px] bg-emerald-100 text-[#00B074] px-1.5 py-0.5 rounded font-bold">Active</span>}
                </div>
                <span className="text-[10px] text-slate-400">Dealers, credit limits, quotations & master cartons</span>
              </button>
              <button
                type="button"
                onClick={() => { setBusinessType('RETAIL'); setShowBizMenu(false); }}
                className={`w-full text-left px-4 py-2 hover:bg-slate-50 flex flex-col ${businessType === 'RETAIL' ? 'text-[#00B074] font-bold bg-[#00B074]/5' : 'text-slate-700'}`}
              >
                <div className="flex items-center justify-between">
                  <span>🛒 Retail Shop Mode</span>
                  {businessType === 'RETAIL' && <span className="text-[10px] bg-emerald-100 text-[#00B074] px-1.5 py-0.5 rounded font-bold">Active</span>}
                </div>
                <span className="text-[10px] text-slate-400">Single phone sales, counter cash & warranties</span>
              </button>
            </div>
          )}
        </div>

        {/* Operating Branch Selector Pill */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowBranchMenu(!showBranchMenu)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100/90 hover:bg-slate-200/80 text-xs font-bold rounded-full text-slate-700 border border-slate-200/80 transition"
            title="Filter by Operating Branch"
          >
            <Building2 className="w-3.5 h-3.5 text-[#1E60D5]" />
            <span className="max-w-[120px] truncate hidden md:inline">
              {currentBranchId === 'all' ? 'All Branches' : branches.find(b => b.id === currentBranchId)?.name.split(' ')[0]}
            </span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {showBranchMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-40 text-xs animate-in fade-in-50">
              <div className="px-4 py-1 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                Operating Branch (দোকানের শাখা)
              </div>
              <button
                type="button"
                onClick={() => { setCurrentBranchId('all'); setShowBranchMenu(false); }}
                className={`w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center justify-between ${currentBranchId === 'all' ? 'text-[#1E60D5] font-bold bg-blue-50' : 'text-slate-700'}`}
              >
                <span>🏛️ All Branches (Consolidated)</span>
                {currentBranchId === 'all' && <span className="text-[10px] bg-blue-100 text-[#1E60D5] px-1.5 py-0.5 rounded font-bold">Active</span>}
              </button>
              {branches.map(b => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => { setCurrentBranchId(b.id); setShowBranchMenu(false); }}
                  className={`w-full text-left px-4 py-2 hover:bg-slate-50 flex flex-col ${currentBranchId === b.id ? 'text-[#1E60D5] font-bold bg-blue-50' : 'text-slate-700'}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">📍 {b.name}</span>
                    {currentBranchId === b.id && <span className="text-[10px] bg-blue-100 text-[#1E60D5] px-1.5 py-0.5 rounded font-bold">Active</span>}
                  </div>
                  <span className="text-[10px] text-slate-400">{b.type} • {b.location.split(',')[0]}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Switch Role (RBAC Simulator Pill) */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100/80 text-xs font-bold rounded-full text-amber-800 border border-amber-200/80 transition"
            title="Switch User Role (RBAC Simulator)"
          >
            <UserCheck className="w-3.5 h-3.5 text-amber-600" />
            <span className="hidden xl:inline">{currentUser.role}</span>
            <ChevronDown className="w-3 h-3 text-amber-600/70" />
          </button>

          {showRoleMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-40 text-xs animate-in fade-in-50">
              <div className="px-4 py-1 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                Switch Role (RBAC Simulator)
              </div>
              {users.map(u => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => { setCurrentUser(u); setShowRoleMenu(false); }}
                  className={`w-full text-left px-4 py-2 hover:bg-slate-50 flex flex-col ${currentUser.id === u.id ? 'text-amber-800 font-bold bg-amber-50/60' : 'text-slate-700'}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{u.name}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-mono">
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
              <div className="p-2 border-t border-slate-100 mt-1">
                <button
                  type="button"
                  onClick={() => {
                    setShowRoleMenu(false);
                    logout();
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-rose-50 text-rose-600 rounded-xl flex items-center gap-2 font-bold text-xs transition"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>{language === 'bn' ? 'সিস্টেম থেকে লগআউট' : 'Sign Out / Logout'}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Language Toggle (Bangla / English) */}
        <button
          type="button"
          onClick={() => setLanguage(language === 'en' ? 'bn' : 'en')}
          className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-xs font-bold rounded-full border border-slate-200/80 text-slate-700 flex items-center gap-1 transition"
          title="Toggle Language"
        >
          <Globe className="w-3.5 h-3.5 text-slate-500" />
          <span>{language === 'en' ? 'বাং' : 'EN'}</span>
        </button>

        {/* Notification Bell with live alerts */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowNotificationMenu(!showNotificationMenu)}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-full relative transition active:scale-95 cursor-pointer"
            title={language === 'bn' ? 'নোটিফিকেশন ও অ্যালার্ট' : 'Notifications & Alerts'}
            aria-label="Toggle notifications"
          >
            <Bell className="w-4 h-4" />
            {totalNotifications > 0 && (
              <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 px-1 bg-rose-500 text-white font-mono font-bold text-[9px] rounded-full flex items-center justify-center border-2 border-white shadow-xs animate-pulse">
                {totalNotifications}
              </span>
            )}
          </button>

          {showNotificationMenu && (
            <>
              {/* Invisible backdrop to dismiss */}
              <div 
                className="fixed inset-0 z-30" 
                onClick={() => setShowNotificationMenu(false)}
              />

              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200/90 rounded-3xl shadow-2xl py-3.5 z-40 text-xs animate-in fade-in-50 space-y-3">
                {/* Popover Header */}
                <div className="px-4 pb-2.5 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-sm text-slate-900 tracking-tight">
                      {language === 'bn' ? 'সিস্টেম অ্যালার্ট ও নোটিফিকেশন' : 'Alerts & Notifications'}
                    </span>
                    {totalNotifications > 0 && (
                      <span className="px-2 py-0.5 bg-rose-100 text-rose-700 rounded-full font-bold text-[10px]">
                        {totalNotifications}
                      </span>
                    )}
                  </div>
                  {totalNotifications > 0 && (
                    <button
                      type="button"
                      onClick={() => setDismissedNotifIds(allAlerts.map(a => a.id))}
                      className="text-[11px] font-bold text-slate-400 hover:text-slate-700 flex items-center gap-1 transition cursor-pointer"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      <span>{language === 'bn' ? 'সব ক্লিয়ার' : 'Clear All'}</span>
                    </button>
                  )}
                </div>

                {/* Filter Pills */}
                <div className="px-4 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px]">
                  <button
                    type="button"
                    onClick={() => setNotifFilter('ALL')}
                    className={`px-2.5 py-1 rounded-full font-bold transition whitespace-nowrap cursor-pointer ${
                      notifFilter === 'ALL' 
                        ? 'bg-slate-900 text-white' 
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    All ({allAlerts.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setNotifFilter('LOW_STOCK')}
                    className={`px-2.5 py-1 rounded-full font-bold transition whitespace-nowrap flex items-center gap-1 cursor-pointer ${
                      notifFilter === 'LOW_STOCK' 
                        ? 'bg-rose-600 text-white' 
                        : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                    }`}
                  >
                    <Boxes className="w-3 h-3" />
                    <span>Low Stock ({lowStockAlerts.length})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setNotifFilter('WARRANTY')}
                    className={`px-2.5 py-1 rounded-full font-bold transition whitespace-nowrap flex items-center gap-1 cursor-pointer ${
                      notifFilter === 'WARRANTY' 
                        ? 'bg-purple-600 text-white' 
                        : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
                    }`}
                  >
                    <ShieldAlert className="w-3 h-3" />
                    <span>Warranty ({pendingWarrantyAlerts.length})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setNotifFilter('SUPPLIER')}
                    className={`px-2.5 py-1 rounded-full font-bold transition whitespace-nowrap flex items-center gap-1 cursor-pointer ${
                      notifFilter === 'SUPPLIER' 
                        ? 'bg-amber-600 text-white' 
                        : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                    }`}
                  >
                    <CreditCard className="w-3 h-3" />
                    <span>Payables ({supplierPaymentAlerts.length})</span>
                  </button>
                </div>

                {/* Notifications List */}
                <div className="px-3 space-y-2 max-h-80 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-200">
                  {filteredAlerts.length === 0 ? (
                    <div className="py-8 text-center text-slate-400 space-y-1.5">
                      <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                        <CheckCheck className="w-5 h-5 text-emerald-500" />
                      </div>
                      <p className="font-bold text-xs text-slate-700">
                        {language === 'bn' ? 'কোনো নতুন অ্যালার্ট নেই!' : 'No new notifications'}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {language === 'bn' ? 'স্টক, ওয়ারেন্টি ও মহাজন দেনা নিয়ন্ত্রণে রয়েছে।' : 'Stock, warranties, and supplier accounts are up to date.'}
                      </p>
                    </div>
                  ) : (
                    filteredAlerts.map(alert => {
                      const Icon = alert.icon;
                      return (
                        <div 
                          key={alert.id}
                          className="p-3 bg-slate-50/80 hover:bg-slate-100/80 rounded-2xl border border-slate-200/70 transition space-y-2 group"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-start gap-2.5">
                              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                                alert.category === 'LOW_STOCK' ? 'bg-rose-100 text-rose-600' :
                                alert.category === 'WARRANTY' ? 'bg-purple-100 text-purple-600' :
                                'bg-amber-100 text-amber-700'
                              }`}>
                                <Icon className="w-4 h-4" />
                              </div>
                              <div>
                                <h4 className="font-black text-xs text-slate-900 tracking-tight leading-snug">
                                  {alert.title}
                                </h4>
                                <p className="text-[11px] text-slate-500 mt-0.5">
                                  {alert.message}
                                </p>
                              </div>
                            </div>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold font-mono shrink-0 border ${alert.badgeColor}`}>
                              {alert.badge}
                            </span>
                          </div>

                          <div className="flex items-center justify-between pt-1 border-t border-slate-200/50">
                            <button
                              type="button"
                              onClick={() => setDismissedNotifIds(prev => [...prev, alert.id])}
                              className="text-[10px] text-slate-400 hover:text-slate-600 font-semibold cursor-pointer"
                            >
                              {language === 'bn' ? 'বাদ দিন' : 'Dismiss'}
                            </button>

                            <button
                              type="button"
                              onClick={alert.onAction}
                              className="px-2.5 py-1 bg-white hover:bg-slate-900 hover:text-white border border-slate-200 rounded-xl text-[11px] font-bold text-slate-800 transition flex items-center gap-1 shadow-2xs active:scale-95 cursor-pointer"
                            >
                              <span>{alert.actionLabel}</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* User Profile Avatar Circle */}
        <div className="relative pl-1">
          <div 
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-400 to-orange-500 p-0.5 cursor-pointer shadow-xs hover:scale-105 transition"
            title={`${currentUser.name} (${currentUser.role})`}
          >
            <div className="w-full h-full rounded-full bg-slate-900 text-white font-black text-xs flex items-center justify-center">
              {currentUser.name.charAt(0)}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
