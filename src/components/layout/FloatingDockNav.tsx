import React from 'react';
import { 
  LayoutDashboard, Boxes, ShoppingBag, Users, Settings, Smartphone, Menu
} from 'lucide-react';
import { ActiveTab } from './Sidebar';
import { useERP } from '../../services/erpStore';

interface FloatingDockNavProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  onOpenMobileSidebar?: () => void;
  isMobileSidebarOpen?: boolean;
}

export const FloatingDockNav: React.FC<FloatingDockNavProps> = ({
  activeTab,
  onSelectTab,
  onOpenMobileSidebar,
  isMobileSidebarOpen
}) => {
  const { language, imeis, customers } = useERP();
  const inStockCount = imeis.filter(i => i.status === 'IN_STOCK').length;
  const dueCustomersCount = customers.filter(c => c.currentDue > 0).length;

  const dockItems: { id: ActiveTab; label: string; icon: React.FC<{ className?: string }>; badge?: number | string | null }[] = [
    {
      id: 'dashboard',
      label: language === 'bn' ? 'ড্যাশবোর্ড' : 'Dashboard',
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'inventory',
      label: language === 'bn' ? 'ইনভেন্টরি' : 'Inventory',
      icon: Boxes,
      badge: inStockCount > 0 ? inStockCount : null
    },
    {
      id: 'sales',
      label: language === 'bn' ? 'বিক্রয়' : 'Sales',
      icon: ShoppingBag,
      badge: null
    },
    {
      id: 'customers',
      label: language === 'bn' ? 'ডিলার ও কাস্টমার' : 'Dealers',
      icon: Users,
      badge: dueCustomersCount > 0 ? dueCustomersCount : null
    },
    {
      id: 'settings',
      label: language === 'bn' ? 'সেটিংস' : 'Settings',
      icon: Settings,
      badge: null
    }
  ];

  // Hide dock completely when the full mobile drawer is open
  if (isMobileSidebarOpen) {
    return null;
  }

  return (
    <div className="fixed bottom-3 sm:bottom-6 left-0 right-0 z-40 flex justify-center pointer-events-none px-2 sm:px-4">
      <nav 
        className="pointer-events-auto bg-white/95 backdrop-blur-2xl border border-slate-200/80 shadow-[0_12px_40px_rgba(15,23,42,0.12)] rounded-full px-2 py-1.5 sm:px-6 sm:py-2.5 flex items-center gap-0.5 sm:gap-2 transition-all duration-300 hover:shadow-[0_16px_50px_rgba(15,23,42,0.18)] max-w-[96vw] overflow-x-auto scrollbar-none"
        role="navigation"
        aria-label="Quick Dock Navigation"
      >
        {dockItems.map(item => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectTab(item.id)}
              className={`relative px-2.5 sm:px-4 py-1.5 rounded-full flex items-center gap-1.5 sm:gap-2 transition-all duration-300 font-bold text-xs cursor-pointer select-none active:scale-95 shrink-0 ${
                isActive
                  ? 'text-[#00B074] bg-[#00B074]/10 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/70'
              }`}
            >
              <div className="relative flex items-center justify-center">
                <Icon className={`w-4 h-4 transition-transform duration-200 ${isActive ? 'scale-110 text-[#00B074]' : 'text-slate-500'}`} />
                {item.badge !== null && (
                  <span className="absolute -top-1.5 -right-2 px-1 min-w-[14px] h-[14px] bg-[#1E60D5] text-white font-mono font-bold text-[9px] rounded-full flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className={`text-[11px] sm:text-xs tracking-tight ${isActive ? 'font-black' : 'font-semibold hidden md:inline'}`}>
                {item.label}
              </span>
              {isActive && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-[#00B074] rounded-full md:hidden" />
              )}
            </button>
          );
        })}

        {/* Mobile Full Sidebar Trigger Button */}
        {onOpenMobileSidebar && (
          <button
            type="button"
            onClick={onOpenMobileSidebar}
            className="md:hidden relative px-2.5 py-1.5 rounded-full flex items-center gap-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all font-bold text-xs cursor-pointer active:scale-95 shrink-0 border-l border-slate-200/80 ml-0.5 pl-2"
            title="সকল মেনু খুলুন"
          >
            <Menu className="w-4 h-4 text-[#00B074]" />
            <span className="text-[11px] font-bold">
              {language === 'bn' ? 'মেনু' : 'Menu'}
            </span>
          </button>
        )}
      </nav>
    </div>
  );
};
