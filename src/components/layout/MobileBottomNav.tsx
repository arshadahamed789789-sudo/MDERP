import React from 'react';
import { 
   LayoutDashboard, ShoppingCart, Smartphone, Boxes, Menu
} from 'lucide-react';
import { ActiveTab } from './Sidebar';
import { useERP } from '../../services/erpStore';

interface MobileBottomNavProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  onOpenMenu: () => void;
  onOpenNewSale: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onSelectTab,
  onOpenMenu,
  onOpenNewSale
}) => {
  const { language, imeis } = useERP();
  const inStockImeis = imeis.filter(i => i.status === 'IN_STOCK').length;

  const items = [
    {
      id: 'dashboard' as ActiveTab,
      label: language === 'bn' ? 'ড্যাশবোর্ড' : 'Home',
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'sales' as ActiveTab,
      label: language === 'bn' ? 'বিক্রয়' : 'Sales',
      icon: ShoppingCart,
      badge: null
    },
    {
      id: 'imei' as ActiveTab,
      label: language === 'bn' ? 'আইএমইআই' : 'IMEI',
      icon: Smartphone,
      badge: inStockImeis > 0 ? inStockImeis : null
    },
    {
      id: 'inventory' as ActiveTab,
      label: language === 'bn' ? 'স্টক' : 'Stock',
      icon: Boxes,
      badge: null
    }
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 px-1 py-1 flex items-center justify-around shadow-2xl">
      {items.map(item => {
        const isActive = activeTab === item.id;
        const Icon = item.icon;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelectTab(item.id)}
            className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all relative ${
              isActive 
                ? 'text-emerald-400 font-bold bg-slate-800/80' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="relative">
              <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400 stroke-[2.5]' : 'text-slate-400'}`} />
              {item.badge && (
                <span className="absolute -top-1.5 -right-3 px-1 min-w-[14px] h-[14px] bg-emerald-500 text-slate-950 font-black text-[9px] rounded-full flex items-center justify-center">
                  {item.badge}
                </span>
              )}
            </div>
            <span className="text-[10px] mt-1 tracking-tight leading-none">{item.label}</span>
          </button>
        );
      })}

      {/* More / Menu Drawer Toggle */}
      <button
        type="button"
        onClick={onOpenMenu}
        className="flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-xl text-slate-400 hover:text-slate-200 transition-all"
      >
        <Menu className="w-4 h-4 text-slate-400" />
        <span className="text-[10px] mt-1 tracking-tight leading-none">
          {language === 'bn' ? 'মেনু' : 'Menu'}
        </span>
      </button>
    </nav>
  );
};
