import React, { useState } from 'react';
import { 
  LayoutDashboard, ShoppingCart, Truck, Smartphone, Boxes, Users,
  Building, Landmark, Receipt, ShieldAlert, BookOpen,
  BarChart3, History, Settings, ChevronRight, X, LogOut,
  ChevronLeft, Sparkles, Shield, Search
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

interface NavItem {
  id: ActiveTab;
  label: string;
  icon: React.FC<{ className?: string }>;
  badge?: string | number | null;
  badgeColor?: string;
  roles: string[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  isOpen,
  onCloseMobile
}) => {
  const { language, currentUser, imeis, customers, warrantyClaims, logout } = useERP();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [menuFilter, setMenuFilter] = useState('');

  const inStockImeis = imeis.filter(i => i.status === 'IN_STOCK').length;
  const customersWithDue = customers.filter(c => c.currentDue > 0).length;
  const activeWarranties = warrantyClaims.filter(w => w.status === 'PENDING' || w.status === 'IN_REPAIR').length;

  const sections: { title: string; items: NavItem[] }[] = [
    {
      title: language === 'bn' ? 'প্রধান মেনু' : 'MAIN MENU',
      items: [
        {
          id: 'dashboard',
          label: language === 'bn' ? 'ড্যাশবোর্ড' : 'Dashboard',
          icon: LayoutDashboard,
          badge: null,
          roles: ['Super Admin', 'Business Owner', 'Manager', 'Accountant', 'Salesman', 'Store Keeper']
        },
        {
          id: 'sales',
          label: language === 'bn' ? 'বিক্রয় ও অর্ডার' : 'Sales & Orders',
          icon: ShoppingCart,
          badge: null,
          roles: ['Super Admin', 'Business Owner', 'Manager', 'Accountant', 'Salesman']
        },
        {
          id: 'inventory',
          label: language === 'bn' ? 'ইনভেন্টরি ও স্টক' : 'Inventory Management',
          icon: Boxes,
          badge: null,
          roles: ['Super Admin', 'Business Owner', 'Manager', 'Accountant', 'Salesman', 'Store Keeper']
        },
        {
          id: 'imei',
          label: language === 'bn' ? 'আইএমইআই ট্র্যাকার' : 'IMEI Tracking',
          icon: Smartphone,
          badge: inStockImeis > 0 ? `${inStockImeis}` : null,
          badgeColor: 'bg-emerald-100 text-emerald-700',
          roles: ['Super Admin', 'Business Owner', 'Manager', 'Accountant', 'Salesman', 'Store Keeper']
        },
        {
          id: 'purchase',
          label: language === 'bn' ? 'ক্রয় ও চালান' : 'Purchases & Inbound',
          icon: Truck,
          badge: null,
          roles: ['Super Admin', 'Business Owner', 'Manager', 'Accountant', 'Store Keeper']
        }
      ]
    },
    {
      title: language === 'bn' ? 'ডিলার ও কাস্টমার' : 'DEALERS & CUSTOMERS',
      items: [
        {
          id: 'customers',
          label: language === 'bn' ? 'ডিলার ও গ্রাহক খতিয়ান' : 'Dealers & Customers',
          icon: Users,
          badge: customersWithDue > 0 ? `${customersWithDue} Due` : null,
          badgeColor: 'bg-amber-100 text-amber-800',
          roles: ['Super Admin', 'Business Owner', 'Manager', 'Accountant', 'Salesman']
        },
        {
          id: 'suppliers',
          label: language === 'bn' ? 'মহাজন / সাপ্লায়ার লেজার' : 'Suppliers & Vendors',
          icon: Building,
          badge: null,
          roles: ['Super Admin', 'Business Owner', 'Manager', 'Accountant', 'Store Keeper']
        },
        {
          id: 'warranty',
          label: language === 'bn' ? 'ওয়ারেন্টি ও সার্ভিসিং' : 'Warranty & Service',
          icon: ShieldAlert,
          badge: activeWarranties > 0 ? `${activeWarranties}` : null,
          badgeColor: 'bg-rose-100 text-rose-700',
          roles: ['Super Admin', 'Business Owner', 'Manager', 'Accountant', 'Salesman']
        }
      ]
    },
    {
      title: language === 'bn' ? 'হিসাব ও বিশ্লেষণ' : 'FINANCES & ANALYTICS',
      items: [
        {
          id: 'cashbank',
          label: language === 'bn' ? 'ক্যাশ, ব্যাংক ও ক্লোজিং' : 'Cash & Bank Accounts',
          icon: Landmark,
          badge: null,
          roles: ['Super Admin', 'Business Owner', 'Manager', 'Accountant']
        },
        {
          id: 'expenses',
          label: language === 'bn' ? 'দোকানের খরচ' : 'Shop Expenses',
          icon: Receipt,
          badge: null,
          roles: ['Super Admin', 'Business Owner', 'Manager', 'Accountant']
        },
        {
          id: 'accounting',
          label: language === 'bn' ? 'ডাবল-এন্ট্রি একাউন্টিং' : 'Accounting & P&L',
          icon: BookOpen,
          badge: null,
          roles: ['Super Admin', 'Business Owner', 'Manager', 'Accountant']
        },
        {
          id: 'reports',
          label: language === 'bn' ? 'রিপোর্ট ও অ্যানালিটিক্স' : 'Analytics & Reports',
          icon: BarChart3,
          badge: null,
          roles: ['Super Admin', 'Business Owner', 'Manager', 'Accountant']
        },
        {
          id: 'audit',
          label: language === 'bn' ? 'অডিট লগ' : 'Audit Logs',
          icon: History,
          badge: null,
          roles: ['Super Admin', 'Business Owner', 'Manager']
        }
      ]
    },
    {
      title: language === 'bn' ? 'সিস্টেম' : 'PREFERENCES',
      items: [
        {
          id: 'settings',
          label: language === 'bn' ? 'সিস্টেম সেটিংস ও ব্যাকআপ' : 'Settings & Backup',
          icon: Settings,
          badge: null,
          roles: ['Super Admin', 'Business Owner', 'Manager']
        }
      ]
    }
  ];

  return (
    <>
      {/* Mobile Backdrop with smooth blur */}
      {isOpen && (
        <div 
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-40 md:hidden animate-in fade-in-50"
        />
      )}

      {/* Main iPhone-Inspired Frosted Glass Sidebar (Fixed on Desktop with Scrollable Menu Items) */}
      <aside 
        className={`
          fixed md:sticky top-0 md:top-16 bottom-0 left-0 z-50 md:z-20
          h-full md:h-[calc(100vh-4rem)] md:shrink-0
          bg-white/85 backdrop-blur-2xl border-r border-slate-200/70 shadow-[4px_0_30px_rgba(15,23,42,0.03)]
          flex flex-col transition-all duration-300 ease-out select-none relative
          before:absolute before:inset-x-0 before:top-0 before:h-24 before:bg-gradient-to-b before:from-white/60 before:to-transparent before:pointer-events-none
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          ${isCollapsed ? 'w-20' : 'w-72 sm:w-64'}
        `}
      >
        {/* Mobile Header with brand & close */}
        <div className="md:hidden px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-white/90">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-[#00B074] to-[#00D2B4] flex items-center justify-center font-black text-white text-lg shadow-md shadow-emerald-500/20">
              D
            </div>
            <div>
              <span className="font-black text-sm tracking-tight text-slate-900">DEALERFLOW ERP</span>
              <p className="text-[10px] text-slate-400 font-semibold">Mobile Business Hub</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCloseMobile}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Desktop Collapse / Expand Header Toggle */}
        <div className="hidden md:flex items-center justify-between px-4 py-3 border-b border-slate-100/80">
          {!isCollapsed && (
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#00B074] animate-pulse" />
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                Dealerflow Menu
              </span>
            </div>
          )}
          <button
            type="button"
            onClick={() => setIsCollapsed(prev => !prev)}
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            className={`p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition duration-200 active:scale-90 ${isCollapsed ? 'mx-auto' : ''}`}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* iPhone-Style Menu Search / Filter Pill */}
        {!isCollapsed && (
          <div className="px-3 pt-2 pb-1">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder={language === 'bn' ? 'মেনু অনুসন্ধান করুন...' : 'Search menu items...'}
                value={menuFilter}
                onChange={(e) => setMenuFilter(e.target.value)}
                className="w-full text-[11px] pl-8 pr-6 py-1.5 bg-slate-100/80 hover:bg-slate-100 focus:bg-white border border-slate-200/80 focus:border-[#00B074]/60 rounded-xl outline-none transition font-medium text-slate-700 placeholder:text-slate-400"
              />
              {menuFilter && (
                <button
                  type="button"
                  onClick={() => setMenuFilter('')}
                  className="absolute right-2 top-2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Navigation Scrollable Area */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-5 scrollbar-thin scrollbar-thumb-slate-200">
          {sections.map((section, sIdx) => {
            // Filter items user has permission to see and matches search query
            const allowedItems = section.items
              .filter(item => item.roles.includes(currentUser.role))
              .filter(item => {
                if (!menuFilter.trim()) return true;
                const query = menuFilter.toLowerCase();
                return item.label.toLowerCase().includes(query) || item.id.toLowerCase().includes(query);
              });
            if (allowedItems.length === 0) return null;

            return (
              <div key={sIdx} className="space-y-1">
                {!isCollapsed && (
                  <h3 className="px-3 pb-1 text-[10px] font-black text-slate-400/90 tracking-wider uppercase">
                    {section.title}
                  </h3>
                )}

                {allowedItems.map(item => {
                  const isActive = activeTab === item.id;
                  const Icon = item.icon;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        onSelectTab(item.id);
                        if (onCloseMobile) onCloseMobile();
                      }}
                      title={isCollapsed ? item.label : undefined}
                      className={`
                        w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs font-bold
                        transition-all duration-200 group relative active:scale-[0.98] cursor-pointer
                        ${isCollapsed ? 'justify-center px-0' : 'justify-between'}
                        ${isActive 
                          ? 'bg-gradient-to-r from-[#00B074] to-[#009E68] text-white shadow-[0_6px_20px_rgba(0,176,116,0.3)] ring-1 ring-white/20' 
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'}
                      `}
                    >
                      <div className="flex items-center gap-3 truncate">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-transform duration-200 ${
                          isActive 
                            ? 'bg-white/20 text-white scale-105' 
                            : 'bg-slate-100/70 text-slate-500 group-hover:text-[#00B074] group-hover:bg-[#00B074]/10'
                        }`}>
                          <Icon className="w-4 h-4 shrink-0" />
                        </div>

                        {!isCollapsed && (
                          <span className={`truncate ${isActive ? 'font-black' : 'font-bold'}`}>
                            {item.label}
                          </span>
                        )}
                      </div>

                      {/* Right side Badge or indicator */}
                      {!isCollapsed && (
                        <div className="flex items-center gap-1.5 shrink-0">
                          {item.badge ? (
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold shadow-xs ${
                              isActive 
                                ? 'bg-white text-[#00B074]' 
                                : item.badgeColor || 'bg-slate-100 text-slate-600'
                            }`}>
                              {item.badge}
                            </span>
                          ) : (
                            isActive && <ChevronRight className="w-3.5 h-3.5 text-white/80" />
                          )}
                        </div>
                      )}

                      {/* Collapsed active mini dot */}
                      {isCollapsed && isActive && (
                        <span className="absolute right-1 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-white shadow-xs" />
                      )}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* iOS Frosted Glass User Card at bottom */}
        <div className="p-3 border-t border-slate-200/60 bg-white/70 backdrop-blur-xl">
          <div className={`flex items-center gap-2.5 ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="relative">
                <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-black text-white text-xs shrink-0 shadow-md shadow-indigo-500/20">
                  {currentUser.name.charAt(0)}
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white" />
              </div>

              {!isCollapsed && (
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-black text-slate-900 truncate tracking-tight">{currentUser.name}</p>
                  <span className="inline-block text-[10px] px-2 py-0.5 bg-slate-100 text-[#1E60D5] font-bold rounded-full truncate">
                    {currentUser.role}
                  </span>
                </div>
              )}
            </div>

            {!isCollapsed && (
              <button
                type="button"
                onClick={() => {
                  logout();
                  if (onCloseMobile) onCloseMobile();
                }}
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition duration-200 active:scale-95"
                title={language === 'bn' ? 'লগআউট করুন' : 'Sign Out'}
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
