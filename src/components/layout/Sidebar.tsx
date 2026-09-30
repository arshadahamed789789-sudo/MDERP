import React from 'react';
import { 
  LayoutDashboard, ShoppingCart, Truck, Smartphone, Boxes, Users,
  Building, Wallet, Landmark, Receipt, ShieldAlert, BookOpen,
  BarChart3, History, Settings, ChevronRight, X, LogOut
} from 'lucide-react';
import { useERP } from '../../services/erpStore';

export type ActiveTab = 
  | 'dashboard'
  | 'sales'
  | 'purchase'
  | 'imei'
  | 'inventory'
  | 'customers'
  | 'suppliers'
  | 'cashbank'
  | 'expenses'
  | 'warranty'
  | 'accounting'
  | 'reports'
  | 'audit'
  | 'settings';

interface SidebarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  isOpen: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  isOpen,
  onCloseMobile
}) => {
  const { language, currentUser, imeis, customers, warrantyClaims, logout } = useERP();

  const inStockImeis = imeis.filter(i => i.status === 'IN_STOCK').length;
  const customersWithDue = customers.filter(c => c.currentDue > 0).length;
  const activeWarranties = warrantyClaims.filter(w => w.status === 'PENDING' || w.status === 'IN_REPAIR').length;

  const navItems = [
    {
      id: 'dashboard' as ActiveTab,
      label: language === 'bn' ? 'ড্যাশবোর্ড' : 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
      roles: ['Super Admin', 'Business Owner', 'Manager', 'Accountant', 'Salesman', 'Store Keeper']
    },
    {
      id: 'sales' as ActiveTab,
      label: language === 'bn' ? 'বিক্রয় ও মেমো (Sales)' : 'Sales & POS',
      icon: ShoppingCart,
      badge: null,
      roles: ['Super Admin', 'Business Owner', 'Manager', 'Accountant', 'Salesman']
    },
    {
      id: 'purchase' as ActiveTab,
      label: language === 'bn' ? 'ক্রয় ও চালান (Purchase)' : 'Purchase & Landed Cost',
      icon: Truck,
      badge: null,
      roles: ['Super Admin', 'Business Owner', 'Manager', 'Accountant', 'Store Keeper']
    },
    {
      id: 'imei' as ActiveTab,
      label: language === 'bn' ? 'আইএমইআই ট্র্যাকার (IMEI)' : 'IMEI Tracking',
      icon: Smartphone,
      badge: inStockImeis > 0 ? `${inStockImeis} Stock` : null,
      roles: ['Super Admin', 'Business Owner', 'Manager', 'Accountant', 'Salesman', 'Store Keeper']
    },
    {
      id: 'inventory' as ActiveTab,
      label: language === 'bn' ? 'স্টক ও ব্রাঞ্চ ট্রান্সফার' : 'Stock & Transfers',
      icon: Boxes,
      badge: null,
      roles: ['Super Admin', 'Business Owner', 'Manager', 'Accountant', 'Salesman', 'Store Keeper']
    },
    {
      id: 'customers' as ActiveTab,
      label: language === 'bn' ? 'কাস্টমার ও বাকি খাতা' : 'Customers & Due',
      icon: Users,
      badge: customersWithDue > 0 ? `${customersWithDue} Due` : null,
      roles: ['Super Admin', 'Business Owner', 'Manager', 'Accountant', 'Salesman']
    },
    {
      id: 'suppliers' as ActiveTab,
      label: language === 'bn' ? 'মহাজন / সাপ্লায়ার লেজার' : 'Suppliers & Payables',
      icon: Building,
      badge: null,
      roles: ['Super Admin', 'Business Owner', 'Manager', 'Accountant', 'Store Keeper']
    },
    {
      id: 'cashbank' as ActiveTab,
      label: language === 'bn' ? 'ক্যাশ, ব্যাংক ও ক্লোজিং' : 'Cash, Bank & Closing',
      icon: Landmark,
      badge: null,
      roles: ['Super Admin', 'Business Owner', 'Manager', 'Accountant']
    },
    {
      id: 'expenses' as ActiveTab,
      label: language === 'bn' ? 'দোকানের খরচ (Expenses)' : 'Shop Expenses',
      icon: Receipt,
      badge: null,
      roles: ['Super Admin', 'Business Owner', 'Manager', 'Accountant']
    },
    {
      id: 'warranty' as ActiveTab,
      label: language === 'bn' ? 'ওয়ারেন্টি ও ক্লেইম' : 'Warranty & Service',
      icon: ShieldAlert,
      badge: activeWarranties > 0 ? `${activeWarranties} Act` : null,
      roles: ['Super Admin', 'Business Owner', 'Manager', 'Accountant', 'Salesman']
    },
    {
      id: 'accounting' as ActiveTab,
      label: language === 'bn' ? 'ডাবল-এন্ট্রি একাউন্টিং' : 'Accounting & P&L',
      icon: BookOpen,
      badge: null,
      roles: ['Super Admin', 'Business Owner', 'Manager', 'Accountant']
    },
    {
      id: 'reports' as ActiveTab,
      label: language === 'bn' ? 'রিপোর্ট ও বিশ্লেষণ' : 'Reports & Analytics',
      icon: BarChart3,
      badge: null,
      roles: ['Super Admin', 'Business Owner', 'Manager', 'Accountant']
    },
    {
      id: 'audit' as ActiveTab,
      label: language === 'bn' ? 'অডিট লগ (Audit Log)' : 'Audit Logs',
      icon: History,
      badge: null,
      roles: ['Super Admin', 'Business Owner', 'Manager']
    },
    {
      id: 'settings' as ActiveTab,
      label: language === 'bn' ? 'সিস্টেম সেটিংস' : 'Settings',
      icon: Settings,
      badge: null,
      roles: ['Super Admin', 'Business Owner', 'Manager']
    }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-40 md:hidden animate-in fade-in-50"
        />
      )}

      <aside className={`
        fixed md:static top-0 md:top-16 bottom-0 left-0 z-50 md:z-20
        w-72 sm:w-64 bg-slate-900 text-slate-300 border-r border-slate-800
        flex flex-col transition-transform duration-200 ease-in-out shadow-2xl md:shadow-none
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Mobile Header with Close button */}
        <div className="md:hidden px-4 py-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center font-black text-white text-base">
              D
            </div>
            <div>
              <span className="font-extrabold text-sm text-white">MOBILE D-ERP</span>
              <p className="text-[10px] text-emerald-400 font-medium">Navigation Menu</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCloseMobile}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
          {navItems.map(item => {
            const hasPermission = item.roles.includes(currentUser.role);
            if (!hasPermission) return null;

            const isActive = activeTab === item.id;
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  if (onCloseMobile) onCloseMobile();
                }}
                className={`
                  w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold
                  transition-all group
                  ${isActive 
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/30' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'}
                `}
              >
                <div className="flex items-center gap-3 truncate">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-emerald-400'}`} />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge ? (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold ${
                    isActive ? 'bg-emerald-700 text-white' : 'bg-slate-800 text-emerald-400 border border-emerald-500/20'
                  }`}>
                    {item.badge}
                  </span>
                ) : (
                  isActive && <ChevronRight className="w-3.5 h-3.5 text-emerald-200" />
                )}
              </button>
            );
          })}
        </div>

        {/* User Card & Logout at bottom */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/60 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-emerald-700 flex items-center justify-center font-bold text-white text-xs shrink-0 shadow-sm">
                {currentUser.name.charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-200 truncate">{currentUser.name}</p>
                <p className="text-[10px] text-emerald-400 font-medium truncate">{currentUser.role}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                if (window.confirm(language === 'bn' ? 'আপনি কি নিশ্চিত যে আপনি লগআউট করতে চান?' : 'Are you sure you want to log out?')) {
                  logout();
                  if (onCloseMobile) onCloseMobile();
                }
              }}
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition shrink-0"
              title={language === 'bn' ? 'লগআউট করুন' : 'Sign Out'}
              aria-label="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              if (window.confirm(language === 'bn' ? 'আপনি কি নিশ্চিত যে আপনি লগআউট করতে চান?' : 'Are you sure you want to log out?')) {
                logout();
                if (onCloseMobile) onCloseMobile();
              }
            }}
            className="w-full py-1.5 px-2 bg-slate-800/80 hover:bg-rose-600 hover:text-white text-slate-300 rounded-lg text-[11px] font-semibold transition flex items-center justify-center gap-1.5 group border border-slate-700/60"
          >
            <LogOut className="w-3.5 h-3.5 text-slate-400 group-hover:text-white transition" />
            <span>{language === 'bn' ? 'লগআউট (Sign Out)' : 'Sign Out / Logout'}</span>
          </button>
        </div>
      </aside>
    </>
  );
};
