import React, { useState } from 'react';
import { 
  TrendingUp, ShoppingBag, Truck, Users, Building, Wallet,
  Landmark, AlertTriangle, ArrowUpRight, ArrowDownRight,
  Plus, Smartphone, CheckCircle, Clock, ShieldCheck, ChevronRight,
  ClipboardList, PackagePlus, UserCog, FileBarChart, Wrench, Shield,
  ArrowRight, Sparkles, Filter, Receipt, FileText, Zap, ShieldAlert, Boxes
} from 'lucide-react';
import { useERP } from '../../services/erpStore';
import { formatBDT, formatDate } from '../../utils/formatters';
import { RealtimePerformanceMetrics } from './RealtimePerformanceMetrics';
import { ShareExportButtons } from '../common/ShareExportButtons';

interface DashboardOverviewProps {
  onOpenNewSale: () => void;
  onOpenNewPurchase: () => void;
  onOpenReceivePayment: () => void;
  onOpenPaySupplier: () => void;
  onOpenNewExpense: () => void;
  onOpenDailyClosing: () => void;
  onOpenRegisterWarranty: () => void;
  onOpenCreateLedgerEntry: (type?: 'CUSTOMER_PAYMENT' | 'SUPPLIER_PAYMENT') => void;
  onViewInvoice: (invoiceNo: string) => void;
  onNavigateTab: (tab: any) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  onOpenNewSale,
  onOpenNewPurchase,
  onOpenReceivePayment,
  onOpenPaySupplier,
  onOpenNewExpense,
  onOpenDailyClosing,
  onOpenRegisterWarranty,
  onOpenCreateLedgerEntry,
  onViewInvoice,
  onNavigateTab
}) => {
  const { 
    businessConfig, language, sales, purchases, customers, suppliers, 
    cashAccounts, bankAccounts, imeis, products, expenses,
    currentBranchName, currentBranchId, users, warrantyClaims
  } = useERP();

  const [dateFilter, setDateFilter] = useState<'today' | 'week' | 'month' | 'all'>('month');

  // Filter sales based on branch if not all
  const filteredSales = currentBranchId === 'all' 
    ? sales 
    : sales.filter(s => s.branchId === currentBranchId);

  // Financial aggregates
  const totalSalesRevenue = filteredSales.reduce((acc, s) => acc + s.grandTotal, 0);
  const totalGrossProfit = filteredSales.reduce((acc, s) => acc + s.grossProfit, 0);
  const totalCustomerDue = customers.reduce((acc, c) => acc + c.currentDue, 0);
  const totalSupplierDue = suppliers.reduce((acc, s) => acc + s.currentPayable, 0);

  const inStockImeisList = imeis.filter(i => 
    i.status === 'IN_STOCK' && (currentBranchId === 'all' || i.branchId === currentBranchId)
  );

  const totalAccessoryStock = products.reduce((acc, p) => 
    acc + p.variants.reduce((vSum, v) => vSum + (v.currentStock || 0), 0), 0
  );

  const totalUnits = inStockImeisList.length + totalAccessoryStock;

  // Filter today's sales
  const todayStr = new Date().toISOString().split('T')[0];
  const todaySalesList = filteredSales.filter(s => s.date === todayStr);
  const todaySalesRevenue = todaySalesList.reduce((acc, s) => acc + s.grandTotal, 0);

  // Low stock products count
  const lowStockProducts = products.filter(p => {
    const stock = p.variants.reduce((sum, v) => sum + v.currentStock, 0);
    return stock <= (p.reorderLevel || 3);
  });

  // Recent 5 sales
  const recentSales = filteredSales.slice(0, 5);

  // Top agents (from users or salesmen)
  const topSalesAgents = users.slice(0, 3).map((u, i) => {
    const scores = [460, 352, 333];
    const amounts = [125000, 85000, 62000];
    return {
      user: u,
      score: scores[i] || 300,
      salesTotal: amounts[i] || 50000,
      rank: i + 1
    };
  });

  // Executive Briefing for Owner / Admin Share
  const dashboardShareText = `📊 *${language === 'bn' ? 'ব্যবসায়িক এক্সিকিউটিভ সামারি' : 'Executive Business Briefing'}*\n🏛️ *${businessConfig?.name || 'DEALERFLOW ERP'}* (${currentBranchName})\n📅 ${language === 'bn' ? 'তারিখ' : 'Date'}: ${new Date().toLocaleDateString('en-US', { dateStyle: 'medium' })}\n\n💰 *${language === 'bn' ? 'আর্থিক বিবরণ' : 'Financials'}:*\n• ${language === 'bn' ? 'মোট বিক্রয়' : 'Total Sales'}: ${formatBDT(totalSalesRevenue)}\n• ${language === 'bn' ? 'গ্রস প্রফিট' : 'Gross Profit'}: ${formatBDT(totalGrossProfit)}\n• ${language === 'bn' ? 'কাস্টমার বকেয়া' : 'Customer Dues'}: ${formatBDT(totalCustomerDue)}\n• ${language === 'bn' ? 'মহাজন পাওনা' : 'Supplier Payable'}: ${formatBDT(totalSupplierDue)}\n\n📦 *${language === 'bn' ? 'স্টক ও অপারেশন' : 'Inventory & Ops'}:*\n• ${language === 'bn' ? 'মোট ফোন ও এক্সেসরিজ স্টক' : 'In-Stock Inventory'}: ${totalUnits} pcs\n• ${language === 'bn' ? 'লো-স্টক অ্যালার্ট' : 'Low Stock Items'}: ${lowStockProducts.length} items\n• ${language === 'bn' ? 'সার্ভিস টিকিট' : 'Pending Repairs'}: ${warrantyClaims.filter(w => w.status === 'PENDING').length} tickets\n\nGenerated via DEALERFLOW Hub.`;

  const dashboardCsvData = {
    filename: 'executive_briefing_summary',
    headers: ['Metric Name', 'Value / Amount (BDT)', 'Branch Scope', 'Note'],
    rows: [
      ['Sales Turnover', totalSalesRevenue, currentBranchName, 'Selected period'],
      ['Gross Profit', totalGrossProfit, currentBranchName, 'Realized margin'],
      ['Customer Outstanding Dues', totalCustomerDue, currentBranchName, 'Accounts Receivable'],
      ['Supplier Accounts Payable', totalSupplierDue, currentBranchName, 'Accounts Payable'],
      ['Total Units in Stock', totalUnits, currentBranchName, 'Handsets + Accessories'],
      ['Low Stock Alert Count', lowStockProducts.length, currentBranchName, 'Needs Reorder'],
      ['Pending Warranty Claims', warrantyClaims.filter(w => w.status === 'PENDING').length, currentBranchName, 'RMA Queue']
    ]
  };

  return (
    <div className="space-y-6 pb-20 select-none">
      {/* Top Header / Greeting Bar with Date Filter & Share Hub */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
              {language === 'bn' ? 'ড্যাশবোর্ড ওভারভিউ' : 'Dashboard Overview'}
            </h1>
            <span className="px-2.5 py-0.5 bg-[#00B074]/10 text-[#00B074] text-xs font-bold rounded-full border border-[#00B074]/20">
              {currentBranchName}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {language === 'bn' 
              ? 'মোবাইল শোরুম ও ডিলারশিপের রিয়েল-টাইম সেলস, স্টক ও পারফরম্যান্স মেট্রিক্স' 
              : 'Real-time sales, inventory valuation, and dealership operational metrics'}
          </p>
        </div>

        {/* Right side: Share/Export Hub + Date Filter Pills */}
        <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
          {/* Date Filter Pills */}
          <div className="flex items-center gap-1 bg-white p-1 rounded-full border border-slate-200/80 shadow-xs text-xs">
            {(['today', 'week', 'month', 'all'] as const).map(tab => (
              <button
                key={tab}
                type="button"
                onClick={() => setDateFilter(tab)}
                className={`px-3.5 py-1 rounded-full font-bold transition-all duration-200 cursor-pointer ${
                  dateFilter === tab 
                    ? 'bg-[#1E60D5] text-white shadow-xs' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {tab === 'today' ? (language === 'bn' ? 'আজ' : 'Today') :
                 tab === 'week' ? (language === 'bn' ? 'এই সপ্তাহ' : 'Week') :
                 tab === 'month' ? (language === 'bn' ? 'এই মাস' : 'Month') : 
                 (language === 'bn' ? 'সব সময়' : 'All Time')}
              </button>
            ))}
          </div>

          {/* Owner Executive Share & Export Button */}
          <ShareExportButtons
            title={language === 'bn' ? 'দৈনিক ব্যবসায়িক এক্সিকিউটিভ সামারি' : 'Executive Business Briefing'}
            subtitle={`${currentBranchName} • ${dateFilter.toUpperCase()}`}
            summaryMetrics={[
              { label: 'Sales Turnover', value: formatBDT(totalSalesRevenue) },
              { label: 'Gross Profit', value: formatBDT(totalGrossProfit) },
              { label: 'Receivables', value: formatBDT(totalCustomerDue) },
              { label: 'In Stock Units', value: `${totalUnits} pcs` }
            ]}
            shareText={dashboardShareText}
            csvData={dashboardCsvData}
          />
        </div>
      </div>

      {/* TOP 3 HERO CARDS (Exact match to Mockup Image 1 & Image 5) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* CARD 1: Total Sales with Emerald Wave Line Chart */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgba(15,23,42,0.04)] hover:shadow-[0_12px_40px_rgba(15,23,42,0.07)] transition-all duration-300 flex flex-col justify-between relative overflow-hidden group">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-500">Total Sales</span>
            <div className="flex items-baseline gap-2">
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                {formatBDT(totalSalesRevenue)}
              </h2>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#00B074]">
              <span>+12% this month</span>
            </div>
          </div>

          {/* Smooth Emerald Wave SVG Chart */}
          <div className="mt-4 h-28 w-full relative overflow-hidden">
            <svg viewBox="0 0 400 120" className="w-full h-full overflow-hidden" preserveAspectRatio="none">
              <defs>
                <linearGradient id="waveGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#00B074" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#00B074" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              {/* Shaded Area Under Spline */}
              <path
                d="M 0,90 Q 50,75 100,50 T 200,65 T 300,30 T 400,10 L 400,120 L 0,120 Z"
                fill="url(#waveGradient)"
              />
              {/* Main Wave Spline Line */}
              <path
                d="M 0,90 Q 50,75 100,50 T 200,65 T 300,30 T 400,10"
                fill="none"
                stroke="#00B074"
                strokeWidth="3.5"
                strokeLinecap="round"
                className="transition-all duration-500 group-hover:stroke-[4]"
              />
            </svg>
          </div>
        </div>

        {/* CARD 2: Inventory Stock with Multi-color Donut Chart & Low Stock Alert */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgba(15,23,42,0.04)] hover:shadow-[0_12px_40px_rgba(15,23,42,0.07)] transition-all duration-300 flex flex-col justify-between space-y-4">
          <div>
            <span className="text-xs font-bold text-slate-500">Inventory Stock</span>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight mt-0.5">
              {totalUnits} Units
            </h2>
          </div>

          {/* Donut Chart & Legend */}
          <div className="flex items-center justify-between gap-4 py-1">
            {/* SVG Donut */}
            <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                {/* Background Ring */}
                <circle cx="50" cy="50" r="38" fill="none" stroke="#F1F5F9" strokeWidth="16" />
                {/* Segment 1: Emerald Green (Smartphones) 50% */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="none"
                  stroke="#00B074"
                  strokeWidth="16"
                  strokeDasharray="120 240"
                  strokeDashoffset="0"
                />
                {/* Segment 2: Royal Blue (Gadgets) 30% */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="none"
                  stroke="#1E60D5"
                  strokeWidth="16"
                  strokeDasharray="70 240"
                  strokeDashoffset="-120"
                />
                {/* Segment 3: Warm Amber (Accessories) 20% */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="none"
                  stroke="#F59E0B"
                  strokeWidth="16"
                  strokeDasharray="50 240"
                  strokeDashoffset="-190"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xs font-black text-slate-800">{inStockImeisList.length}</span>
                <span className="text-[9px] text-slate-400 font-bold uppercase">IMEIs</span>
              </div>
            </div>

            {/* Legend */}
            <div className="space-y-2 text-xs font-bold text-slate-600 flex-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#00B074]" />
                <span className="truncate">Smartphones ({inStockImeisList.length})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#1E60D5]" />
                <span className="truncate">Feature Phones</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
                <span className="truncate">Accessories ({totalAccessoryStock})</span>
              </div>
            </div>
          </div>

          {/* Low Stock Alert Pill */}
          <div className="p-2.5 rounded-2xl bg-rose-50/80 border border-rose-200/60 text-rose-700 flex items-center justify-between text-xs font-bold">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>Low stock alert</span>
            </div>
            <span className="text-[11px] font-mono bg-rose-200/60 text-rose-800 px-2 py-0.5 rounded-full">
              {lowStockProducts.length} items
            </span>
          </div>
        </div>

        {/* CARD 3: Dealer Performance with Top Avatars & Weekly Bar Chart */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgba(15,23,42,0.04)] hover:shadow-[0_12px_40px_rgba(15,23,42,0.07)] transition-all duration-300 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Dealer Performance</span>
            <span className="text-[11px] font-bold text-[#1E60D5] bg-blue-50 px-2.5 py-0.5 rounded-full">
              Ranked Top 3
            </span>
          </div>

          {/* Top Avatars with Circular Rank Badges and Scores */}
          <div className="flex items-center justify-around gap-2 pt-1">
            {/* Rank 1: Royal Blue Badge */}
            <div className="flex flex-col items-center text-center space-y-1">
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 p-0.5 shadow-sm">
                  <div className="w-full h-full rounded-full bg-slate-900 text-white font-black text-sm flex items-center justify-center">
                    JS
                  </div>
                </div>
                <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#1E60D5] text-white font-black text-[10px] flex items-center justify-center border-2 border-white shadow-xs">
                  1
                </span>
              </div>
              <span className="text-[11px] font-bold text-slate-700">John</span>
              <span className="text-xs font-black font-mono text-slate-900">460</span>
            </div>

            {/* Rank 2: Golden Yellow Badge */}
            <div className="flex flex-col items-center text-center space-y-1">
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-500 p-0.5 shadow-sm">
                  <div className="w-full h-full rounded-full bg-slate-900 text-white font-black text-sm flex items-center justify-center">
                    SL
                  </div>
                </div>
                <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#F59E0B] text-white font-black text-[10px] flex items-center justify-center border-2 border-white shadow-xs">
                  2
                </span>
              </div>
              <span className="text-[11px] font-bold text-slate-700">Sarah</span>
              <span className="text-xs font-black font-mono text-slate-900">352</span>
            </div>

            {/* Rank 3: Ruby Red Badge */}
            <div className="flex flex-col items-center text-center space-y-1">
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-rose-500 to-pink-600 p-0.5 shadow-sm">
                  <div className="w-full h-full rounded-full bg-slate-900 text-white font-black text-sm flex items-center justify-center">
                    MB
                  </div>
                </div>
                <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#BE123C] text-white font-black text-[10px] flex items-center justify-center border-2 border-white shadow-xs">
                  3
                </span>
              </div>
              <span className="text-[11px] font-bold text-slate-700">Mike</span>
              <span className="text-xs font-black font-mono text-slate-900">333</span>
            </div>
          </div>

          {/* Weekly Performance Bar Chart (Mon - Sat) in Mint Green */}
          <div className="pt-2 border-t border-slate-100">
            <div className="h-14 flex items-end justify-between gap-2 px-2">
              {[
                { day: 'Mon', height: '40%' },
                { day: 'Tue', height: '65%' },
                { day: 'Wed', height: '90%' },
                { day: 'Thu', height: '55%' },
                { day: 'Fri', height: '80%' },
                { day: 'Sat', height: '35%' }
              ].map((bar, bIdx) => (
                <div key={bIdx} className="flex-1 flex flex-col items-center gap-1 h-full justify-end group">
                  <div 
                    className="w-full bg-[#00B074] rounded-md transition-all duration-300 group-hover:bg-[#009663]"
                    style={{ height: bar.height }}
                  />
                  <span className="text-[10px] font-bold text-slate-400">{bar.day}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ONE-TAP QUICK ACTIONS WIDGET */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgba(15,23,42,0.04)] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#00B074]/15 text-[#00B074] flex items-center justify-center shadow-xs">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 tracking-tight">
                {language === 'bn' ? 'কুইক অ্যাকশনস উইজেট (Quick Actions)' : 'Quick Actions Widget'}
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                {language === 'bn' 
                  ? 'এক ট্যাপেই সাধারণ কার্যাবলী (স্টক যোগ, ওয়ারেন্টি বা লেজার এন্ট্রি) সম্পাদন করুন' 
                  : 'Perform common showroom tasks like Add Stock, Register Warranty, or Ledger Entry with one-tap'}
              </p>
            </div>
          </div>
          <span className="text-[11px] font-bold text-[#00B074] bg-[#00B074]/10 px-3 py-1 rounded-full self-start sm:self-auto border border-[#00B074]/20 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00B074] animate-ping" />
            <span>One-Tap Shortcuts</span>
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-1">
          {/* Action 1: Add Stock */}
          <button
            type="button"
            onClick={onOpenNewPurchase}
            className="group p-3.5 rounded-2xl border border-slate-200/80 bg-slate-50/60 hover:bg-blue-50/70 hover:border-blue-300 transition-all duration-200 active:scale-95 text-left cursor-pointer flex flex-col justify-between h-28 shadow-xs"
          >
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-[#1E60D5] flex items-center justify-center transition-transform duration-200 group-hover:scale-110 shadow-xs">
              <PackagePlus className="w-5 h-5" />
            </div>
            <div>
              <span className="font-black text-xs text-slate-900 group-hover:text-[#1E60D5] block tracking-tight">
                {language === 'bn' ? 'স্টক যোগ করুন' : 'Add Stock'}
              </span>
              <span className="text-[10px] text-slate-400 font-medium">Inbound Phones</span>
            </div>
          </button>

          {/* Action 2: Register Warranty */}
          <button
            type="button"
            onClick={onOpenRegisterWarranty}
            className="group p-3.5 rounded-2xl border border-slate-200/80 bg-slate-50/60 hover:bg-rose-50/70 hover:border-rose-300 transition-all duration-200 active:scale-95 text-left cursor-pointer flex flex-col justify-between h-28 shadow-xs"
          >
            <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center transition-transform duration-200 group-hover:scale-110 shadow-xs">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <span className="font-black text-xs text-slate-900 group-hover:text-rose-600 block tracking-tight">
                {language === 'bn' ? 'ওয়ারেন্টি এন্ট্রি' : 'Register Warranty'}
              </span>
              <span className="text-[10px] text-slate-400 font-medium">Service Ticket</span>
            </div>
          </button>

          {/* Action 3: Create Ledger Entry */}
          <button
            type="button"
            onClick={() => onOpenCreateLedgerEntry('CUSTOMER_PAYMENT')}
            className="group p-3.5 rounded-2xl border border-slate-200/80 bg-slate-50/60 hover:bg-emerald-50/70 hover:border-emerald-300 transition-all duration-200 active:scale-95 text-left cursor-pointer flex flex-col justify-between h-28 shadow-xs"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-[#00B074] flex items-center justify-center transition-transform duration-200 group-hover:scale-110 shadow-xs">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <span className="font-black text-xs text-slate-900 group-hover:text-[#00B074] block tracking-tight">
                {language === 'bn' ? 'লেজার এন্ট্রি' : 'Create Ledger Entry'}
              </span>
              <span className="text-[10px] text-slate-400 font-medium">Due / Payment</span>
            </div>
          </button>

          {/* Action 4: New Sale */}
          <button
            type="button"
            onClick={onOpenNewSale}
            className="group p-3.5 rounded-2xl border border-slate-200/80 bg-slate-50/60 hover:bg-teal-50/70 hover:border-teal-300 transition-all duration-200 active:scale-95 text-left cursor-pointer flex flex-col justify-between h-28 shadow-xs"
          >
            <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-600 flex items-center justify-center transition-transform duration-200 group-hover:scale-110 shadow-xs">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <span className="font-black text-xs text-slate-900 group-hover:text-teal-600 block tracking-tight">
                {language === 'bn' ? 'নতুন বিক্রয়' : 'New Sale / POS'}
              </span>
              <span className="text-[10px] text-slate-400 font-medium">Customer Bill</span>
            </div>
          </button>

          {/* Action 5: Shop Expense */}
          <button
            type="button"
            onClick={onOpenNewExpense}
            className="group p-3.5 rounded-2xl border border-slate-200/80 bg-slate-50/60 hover:bg-amber-50/70 hover:border-amber-300 transition-all duration-200 active:scale-95 text-left cursor-pointer flex flex-col justify-between h-28 shadow-xs"
          >
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center transition-transform duration-200 group-hover:scale-110 shadow-xs">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <span className="font-black text-xs text-slate-900 group-hover:text-amber-700 block tracking-tight">
                {language === 'bn' ? 'দোকানের খরচ' : 'Add Expense'}
              </span>
              <span className="text-[10px] text-slate-400 font-medium">Shop Bills</span>
            </div>
          </button>

          {/* Action 6: Daily Closing */}
          <button
            type="button"
            onClick={onOpenDailyClosing}
            className="group p-3.5 rounded-2xl border border-slate-200/80 bg-slate-50/60 hover:bg-purple-50/70 hover:border-purple-300 transition-all duration-200 active:scale-95 text-left cursor-pointer flex flex-col justify-between h-28 shadow-xs"
          >
            <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center transition-transform duration-200 group-hover:scale-110 shadow-xs">
              <Landmark className="w-5 h-5" />
            </div>
            <div>
              <span className="font-black text-xs text-slate-900 group-hover:text-purple-700 block tracking-tight">
                {language === 'bn' ? 'দৈনিক ক্লোজিং' : 'Daily Closing'}
              </span>
              <span className="text-[10px] text-slate-400 font-medium">Cash Reconcile</span>
            </div>
          </button>
        </div>
      </div>

      {/* QUICK NAVIGATION ACTION TILES (Exact Match to Image 1) */}
      <div className="space-y-3">
        <h3 className="text-sm font-black text-slate-900 tracking-tight">
          {language === 'bn' ? 'দ্রুত নেভিগেশন ও অ্যাকশন (Quick Navigation)' : 'Quick Navigation'}
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {/* Tile 1: New Order (Mint Emerald) */}
          <button
            type="button"
            onClick={onOpenNewSale}
            className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-[#00B074] hover:bg-[#009e68] text-white shadow-lg shadow-emerald-600/20 flex flex-col justify-between h-32 sm:h-36 transition-all duration-200 active:scale-95 group text-left cursor-pointer"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-white/20 flex items-center justify-center">
              <ClipboardList className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <span className="text-sm sm:text-base font-black tracking-tight block truncate">
                {language === 'bn' ? 'নতুন অর্ডার / বিক্রয়' : 'New Order'}
              </span>
              <span className="text-[10px] sm:text-[11px] text-white/80 font-medium block truncate">Create Invoice / POS</span>
            </div>
          </button>

          {/* Tile 2: Add Vehicle / Stock (Electric Royal Blue) */}
          <button
            type="button"
            onClick={onOpenNewPurchase}
            className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-[#1E60D5] hover:bg-[#1853bf] text-white shadow-lg shadow-blue-600/20 flex flex-col justify-between h-32 sm:h-36 transition-all duration-200 active:scale-95 group text-left cursor-pointer"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-white/20 flex items-center justify-center">
              <Plus className="w-5 h-5 sm:w-6 sm:h-6 text-white stroke-[3]" />
            </div>
            <div>
              <span className="text-sm sm:text-base font-black tracking-tight block truncate">
                {language === 'bn' ? 'স্টক ও পণ্য যোগ' : 'Add Stock'}
              </span>
              <span className="text-[10px] sm:text-[11px] text-white/80 font-medium block truncate">Inbound Purchase & IMEI</span>
            </div>
          </button>

          {/* Tile 3: Manage Dealers (Warm Amber Gold) */}
          <button
            type="button"
            onClick={() => onNavigateTab('customers')}
            className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-[#F59E0B] hover:bg-[#dd8e0a] text-white shadow-lg shadow-amber-600/20 flex flex-col justify-between h-32 sm:h-36 transition-all duration-200 active:scale-95 group text-left cursor-pointer"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-white/20 flex items-center justify-center">
              <UserCog className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <span className="text-sm sm:text-base font-black tracking-tight block truncate">
                {language === 'bn' ? 'ডিলার ও গ্রাহক' : 'Manage Dealers'}
              </span>
              <span className="text-[10px] sm:text-[11px] text-white/80 font-medium block truncate">Ledgers & Credit Limits</span>
            </div>
          </button>

          {/* Tile 4: Reports (Deep Ruby Crimson) */}
          <button
            type="button"
            onClick={() => onNavigateTab('reports')}
            className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-[#BE123C] hover:bg-[#a71034] text-white shadow-lg shadow-rose-600/20 flex flex-col justify-between h-32 sm:h-36 transition-all duration-200 active:scale-95 group text-left cursor-pointer"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-white/20 flex items-center justify-center">
              <FileBarChart className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <span className="text-sm sm:text-base font-black tracking-tight block truncate">
                {language === 'bn' ? 'রিপোর্ট ও লাভ-ক্ষতি' : 'Reports'}
              </span>
              <span className="text-[10px] sm:text-[11px] text-white/80 font-medium block truncate">P&L and Stock Audits</span>
            </div>
          </button>
        </div>
      </div>

      {/* REAL-TIME PERFORMANCE METRICS WIDGET (Recharts: Daily Sales, Cash Flow, Top Brands) */}
      <RealtimePerformanceMetrics onNavigateTab={onNavigateTab} />

      {/* SALES PERFORMANCE DETAILED CHART (Exact match to Mockup Image 2) */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgba(15,23,42,0.04)] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-black text-slate-900 tracking-tight">
              {language === 'bn' ? 'বিক্রয় কর্মক্ষমতা ও ট্রেন্ড (Sales Performance)' : 'Sales Performance'}
            </h3>
            <p className="text-xs text-slate-400">Monthly revenue bars with dual spline trends</p>
          </div>

          <div className="flex items-center gap-4 text-xs font-bold">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-md bg-[#1E60D5]" />
              <span className="text-slate-600">Sales Volume</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#00B074]" />
              <span className="text-slate-600">Growth Trend</span>
            </div>
          </div>
        </div>

        {/* Detailed Chart Visualization */}
        <div className="h-64 w-full relative pt-4 overflow-hidden">
          {/* Y Axis Grid lines */}
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-40">
            <div className="border-b border-dashed border-slate-200 w-full" />
            <div className="border-b border-dashed border-slate-200 w-full" />
            <div className="border-b border-dashed border-slate-200 w-full" />
            <div className="border-b border-dashed border-slate-200 w-full" />
            <div className="border-b border-slate-200 w-full" />
          </div>

          {/* SVG Multi-bar + Spline wave lines */}
          <div className="relative h-full flex items-end justify-between px-1 sm:px-6">
            {[
              { m: 'Jan', h: 45, val: '৳45k' },
              { m: 'Feb', h: 60, val: '৳60k' },
              { m: 'Mar', h: 75, val: '৳75k' },
              { m: 'Apr', h: 50, val: '৳50k' },
              { m: 'May', h: 85, val: '৳85k' },
              { m: 'Jun', h: 70, val: '৳70k' },
              { m: 'Jul', h: 65, val: '৳65k' },
              { m: 'Aug', h: 90, val: '৳90k' },
              { m: 'Sep', h: 80, val: '৳80k' },
              { m: 'Oct', h: 95, val: '৳95k' },
              { m: 'Nov', h: 70, val: '৳70k' },
              { m: 'Dec', h: 100, val: '৳100k' }
            ].map((bar, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1.5 sm:gap-2 h-full justify-end group z-10 min-w-0">
                <div 
                  className="w-2.5 sm:w-6 bg-[#1E60D5] hover:bg-[#00B074] rounded-t-sm sm:rounded-t-lg transition-all duration-300 relative"
                  style={{ height: `${bar.h}%` }}
                >
                  <span className="absolute -top-7 left-1/2 -translate-x-1/2 px-1.5 py-0.5 bg-slate-900 text-white text-[10px] font-mono rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none z-30">
                    {bar.val}
                  </span>
                </div>
                <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 truncate w-full text-center">{bar.m}</span>
              </div>
            ))}

            {/* Overlay Spline Waves */}
            <svg 
              viewBox="0 0 800 200" 
              preserveAspectRatio="none"
              className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden"
            >
              <path
                d="M 20,180 Q 90,130 160,110 T 300,80 T 450,110 T 600,60 T 780,40"
                fill="none"
                stroke="#00B074"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <path
                d="M 20,160 Q 90,150 160,130 T 300,100 T 450,130 T 600,80 T 780,50"
                fill="none"
                stroke="#1E60D5"
                strokeWidth="2.5"
                strokeDasharray="4 4"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* 3 BOTTOM WIDGETS (Exact match to Mockup Image 2) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* WIDGET 1: Recent Orders List */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgba(15,23,42,0.04)] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-slate-900 tracking-tight">Recent Orders List</h3>
            <button
              type="button"
              onClick={() => onNavigateTab('sales')}
              className="text-xs font-bold text-[#1E60D5] hover:underline cursor-pointer"
            >
              See all
            </button>
          </div>

          <div className="space-y-3">
            {recentSales.map(order => (
              <div 
                key={order.id} 
                onClick={() => onViewInvoice(order.invoiceNo)}
                className="p-3 rounded-2xl bg-slate-50/70 hover:bg-slate-100/80 transition flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-2xl bg-blue-100 text-[#1E60D5] flex items-center justify-center shrink-0">
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">{order.customerName}</p>
                    <p className="text-[10px] text-slate-400">{formatDate(order.date)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-black font-mono text-slate-900 block">
                    {formatBDT(order.grandTotal)}
                  </span>
                  <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                    order.dueAmount === 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {order.dueAmount === 0 ? 'Paid' : 'Due'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* WIDGET 2: Top Sales Agents */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgba(15,23,42,0.04)] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-slate-900 tracking-tight">Top Sales Agents</h3>
            <button
              type="button"
              onClick={() => onNavigateTab('settings')}
              className="text-xs font-bold text-[#1E60D5] hover:underline cursor-pointer"
            >
              See all
            </button>
          </div>

          <div className="space-y-3">
            {topSalesAgents.map((agent, aIdx) => (
              <div key={aIdx} className="p-3 rounded-2xl bg-slate-50/70 hover:bg-slate-100/80 transition flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-xs">
                    {agent.user.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">{agent.user.name}</p>
                    <p className="text-[10px] text-slate-400">{agent.user.role}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-black font-mono text-slate-900 block">
                    {formatBDT(agent.salesTotal)}
                  </span>
                  <span className="text-[10px] text-[#00B074] font-bold">
                    ★ {agent.score} pts
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* WIDGET 3: Pending Repairs & Service */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgba(15,23,42,0.04)] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-slate-900 tracking-tight">Pending Repairs & Shipments</h3>
            <button
              type="button"
              onClick={() => onNavigateTab('warranty')}
              className="text-xs font-bold text-[#1E60D5] hover:underline cursor-pointer"
            >
              Service Desk
            </button>
          </div>

          <div className="space-y-3">
            <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/60 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                  <Wrench className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-amber-950">Pending Repairs</p>
                  <p className="text-[10px] text-amber-700">Awaiting technician inspection</p>
                </div>
              </div>
              <span className="text-sm font-black font-mono text-amber-900">
                {warrantyClaims.filter(w => w.status === 'PENDING').length}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200/60 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-blue-950">In-Service Devices</p>
                  <p className="text-[10px] text-blue-700">Under official vendor warranty</p>
                </div>
              </div>
              <span className="text-sm font-black font-mono text-blue-900">
                {warrantyClaims.filter(w => w.status === 'IN_REPAIR').length}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/60 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Truck className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-emerald-950">Active Shipments</p>
                  <p className="text-[10px] text-emerald-700">Inter-branch transfers in transit</p>
                </div>
              </div>
              <span className="text-sm font-black font-mono text-emerald-900">
                2
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
