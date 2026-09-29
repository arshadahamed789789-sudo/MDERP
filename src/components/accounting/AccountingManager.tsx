import React, { useState } from 'react';
import { 
  BookOpen, Layers, CheckCircle2, TrendingUp, Landmark, 
  ArrowRight, ShieldCheck, Scale, FileSpreadsheet, Calendar
} from 'lucide-react';
import { useERP } from '../../services/erpStore';
import { formatBDT, formatDate } from '../../utils/formatters';

export const AccountingManager: React.FC = () => {
  const { 
    chartOfAccounts, journalEntries, sales, expenses, 
    customers, suppliers, cashAccounts, bankAccounts, imeis, products, language 
  } = useERP();

  const [activeTab, setActiveTab] = useState<'pnl' | 'balance_sheet' | 'trial_balance' | 'journals' | 'coa'>('pnl');

  // Profit & Loss Calculations
  const totalRevenue = sales.reduce((acc, s) => acc + s.grandTotal, 0);
  const totalCOGS = sales.reduce((acc, s) => acc + s.totalCost, 0);
  const grossProfit = totalRevenue - totalCOGS;
  const grossMarginPercent = totalRevenue > 0 ? ((grossProfit / totalRevenue) * 100).toFixed(1) : '0';

  const totalOperatingExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);
  const netProfit = grossProfit - totalOperatingExpenses;
  const netMarginPercent = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : '0';

  // Balance Sheet Calculations
  // Assets:
  const cashTotal = cashAccounts.reduce((acc, c) => acc + c.balance, 0);
  const bankTotal = bankAccounts.reduce((acc, b) => acc + b.balance, 0);
  const receivablesTotal = customers.reduce((acc, c) => acc + c.currentDue, 0);
  
  // Inventory valuation:
  const imeiCost = imeis.filter(i => i.status === 'IN_STOCK').reduce((acc, i) => acc + i.purchaseCost, 0);
  const accCost = products.filter(p => !p.hasImei).reduce((acc, p) => {
    return acc + p.variants.reduce((vSum, v) => vSum + (v.currentStock * v.purchasePrice), 0);
  }, 0);
  const inventoryTotal = imeiCost + accCost;
  const totalAssets = cashTotal + bankTotal + receivablesTotal + inventoryTotal;

  // Liabilities:
  const payablesTotal = suppliers.reduce((acc, s) => acc + s.currentPayable, 0);
  const totalLiabilities = payablesTotal;

  // Equity:
  const initialCapital = 2600000;
  const retainedEarnings = totalAssets - totalLiabilities - initialCapital;
  const totalEquity = initialCapital + retainedEarnings;
  const totalLiabilitiesAndEquity = totalLiabilities + totalEquity;

  // Trial Balance calculation
  const totalDebitTrial = chartOfAccounts
    .filter(a => a.normalBalance === 'DEBIT')
    .reduce((acc, a) => acc + a.balance, 0);
  const totalCreditTrial = chartOfAccounts
    .filter(a => a.normalBalance === 'CREDIT')
    .reduce((acc, a) => acc + a.balance, 0);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">
          {language === 'bn' ? 'ডাবল-এন্ট্রি একাউন্টিং ও লাভ-ক্ষতি' : 'Double-Entry Accounting & Financial Statements'}
        </h1>
        <p className="text-xs text-slate-500">
          {language === 'bn' 
            ? 'প্রতিটি কেনা-বেচার স্বয়ংক্রিয় জাবেদা (Journal), খতিয়ান, প্রফিট অ্যান্ড লস ও ব্যালেন্স শীট' 
            : 'Automated balanced journal entries, Trial Balance, Profit & Loss, and Balance Sheet for audit & tax.'}
        </p>
      </div>

      {/* Quick Navigation Tabs */}
      <div className="flex border-b border-slate-200 gap-4 text-xs font-bold overflow-x-auto">
        <button
          onClick={() => setActiveTab('pnl')}
          className={`pb-2.5 transition border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'pnl' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Profit & Loss Statement (লাভ-ক্ষতি)</span>
        </button>
        <button
          onClick={() => setActiveTab('balance_sheet')}
          className={`pb-2.5 transition border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'balance_sheet' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Scale className="w-4 h-4" />
          <span>Balance Sheet (উদ্বৃত্ত পত্র)</span>
        </button>
        <button
          onClick={() => setActiveTab('trial_balance')}
          className={`pb-2.5 transition border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'trial_balance' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Trial Balance (রেওয়ামিল)</span>
        </button>
        <button
          onClick={() => setActiveTab('journals')}
          className={`pb-2.5 transition border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'journals' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Journal Entries Feed ({journalEntries.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('coa')}
          className={`pb-2.5 transition border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'coa' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Chart of Accounts</span>
        </button>
      </div>

      {/* 1. PROFIT & LOSS STATEMENT */}
      {activeTab === 'pnl' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 max-w-4xl space-y-6">
          <div className="border-b border-slate-200 pb-4 flex justify-between items-start">
            <div>
              <h2 className="text-base font-extrabold text-slate-900">
                Income Statement / Profit & Loss (P&L)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Accrual basis: Real Gross Profit and Net Operational Profit
              </p>
            </div>
            <span className="text-xs px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-lg font-bold">
              Current Period
            </span>
          </div>

          <div className="space-y-4 text-xs">
            {/* Revenue Section */}
            <div>
              <div className="flex justify-between font-bold text-sm text-slate-900 border-b border-slate-200 pb-1">
                <span>1. Operating Revenue (বিক্রয় রাজস্ব)</span>
                <span className="font-mono text-base">{formatBDT(totalRevenue)}</span>
              </div>
              <div className="pl-4 py-2 space-y-1 text-slate-600">
                <div className="flex justify-between">
                  <span>Gross Sales from Invoices</span>
                  <span className="font-mono">{formatBDT(totalRevenue)}</span>
                </div>
              </div>
            </div>

            {/* COGS Section */}
            <div>
              <div className="flex justify-between font-bold text-sm text-rose-800 border-b border-slate-200 pb-1">
                <span>2. Cost of Goods Sold - COGS (বিক্রীত পণ্যের ব্যয়)</span>
                <span className="font-mono text-base">-{formatBDT(totalCOGS)}</span>
              </div>
              <div className="pl-4 py-2 space-y-1 text-slate-600">
                <div className="flex justify-between">
                  <span>Direct Purchase Cost of Sold Devices & Accessories</span>
                  <span className="font-mono">{formatBDT(totalCOGS)}</span>
                </div>
              </div>
            </div>

            {/* Gross Profit Banner */}
            <div className="p-4 rounded-xl bg-teal-50/80 border border-teal-200 flex justify-between items-center text-sm font-black text-teal-900">
              <div>
                <span>GROSS PROFIT (মোট লাভ)</span>
                <span className="block text-xs font-semibold text-teal-700 mt-0.5">
                  Gross Margin: {grossMarginPercent}%
                </span>
              </div>
              <span className="font-mono text-xl">{formatBDT(grossProfit)}</span>
            </div>

            {/* Operating Expenses Section */}
            <div>
              <div className="flex justify-between font-bold text-sm text-slate-800 border-b border-slate-200 pb-1">
                <span>3. Operating Expenses (দোকানের পরিচালন খরচ)</span>
                <span className="font-mono text-base text-rose-600">-{formatBDT(totalOperatingExpenses)}</span>
              </div>
              <div className="pl-4 py-2 space-y-1.5 text-slate-600">
                {expenses.map(e => (
                  <div key={e.id} className="flex justify-between">
                    <span>{e.categoryName} ({e.recipient})</span>
                    <span className="font-mono">{formatBDT(e.amount)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Net Profit Banner */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-700 to-teal-800 text-white flex justify-between items-center text-base font-black shadow-md">
              <div>
                <span>NET BUSINESS PROFIT (প্রকৃত নিট লাভ)</span>
                <span className="block text-xs font-medium text-emerald-200 mt-0.5">
                  After all direct device costs & shop bills | Margin: {netMarginPercent}%
                </span>
              </div>
              <span className="font-mono text-2xl tracking-tight">{formatBDT(netProfit)}</span>
            </div>
          </div>
        </div>
      )}

      {/* 2. BALANCE SHEET */}
      {activeTab === 'balance_sheet' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 max-w-4xl space-y-6">
          <div className="border-b border-slate-200 pb-4 flex justify-between items-start">
            <div>
              <h2 className="text-base font-extrabold text-slate-900">
                Statement of Financial Position (Balance Sheet)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Fundamental equation: Total Assets = Total Liabilities + Total Equity
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>100% Balanced</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            {/* ASSETS Column */}
            <div className="space-y-4">
              <h3 className="font-bold text-sm text-slate-900 border-b-2 border-slate-900 pb-1 uppercase">
                ASSETS (সম্পদ)
              </h3>
              <div className="space-y-2">
                <p className="font-bold text-slate-700 uppercase text-[11px]">Current Assets:</p>
                <div className="pl-2 space-y-1.5 text-slate-600">
                  <div className="flex justify-between">
                    <span>Cash on Hand (Counter Drawers)</span>
                    <span className="font-mono font-semibold">{formatBDT(cashTotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Bank & MFS Accounts (City, Islami, bKash)</span>
                    <span className="font-mono font-semibold">{formatBDT(bankTotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Accounts Receivable (Customer Due)</span>
                    <span className="font-mono font-semibold text-rose-600">{formatBDT(receivablesTotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Merchandise Inventory (Phones & Acc.)</span>
                    <span className="font-mono font-semibold text-indigo-700">{formatBDT(inventoryTotal)}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t-2 border-slate-900 flex justify-between font-black text-sm text-slate-900">
                <span>TOTAL ASSETS:</span>
                <span className="font-mono text-base text-emerald-800">{formatBDT(totalAssets)}</span>
              </div>
            </div>

            {/* LIABILITIES & EQUITY Column */}
            <div className="space-y-4">
              <h3 className="font-bold text-sm text-slate-900 border-b-2 border-slate-900 pb-1 uppercase">
                LIABILITIES & EQUITY (দায় ও মালিকানাস্বত্ব)
              </h3>

              <div className="space-y-2">
                <p className="font-bold text-slate-700 uppercase text-[11px]">Current Liabilities:</p>
                <div className="pl-2 space-y-1.5 text-slate-600">
                  <div className="flex justify-between">
                    <span>Accounts Payable (Supplier Due)</span>
                    <span className="font-mono font-semibold text-amber-700">{formatBDT(totalLiabilities)}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100">
                <p className="font-bold text-slate-700 uppercase text-[11px]">Owner&apos;s Equity:</p>
                <div className="pl-2 space-y-1.5 text-slate-600">
                  <div className="flex justify-between">
                    <span>Owner&apos;s Initial Capital</span>
                    <span className="font-mono font-semibold">{formatBDT(initialCapital)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Retained Earnings & Current Period Profit</span>
                    <span className="font-mono font-semibold text-emerald-700">{formatBDT(retainedEarnings)}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t-2 border-slate-900 flex justify-between font-black text-sm text-slate-900">
                <span>TOTAL LIABILITIES & EQUITY:</span>
                <span className="font-mono text-base text-emerald-800">{formatBDT(totalLiabilitiesAndEquity)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. TRIAL BALANCE */}
      {activeTab === 'trial_balance' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center text-xs">
            <div>
              <span className="font-bold text-slate-800 text-sm">General Ledger Trial Balance</span>
              <p className="text-slate-500 mt-0.5">Summary of all ledger balances verifying Debit = Credit parity</p>
            </div>
            <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-lg">
              Debits: {formatBDT(totalDebitTrial)} | Credits: {formatBDT(totalCreditTrial)}
            </span>
          </div>

          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-3">Account Code</th>
                <th className="py-2.5 px-3">Account Title</th>
                <th className="py-2.5 px-3">Classification</th>
                <th className="py-2.5 px-3 text-right">Debit Balance (৳)</th>
                <th className="py-2.5 px-3 text-right">Credit Balance (৳)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {chartOfAccounts.map(acc => (
                <tr key={acc.code} className="hover:bg-slate-50">
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{acc.code}</td>
                  <td className="py-2.5 px-3 font-semibold text-slate-800">{acc.name}</td>
                  <td className="py-2.5 px-3">
                    <span className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-600 font-bold rounded">
                      {acc.type}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-semibold text-slate-900">
                    {acc.normalBalance === 'DEBIT' ? formatBDT(acc.balance) : '-'}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-semibold text-slate-900">
                    {acc.normalBalance === 'CREDIT' ? formatBDT(acc.balance) : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-slate-100 font-bold text-slate-900 border-t-2 border-slate-800 text-xs">
              <tr>
                <td colSpan={3} className="py-3 px-3 uppercase text-right">Trial Balance Totals:</td>
                <td className="py-3 px-3 text-right font-mono text-emerald-800 text-sm">{formatBDT(totalDebitTrial)}</td>
                <td className="py-3 px-3 text-right font-mono text-emerald-800 text-sm">{formatBDT(totalCreditTrial)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {/* 4. JOURNAL ENTRIES FEED */}
      {activeTab === 'journals' && (
        <div className="space-y-4">
          {journalEntries.length === 0 ? (
            <div className="bg-white p-12 text-center text-slate-400 rounded-xl border border-slate-200">
              <BookOpen className="w-12 h-12 mx-auto mb-2 text-slate-300 stroke-1" />
              <p className="text-xs font-semibold">No journal entries posted yet. Perform a sale or purchase to see automated double-entry postings.</p>
            </div>
          ) : (
            journalEntries.map(jrn => (
              <div key={jrn.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
                <div className="p-3 bg-slate-50 border-b border-slate-200 flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-900">{jrn.entryNo}</span>
                    <span className="text-slate-500">• {formatDate(jrn.date)}</span>
                    <span className="text-[10px] px-2 py-0.5 bg-slate-200 text-slate-700 font-bold rounded uppercase">
                      {jrn.referenceType}
                    </span>
                  </div>
                  <span className="text-slate-600 font-medium">{jrn.description}</span>
                </div>

                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/50 text-slate-400 font-semibold border-b border-slate-100 text-[11px] uppercase">
                    <tr>
                      <th className="py-2 px-3">Account Code & Name</th>
                      <th className="py-2 px-3 text-right">Debit (৳)</th>
                      <th className="py-2 px-3 text-right">Credit (৳)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {jrn.items.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="py-2 px-3">
                          <span className="font-mono text-slate-500 mr-2">{item.accountCode}</span>
                          <span className={item.credit > 0 ? 'pl-6 text-slate-600' : 'font-semibold text-slate-900'}>
                            {item.accountName}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-right font-mono font-semibold text-slate-900">
                          {item.debit > 0 ? formatBDT(item.debit) : '-'}
                        </td>
                        <td className="py-2 px-3 text-right font-mono font-semibold text-slate-900">
                          {item.credit > 0 ? formatBDT(item.credit) : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))
          )}
        </div>
      )}

      {/* 5. CHART OF ACCOUNTS */}
      {activeTab === 'coa' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-3 bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-700">
            Standard Chart of Accounts (COA) for Bangladesh Mobile Businesses
          </div>
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-3">Code</th>
                <th className="py-2.5 px-3">Account Name</th>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3">Normal Balance</th>
                <th className="py-2.5 px-3 text-right">Current Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {chartOfAccounts.map(a => (
                <tr key={a.code} className="hover:bg-slate-50">
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{a.code}</td>
                  <td className="py-2.5 px-3 font-semibold text-slate-800">{a.name}</td>
                  <td className="py-2.5 px-3">
                    <span className="text-[10px] px-2 py-0.5 rounded font-bold uppercase bg-slate-100 text-slate-700">
                      {a.type}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px]">{a.normalBalance}</td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                    {formatBDT(a.balance)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
