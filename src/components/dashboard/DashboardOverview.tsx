import React, { useState } from 'react';
import { 
  TrendingUp, ShoppingBag, Truck, Users, Building, Wallet,
  Landmark, AlertTriangle, ArrowUpRight, ArrowDownRight,
  Plus, Smartphone, CheckCircle, Clock, ShieldCheck, ChevronRight
} from 'lucide-react';
import { useERP } from '../../services/erpStore';
import { formatBDT, formatDate } from '../../utils/formatters';

interface DashboardOverviewProps {
  onOpenNewSale: () => void;
  onOpenNewPurchase: () => void;
  onOpenReceivePayment: () => void;
  onOpenPaySupplier: () => void;
  onOpenNewExpense: () => void;
  onOpenDailyClosing: () => void;
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
  onViewInvoice,
  onNavigateTab
}) => {
  const { 
    language, sales, purchases, customers, suppliers, 
    cashAccounts, bankAccounts, imeis, products, expenses,
    currentBranchName, currentBranchId
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

  const totalCashBalance = cashAccounts
    .filter(ca => currentBranchId === 'all' || ca.branchId === currentBranchId)
    .reduce((acc, ca) => acc + ca.balance, 0);

  const totalBankBalance = bankAccounts.reduce((acc, ba) => acc + ba.balance, 0);

  // Stock valuation: sum of purchaseCost of all IN_STOCK IMEIs + accessories stock
  const inStockImeisList = imeis.filter(i => 
    i.status === 'IN_STOCK' && (currentBranchId === 'all' || i.branchId === currentBranchId)
  );
  const imeiStockValuation = inStockImeisList.reduce((acc, i) => acc + i.purchaseCost, 0);

  // Non-IMEI accessories stock valuation
  const accessoryValuation = products
    .filter(p => !p.hasImei)
    .reduce((acc, p) => {
      const pVal = p.variants.reduce((vSum, v) => vSum + (v.currentStock * v.purchasePrice), 0);
      return acc + pVal;
    }, 0);

  const totalStockValuation = imeiStockValuation + accessoryValuation;

  // Filter today's sales
  const todayStr = new Date().toISOString().split('T')[0];
  const todaySalesList = filteredSales.filter(s => s.date === todayStr);
  const todaySalesRevenue = todaySalesList.reduce((acc, s) => acc + s.grandTotal, 0);
  const todayGrossProfit = todaySalesList.reduce((acc, s) => acc + s.grossProfit, 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Welcome Bar */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white p-5 rounded-2xl shadow-sm border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight">
              {language === 'bn' ? 'ব্যবসায়িক ড্যাশবোর্ড' : 'Operational ERP Dashboard'}
            </h1>
            <span className="text-xs bg-emerald-500/20 text-emerald-300 font-medium px-2 py-0.5 rounded-full border border-emerald-500/30">
              {currentBranchName}
            </span>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            {language === 'bn' 
              ? 'মোবাইল ফোন ও গ্যাজেট খুচরা এবং পাইকারি ব্যবসার রিয়েল-টাইম তথ্য' 
              : 'Real-time retail & wholesale mobile business intelligence, IMEI tracking, and financial control.'}
          </p>
        </div>

        {/* Date Filter Buttons */}
        <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700/80 self-start md:self-auto text-xs">
          <button
            onClick={() => setDateFilter('today')}
            className={`px-3 py-1 rounded-lg font-medium transition ${dateFilter === 'today' ? 'bg-emerald-600 text-white shadow' : 'text-slate-300 hover:text-white'}`}
          >
            {language === 'bn' ? 'আজ' : 'Today'}
          </button>
          <button
            onClick={() => setDateFilter('week')}
            className={`px-3 py-1 rounded-lg font-medium transition ${dateFilter === 'week' ? 'bg-emerald-600 text-white shadow' : 'text-slate-300 hover:text-white'}`}
          >
            {language === 'bn' ? 'এই সপ্তাহ' : 'This Week'}
          </button>
          <button
            onClick={() => setDateFilter('month')}
            className={`px-3 py-1 rounded-lg font-medium transition ${dateFilter === 'month' ? 'bg-emerald-600 text-white shadow' : 'text-slate-300 hover:text-white'}`}
          >
            {language === 'bn' ? 'এই মাস' : 'This Month'}
          </button>
          <button
            onClick={() => setDateFilter('all')}
            className={`px-3 py-1 rounded-lg font-medium transition ${dateFilter === 'all' ? 'bg-emerald-600 text-white shadow' : 'text-slate-300 hover:text-white'}`}
          >
            {language === 'bn' ? 'সব' : 'All Time'}
          </button>
        </div>
      </div>

      {/* Quick Action Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <button
          onClick={onOpenNewSale}
          className="flex items-center gap-2 p-3 bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-400 rounded-xl shadow-xs transition group text-left"
        >
          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
            <ShoppingBag className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900 group-hover:text-emerald-700">
              {language === 'bn' ? '+ নতুন মেমো' : '+ New Sale'}
            </p>
            <p className="text-[10px] text-slate-500 font-medium">POS Invoice</p>
          </div>
        </button>

        <button
          onClick={onOpenNewPurchase}
          className="flex items-center gap-2 p-3 bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-400 rounded-xl shadow-xs transition group text-left"
        >
          <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
            <Truck className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900 group-hover:text-blue-700">
              {language === 'bn' ? '+ নতুন ক্রয়' : '+ New Purchase'}
            </p>
            <p className="text-[10px] text-slate-500 font-medium">Landed Cost</p>
          </div>
        </button>

        <button
          onClick={onOpenReceivePayment}
          className="flex items-center gap-2 p-3 bg-white hover:bg-violet-50 border border-slate-200 hover:border-violet-400 rounded-xl shadow-xs transition group text-left"
        >
          <div className="w-8 h-8 rounded-lg bg-violet-100 text-violet-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900 group-hover:text-violet-700">
              {language === 'bn' ? '+ বাকি আদায়' : '+ Collect Due'}
            </p>
            <p className="text-[10px] text-slate-500 font-medium">Customer Due</p>
          </div>
        </button>

        <button
          onClick={onOpenPaySupplier}
          className="flex items-center gap-2 p-3 bg-white hover:bg-amber-50 border border-slate-200 hover:border-amber-400 rounded-xl shadow-xs transition group text-left"
        >
          <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
            <Building className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900 group-hover:text-amber-700">
              {language === 'bn' ? '+ মহাজন বিল' : '+ Pay Supplier'}
            </p>
            <p className="text-[10px] text-slate-500 font-medium">Accounts Payable</p>
          </div>
        </button>

        <button
          onClick={onOpenNewExpense}
          className="flex items-center gap-2 p-3 bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-400 rounded-xl shadow-xs transition group text-left"
        >
          <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
            <Wallet className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900 group-hover:text-rose-700">
              {language === 'bn' ? '+ খরচ এন্ট্রি' : '+ Add Expense'}
            </p>
            <p className="text-[10px] text-slate-500 font-medium">Shop Bills</p>
          </div>
        </button>

        <button
          onClick={onOpenDailyClosing}
          className="flex items-center gap-2 p-3 bg-white hover:bg-slate-100 border border-slate-200 hover:border-slate-400 rounded-xl shadow-xs transition group text-left"
        >
          <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-800 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
            <CheckCircle className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900 group-hover:text-slate-800">
              {language === 'bn' ? 'হিসাব ক্লোজিং' : 'Daily Closing'}
            </p>
            <p className="text-[10px] text-slate-500 font-medium">Cash Balance</p>
          </div>
        </button>
      </div>

      {/* Primary KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Sales KPI */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {language === 'bn' ? 'মোট বিক্রয়' : 'Total Sales Revenue'}
            </span>
            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <ShoppingBag className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-slate-900 font-mono tracking-tight">
              {formatBDT(totalSalesRevenue)}
            </p>
            <div className="flex items-center gap-1.5 mt-2 text-xs font-medium text-emerald-700">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>Today: {formatBDT(todaySalesRevenue)} ({todaySalesList.length} orders)</span>
            </div>
          </div>
        </div>

        {/* Profit KPI */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {language === 'bn' ? 'মোট লাভ (Gross Profit)' : 'Gross Profit'}
            </span>
            <span className="p-2 rounded-xl bg-teal-50 text-teal-600">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-slate-900 font-mono tracking-tight">
              {formatBDT(totalGrossProfit)}
            </p>
            <div className="flex items-center gap-1.5 mt-2 text-xs font-medium text-teal-700">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>Today Profit: {formatBDT(todayGrossProfit)}</span>
            </div>
          </div>
        </div>

        {/* Customer Due (Receivable) */}
        <div 
          onClick={() => onNavigateTab('customers')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs relative overflow-hidden cursor-pointer hover:border-rose-300 transition"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {language === 'bn' ? 'কাস্টমার বাকি (Due)' : 'Customer Due (Receivable)'}
            </span>
            <span className="p-2 rounded-xl bg-rose-50 text-rose-600">
              <Users className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-rose-600 font-mono tracking-tight">
              {formatBDT(totalCustomerDue)}
            </p>
            <div className="flex items-center justify-between mt-2 text-xs text-slate-500">
              <span>{customers.filter(c => c.currentDue > 0).length} parties outstanding</span>
              <span className="text-rose-600 font-bold flex items-center">
                Ledger <ChevronRight className="w-3 h-3" />
              </span>
            </div>
          </div>
        </div>

        {/* Supplier Due (Payable) */}
        <div 
          onClick={() => onNavigateTab('suppliers')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs relative overflow-hidden cursor-pointer hover:border-amber-300 transition"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {language === 'bn' ? 'মহাজন পাওনা (Payable)' : 'Supplier Due (Payable)'}
            </span>
            <span className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Building className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-amber-600 font-mono tracking-tight">
              {formatBDT(totalSupplierDue)}
            </p>
            <div className="flex items-center justify-between mt-2 text-xs text-slate-500">
              <span>{suppliers.filter(s => s.currentPayable > 0).length} distributors</span>
              <span className="text-amber-600 font-bold flex items-center">
                Details <ChevronRight className="w-3 h-3" />
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Metrics: Cash, Bank, Stock Value & Active Devices */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Cash in Hand */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500">
              {language === 'bn' ? 'হাতে ক্যাশ (Cash in Hand)' : 'Counter & Vault Cash'}
            </p>
            <p className="text-lg font-black text-slate-900 font-mono mt-1">
              {formatBDT(totalCashBalance)}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">{cashAccounts.length} Cash Drawers</p>
          </div>
          <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-emerald-600">
            <Wallet className="w-5 h-5" />
          </div>
        </div>

        {/* Bank & MFS Balance */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500">
              {language === 'bn' ? 'ব্যাংক ও বিকাশ/নগদ ব্যালেন্স' : 'Bank & MFS Accounts'}
            </p>
            <p className="text-lg font-black text-slate-900 font-mono mt-1">
              {formatBDT(totalBankBalance)}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">City, Islami, bKash, Nagad</p>
          </div>
          <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-blue-600">
            <Landmark className="w-5 h-5" />
          </div>
        </div>

        {/* Total Stock Valuation */}
        <div 
          onClick={() => onNavigateTab('inventory')}
          className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between cursor-pointer hover:bg-slate-100 transition"
        >
          <div>
            <p className="text-xs font-semibold text-slate-500">
              {language === 'bn' ? 'বর্তমান স্টক মূল্য (Valuation)' : 'Stock Valuation (Cost)'}
            </p>
            <p className="text-lg font-black text-slate-900 font-mono mt-1">
              {formatBDT(totalStockValuation)}
            </p>
            <p className="text-[11px] text-emerald-700 font-medium mt-0.5">
              {inStockImeisList.length} Phones in stock
            </p>
          </div>
          <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-indigo-600">
            <Smartphone className="w-5 h-5" />
          </div>
        </div>

        {/* Total Expenses */}
        <div 
          onClick={() => onNavigateTab('expenses')}
          className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between cursor-pointer hover:bg-slate-100 transition"
        >
          <div>
            <p className="text-xs font-semibold text-slate-500">
              {language === 'bn' ? 'দোকানের মোট খরচ' : 'Operating Expenses'}
            </p>
            <p className="text-lg font-black text-slate-900 font-mono mt-1">
              {formatBDT(expenses.reduce((acc, e) => acc + e.amount, 0))}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">Rent, Salary, Utilities, Courier</p>
          </div>
          <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-rose-500">
            <ArrowDownRight className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Two Column Layout: Recent Sales Invoices vs Wholesale Dealer Credit Watch */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Sales Table (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                {language === 'bn' ? 'সাম্প্রতিক মেমো / বিক্রয় চালান' : 'Recent Sales Transactions'}
              </h2>
              <p className="text-xs text-slate-500">Latest completed customer & dealer invoices</p>
            </div>
            <button
              onClick={() => onNavigateTab('sales')}
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
            >
              <span>{language === 'bn' ? 'সব দেখুন' : 'View All'}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="py-2.5 px-3">Invoice #</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Customer / Party</th>
                  <th className="py-2.5 px-3">Items / IMEI</th>
                  <th className="py-2.5 px-3 text-right">Total</th>
                  <th className="py-2.5 px-3 text-right">Paid</th>
                  <th className="py-2.5 px-3 text-right">Due</th>
                  <th className="py-2.5 px-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {sales.slice(0, 5).map(inv => (
                  <tr key={inv.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-3 font-mono font-bold text-slate-900">
                      {inv.invoiceNo}
                    </td>
                    <td className="py-3 px-3 text-slate-500 whitespace-nowrap">
                      {formatDate(inv.date)}
                    </td>
                    <td className="py-3 px-3">
                      <p className="font-semibold text-slate-900 truncate max-w-[160px]">{inv.customerName}</p>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                        {inv.customerType}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="text-slate-800 truncate block max-w-[180px]">
                        {inv.items[0]?.productName || 'Device'}
                      </span>
                      {inv.items[0]?.imeiList[0] && (
                        <span className="font-mono text-[10px] text-slate-400">
                          IMEI: {inv.items[0].imeiList[0]}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                      {formatBDT(inv.grandTotal)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-emerald-700">
                      {formatBDT(inv.paidAmount)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono">
                      {inv.dueAmount > 0 ? (
                        <span className="text-rose-600 font-bold">{formatBDT(inv.dueAmount)}</span>
                      ) : (
                        <span className="text-slate-400">৳0</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => onViewInvoice(inv.invoiceNo)}
                        className="px-2 py-1 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 rounded text-[11px] font-semibold text-slate-600 transition"
                      >
                        Memo
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Wholesale Dealer Credit & Due Watch (1 col) */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  {language === 'bn' ? 'ডিলার বাকি ও ক্রেডিট লিমিট' : 'Dealer Credit Watch'}
                </h2>
                <p className="text-xs text-slate-500">Wholesale exposure & limits</p>
              </div>
              <button
                onClick={() => onNavigateTab('customers')}
                className="text-xs font-semibold text-emerald-600 hover:text-emerald-700"
              >
                Ledger
              </button>
            </div>

            <div className="space-y-4 mt-4">
              {customers
                .filter(c => c.customerType.includes('Dealer') || c.creditLimit > 0)
                .map(dlr => {
                  const usagePercent = dlr.creditLimit > 0 ? Math.min(100, Math.round((dlr.currentDue / dlr.creditLimit) * 100)) : 0;
                  return (
                    <div key={dlr.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-slate-900 truncate max-w-[140px]">{dlr.businessName || dlr.name}</span>
                        <span className={dlr.currentDue > 0 ? 'text-rose-600 font-mono' : 'text-emerald-600'}>
                          Due: {formatBDT(dlr.currentDue)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                        <span>Limit: {formatBDT(dlr.creditLimit)}</span>
                        <span>{usagePercent}% Used</span>
                      </div>
                      {/* Credit Bar */}
                      <div className="w-full bg-slate-200 h-1.5 rounded-full mt-1.5 overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${
                            usagePercent > 80 ? 'bg-rose-500' :
                            usagePercent > 50 ? 'bg-amber-500' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${usagePercent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          <div className="mt-5 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Automatic journal entries ensure 100% balance sheet reconciliation.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
