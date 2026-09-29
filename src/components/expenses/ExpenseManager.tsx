import React, { useState } from 'react';
import { 
  Receipt, Plus, Search, Filter, Wallet, ArrowDownRight, 
  Calendar, Check, X, FileText
} from 'lucide-react';
import { useERP } from '../../services/erpStore';
import { formatBDT, formatDate } from '../../utils/formatters';

interface ExpenseManagerProps {
  onOpenNewExpense?: () => void;
}

export const ExpenseManager: React.FC<ExpenseManagerProps> = () => {
  const { 
    expenses, expenseCategories, cashAccounts, bankAccounts, 
    branches, createExpense, language, currentBranchId 
  } = useERP();

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);

  // Add Expense fields
  const [categoryId, setCategoryId] = useState(expenseCategories[0]?.id || '');
  const [amount, setAmount] = useState(0);
  const [paidFromAccountId, setPaidFromAccountId] = useState(cashAccounts[0]?.id || '');
  const [recipient, setRecipient] = useState('');
  const [description, setDescription] = useState('');
  const [voucherNo, setVoucherNo] = useState('');
  const [branchId, setBranchId] = useState(currentBranchId !== 'all' ? currentBranchId : branches[0].id);

  const filteredExpenses = expenses
    .filter(e => currentBranchId === 'all' || e.branchId === currentBranchId)
    .filter(e => {
      const q = searchTerm.toLowerCase();
      const matchSearch = 
        e.categoryName.toLowerCase().includes(q) ||
        e.recipient.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) ||
        (e.voucherNo && e.voucherNo.toLowerCase().includes(q));
      const matchCategory = categoryFilter === 'ALL' || e.categoryId === categoryFilter;
      return matchSearch && matchCategory;
    });

  const totalExpenseAmount = filteredExpenses.reduce((acc, e) => acc + e.amount, 0);

  const handleCreateExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0 || !recipient.trim()) return;

    createExpense({
      categoryId,
      amount,
      paidFromAccountId,
      recipient,
      description: description || 'Operating expense',
      voucherNo: voucherNo || `VCH-${Date.now().toString().slice(-4)}`,
      branchId
    });

    setShowAddModal(false);
    setAmount(0);
    setRecipient('');
    setDescription('');
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            {language === 'bn' ? 'দোকান ও ব্যবসা খরচ (Expenses)' : 'Shop & Operating Expenses'}
          </h1>
          <p className="text-xs text-slate-500">
            {language === 'bn' 
              ? 'দোকান ভাড়া, স্টাফ বেতন, বিদ্যুৎ বিল, সুন্দরবন কুরিয়ার ও বিজ্ঞাপন খরচের হিসাব' 
              : 'Record utility bills, shop rent, logistics/courier, marketing, and staff salaries.'}
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 self-start sm:self-auto shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>{language === 'bn' ? '+ নতুন খরচ লিখুন' : '+ Record New Expense'}</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <p className="text-xs font-semibold text-rose-600 uppercase">Total Expenses Recorded</p>
          <p className="text-xl font-black text-rose-600 font-mono mt-1">{formatBDT(totalExpenseAmount)}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">{filteredExpenses.length} Vouchers posted</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <p className="text-xs font-semibold text-slate-500 uppercase">Top Expense Head</p>
          <p className="text-xl font-black text-slate-900 mt-1">Shop & Showroom Rent</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Bashundhara City & Jamuna Future Park</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <p className="text-xs font-semibold text-emerald-600 uppercase">Accounting Integration</p>
          <p className="text-xl font-black text-emerald-700 mt-1">100% Automated</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Deducted from Profit & Loss statement</p>
        </div>
      </div>

      {/* Search & Category Filter */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search recipient, category, voucher..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-slate-500 font-medium">Category:</span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs font-medium p-2 border border-slate-200 rounded-lg bg-slate-50"
          >
            <option value="ALL">All Categories</option>
            {expenseCategories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Expense Vouchers Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-3">Voucher #</th>
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3">Expense Category</th>
                <th className="py-3 px-3">Paid To / Recipient</th>
                <th className="py-3 px-3">Description</th>
                <th className="py-3 px-3">Paid From</th>
                <th className="py-3 px-3 text-right">Amount (৳)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No expense records found.
                  </td>
                </tr>
              ) : (
                filteredExpenses.map(exp => (
                  <tr key={exp.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-3 font-mono font-bold text-slate-900">
                      {exp.voucherNo}
                      <span className="block text-[10px] text-slate-400 font-normal">{exp.branchName}</span>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap text-slate-500">
                      {formatDate(exp.date)}
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-900">
                      {exp.categoryName}
                    </td>
                    <td className="py-3 px-3 text-slate-800">
                      {exp.recipient}
                    </td>
                    <td className="py-3 px-3 text-slate-600 max-w-xs">
                      {exp.description}
                    </td>
                    <td className="py-3 px-3 text-slate-500">
                      {exp.paidFromAccountName}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-rose-600 text-sm">
                      {formatBDT(exp.amount)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Expense Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md border border-slate-200 overflow-hidden">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <h2 className="text-sm font-bold flex items-center gap-2">
                <Receipt className="w-4 h-4 text-rose-400" />
                <span>Record New Shop Expense (খরচ এন্ট্রি)</span>
              </h2>
              <button onClick={() => setShowAddModal(false)}>
                <X className="w-5 h-5 text-slate-400 hover:text-white" />
              </button>
            </div>
            <form onSubmit={handleCreateExpense} className="p-5 space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 mb-1 block">Expense Head / Category</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                >
                  {expenseCategories.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.nameBn})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 mb-1 block">Expense Amount (৳) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={amount || ''}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  placeholder="0"
                  className="w-full p-2 font-mono font-bold text-base text-rose-600 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 mb-1 block">Paid From Account</label>
                  <select
                    value={paidFromAccountId}
                    onChange={(e) => setPaidFromAccountId(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg truncate"
                  >
                    <optgroup label="Cash Counters">
                      {cashAccounts.map(ca => (
                        <option key={ca.id} value={ca.id}>{ca.name}</option>
                      ))}
                    </optgroup>
                    <optgroup label="Bank / MFS">
                      {bankAccounts.map(ba => (
                        <option key={ba.id} value={ba.id}>{ba.bankName}</option>
                      ))}
                    </optgroup>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 mb-1 block">Branch</label>
                  <select
                    value={branchId}
                    onChange={(e) => setBranchId(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  >
                    {branches.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 mb-1 block">Paid To / Recipient *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sundarban Courier or Building Landlord"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 mb-1 block">Description</label>
                <input
                  type="text"
                  placeholder="e.g. Parcel delivery charges for dealer shipment"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 mb-1 block">Voucher / Bill No</label>
                <input
                  type="text"
                  placeholder="e.g. VCH-2026-099"
                  value={voucherNo}
                  onChange={(e) => setVoucherNo(e.target.value)}
                  className="w-full p-2 font-mono border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold"
                >
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
