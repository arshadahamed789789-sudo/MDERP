import React, { useState, useEffect } from 'react';
import { X, Check, Trash2, Edit3, AlertCircle, Receipt, DollarSign } from 'lucide-react';
import { ExpenseRecord } from '../../types/erp';
import { useERP } from '../../services/erpStore';
import { formatBDT } from '../../utils/formatters';

interface EditExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  expense: ExpenseRecord | null;
}

export const EditExpenseModal: React.FC<EditExpenseModalProps> = ({
  isOpen,
  onClose,
  expense
}) => {
  const { expenseCategories, updateExpense, deleteExpense, language } = useERP();

  const [categoryId, setCategoryId] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [recipient, setRecipient] = useState('');
  const [description, setDescription] = useState('');
  const [voucherNo, setVoucherNo] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (expense) {
      setCategoryId(expense.categoryId);
      setAmount(expense.amount);
      setRecipient(expense.recipient);
      setDescription(expense.description || '');
      setVoucherNo(expense.voucherNo || '');
      setConfirmDelete(false);
      setErrorMsg('');
    }
  }, [expense, isOpen]);

  if (!isOpen || !expense) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || amount <= 0) {
      setErrorMsg(language === 'bn' ? 'সঠিক খরচের পরিমাণ লিখুন' : 'Please enter a valid amount');
      return;
    }
    if (!recipient.trim()) {
      setErrorMsg(language === 'bn' ? 'টাকা গ্রহণকারীর নাম লিখুন' : 'Recipient name is required');
      return;
    }

    updateExpense(expense.id, {
      categoryId,
      amount: Number(amount),
      recipient: recipient.trim(),
      description: description.trim(),
      voucherNo: voucherNo.trim()
    });

    onClose();
  };

  const handleDelete = () => {
    deleteExpense(expense.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in-50">
      <div 
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/30">
              <Edit3 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-wide">
                {language === 'bn' ? 'খরচ ভাউচার সম্পাদনা' : 'Edit Expense Voucher'}
              </h2>
              <p className="text-[11px] text-slate-400">
                {expense.voucherNo} • {expense.branchName}
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
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-xs">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <label className="font-bold text-slate-700 mb-1 block">Expense Head / Category</label>
            <select
              value={categoryId}
              onChange={e => setCategoryId(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium focus:bg-white"
            >
              {expenseCategories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 mb-1 block">Amount (৳) *</label>
              <input
                type="number"
                min="1"
                required
                value={amount}
                onChange={e => setAmount(Number(e.target.value))}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold text-rose-600 focus:bg-white"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 mb-1 block">Voucher No.</label>
              <input
                type="text"
                value={voucherNo}
                onChange={e => setVoucherNo(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 mb-1 block">Paid To / Recipient *</label>
            <input
              type="text"
              required
              value={recipient}
              onChange={e => setRecipient(e.target.value)}
              placeholder="e.g. Landlord, Courier boy"
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white font-medium"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 mb-1 block">Description / Remarks</label>
            <textarea
              rows={2}
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white"
            />
          </div>

          {/* Delete Danger Zone */}
          <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            {!confirmDelete ? (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1.5 py-1 px-2 hover:bg-rose-50 rounded-lg transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Voucher</span>
              </button>
            ) : (
              <div className="flex items-center gap-2 bg-rose-50 p-2 rounded-xl border border-rose-200">
                <span className="text-rose-800 font-semibold text-[11px]">Confirm delete?</span>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg"
                >
                  Yes, Delete
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  className="px-2.5 py-1 bg-slate-200 text-slate-700 font-semibold rounded-lg"
                >
                  Cancel
                </button>
              </div>
            )}

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                {language === 'bn' ? 'বাতিল' : 'Cancel'}
              </button>
              <button
                type="submit"
                className="px-5 py-2 font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-md transition flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{language === 'bn' ? 'পরিবর্তন সংরক্ষণ করুন' : 'Save Changes'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
