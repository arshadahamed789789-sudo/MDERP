import React, { useState } from 'react';
import { 
  Receipt, X, Check, DollarSign, Building, Wallet, FileText, 
  ArrowRight, Tag, AlertCircle 
} from 'lucide-react';
import { useERP } from '../../services/erpStore';
import { formatBDT } from '../../utils/formatters';

interface NewExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const NewExpenseModal: React.FC<NewExpenseModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { 
    expenseCategories, cashAccounts, bankAccounts, 
    branches, createExpense, language, currentBranchId 
  } = useERP();

  const [categoryId, setCategoryId] = useState(expenseCategories[0]?.id || '');
  const [amount, setAmount] = useState<number | ''>('');
  const [paidFromAccountId, setPaidFromAccountId] = useState(cashAccounts[0]?.id || bankAccounts[0]?.id || '');
  const [recipient, setRecipient] = useState('');
  const [description, setDescription] = useState('');
  const [voucherNo, setVoucherNo] = useState(`VCH-${Date.now().toString().slice(-4)}`);
  const [branchId, setBranchId] = useState(currentBranchId !== 'all' ? currentBranchId : (branches[0]?.id || ''));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const allAccounts = [
    ...cashAccounts.map(c => ({ id: c.id, name: `${c.name} (Balance: ${formatBDT(c.balance)})`, type: 'Cash' })),
    ...bankAccounts.map(b => ({ id: b.id, name: `${b.bankName} - ${b.accountNumber} (${formatBDT(b.balance)})`, type: 'Bank/MFS' }))
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) {
      setErrorMsg(language === 'bn' ? 'খরচের সঠিক পরিমাণ লিখুন' : 'Please enter a valid expense amount');
      return;
    }
    if (!recipient.trim()) {
      setErrorMsg(language === 'bn' ? 'টাকা গ্রহণকারীর নাম লিখুন' : 'Please enter recipient name');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      createExpense({
        categoryId,
        amount: numAmount,
        paidFromAccountId,
        recipient: recipient.trim(),
        description: description.trim() || 'Daily shop operating expense',
        voucherNo: voucherNo.trim() || `VCH-${Date.now().toString().slice(-4)}`,
        branchId
      });

      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to record expense');
    } finally {
      setIsSubmitting(false);
    }
  };

  const applyPreset = (presetAmount: number, presetCat: string, presetDesc: string, presetRecipient: string) => {
    setAmount(presetAmount);
    const cat = expenseCategories.find(c => c.name.toLowerCase().includes(presetCat.toLowerCase()));
    if (cat) setCategoryId(cat.id);
    setDescription(presetDesc);
    setRecipient(presetRecipient);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in-50">
      <div 
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/30">
              <Receipt className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-wide">
                {language === 'bn' ? 'নতুন দোকান খরচ ভাউচার' : 'Record Operating Expense'}
              </h2>
              <p className="text-[11px] text-slate-400">
                {language === 'bn' ? 'ভাউচার পোস্টিং ও ক্যাশ/ব্যাংক থেকে কর্তন' : 'Posts directly to general ledger & daily cashbook'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Quick presets */}
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
              {language === 'bn' ? 'কুইক খরচ প্রিসেট' : 'Quick Presets'}
            </span>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => applyPreset(500, 'entertain', 'স্টাফ নাস্তা ও চা-পানি', 'দোকানের নাস্তা')}
                className="px-2.5 py-1 text-[11px] bg-slate-100 hover:bg-rose-50 hover:text-rose-700 rounded-lg text-slate-600 font-medium transition border border-slate-200"
              >
                ☕ চা-নাস্তা (৳500)
              </button>
              <button
                type="button"
                onClick={() => applyPreset(1200, 'courier', 'সুন্দরবন কুরিয়ার পার্সেল চার্জ', 'সুন্দরবন কুরিয়ার')}
                className="px-2.5 py-1 text-[11px] bg-slate-100 hover:bg-rose-50 hover:text-rose-700 rounded-lg text-slate-600 font-medium transition border border-slate-200"
              >
                📦 কুরিয়ার ফি (৳1,200)
              </button>
              <button
                type="button"
                onClick={() => applyPreset(4500, 'utility', 'দোকানের বিদ্যুৎ বিল পরিশোধ', 'ডেসকো / ডিপিডিসি')}
                className="px-2.5 py-1 text-[11px] bg-slate-100 hover:bg-rose-50 hover:text-rose-700 rounded-lg text-slate-600 font-medium transition border border-slate-200"
              >
                ⚡ বিদ্যুৎ বিল (৳4,500)
              </button>
              <button
                type="button"
                onClick={() => applyPreset(30000, 'rent', 'দোকানের মাসিক স্পেস ভাড়া', 'মার্কেট কমিটি / মালিক')}
                className="px-2.5 py-1 text-[11px] bg-slate-100 hover:bg-rose-50 hover:text-rose-700 rounded-lg text-slate-600 font-medium transition border border-slate-200"
              >
                🏢 দোকান ভাড়া (৳30,000)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Category */}
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                {language === 'bn' ? 'খরচের খাত / ক্যাটাগরি *' : 'Expense Category *'}
              </label>
              <select
                value={categoryId}
                onChange={e => setCategoryId(e.target.value)}
                required
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-rose-500"
              >
                {expenseCategories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            {/* Amount */}
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                {language === 'bn' ? 'টাকার পরিমাণ (BDT) *' : 'Amount (BDT) *'}
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">৳</span>
                <input
                  type="number"
                  min="1"
                  step="any"
                  required
                  placeholder="0.00"
                  value={amount}
                  onChange={e => setAmount(e.target.value ? Number(e.target.value) : '')}
                  className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-rose-700 focus:bg-white focus:ring-2 focus:ring-rose-500"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Paid From Account */}
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                {language === 'bn' ? 'যে একাউন্ট থেকে প্রদান করা হয়েছে *' : 'Paid From Account *'}
              </label>
              <select
                value={paidFromAccountId}
                onChange={e => setPaidFromAccountId(e.target.value)}
                required
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-rose-500"
              >
                {allAccounts.map(acc => (
                  <option key={acc.id} value={acc.id}>
                    [{acc.type}] {acc.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Branch */}
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                {language === 'bn' ? 'শাখা / ব্রাঞ্চ *' : 'Branch *'}
              </label>
              <select
                value={branchId}
                onChange={e => setBranchId(e.target.value)}
                required
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-rose-500"
              >
                {branches.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Recipient */}
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                {language === 'bn' ? 'টাকা গ্রহণকারী / ব্যক্তি / প্রতিষ্ঠান *' : 'Recipient / Payee Name *'}
              </label>
              <input
                type="text"
                required
                placeholder={language === 'bn' ? 'উদা: মোঃ আরিফ হোসেন / কুরিয়ার বয়' : 'e.g. Market Committee / Staff name'}
                value={recipient}
                onChange={e => setRecipient(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-rose-500"
              />
            </div>

            {/* Voucher No */}
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                {language === 'bn' ? 'ভাউচার নাম্বার' : 'Voucher No.'}
              </label>
              <input
                type="text"
                value={voucherNo}
                onChange={e => setVoucherNo(e.target.value)}
                placeholder="VCH-1001"
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-800 focus:bg-white focus:ring-2 focus:ring-rose-500"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-[11px] font-bold text-slate-700 block mb-1">
              {language === 'bn' ? 'খরচের বিবরণ ও মন্তব্য' : 'Description / Remarks'}
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder={language === 'bn' ? 'খরচের প্রাসঙ্গিক বিবরণ লিখুন...' : 'Notes regarding this expense voucher...'}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-rose-500"
            />
          </div>

          {/* Action buttons */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              {language === 'bn' ? 'বাতিল' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-md transition flex items-center gap-1.5 disabled:opacity-50"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Posting...' : (language === 'bn' ? 'ভাউচার সংরক্ষণ করুন' : 'Post Expense Voucher')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
