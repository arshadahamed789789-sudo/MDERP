import React, { useState, useEffect } from 'react';
import { X, Check, Trash2, Landmark, Wallet, AlertCircle } from 'lucide-react';
import { BankAccount, CashAccount } from '../../types/erp';
import { useERP } from '../../services/erpStore';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  accountToEdit?: { type: 'bank' | 'cash'; data: BankAccount | CashAccount } | null;
}

export const AccountModal: React.FC<AccountModalProps> = ({
  isOpen,
  onClose,
  accountToEdit
}) => {
  const { 
    branches, addCashAccount, updateCashAccount, deleteCashAccount,
    addBankAccount, updateBankAccount, deleteBankAccount, language 
  } = useERP();

  const isEdit = !!accountToEdit;
  const isCash = accountToEdit ? accountToEdit.type === 'cash' : false;

  const [categoryType, setCategoryType] = useState<'BANK' | 'CASH'>('BANK');
  const [bankName, setBankName] = useState('');
  const [accountName, setAccountName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [branchName, setBranchName] = useState('');
  const [accountSubtype, setAccountSubtype] = useState<'BANK' | 'BKASH_MERCHANT' | 'NAGAD_MERCHANT' | 'ROCKET'>('BANK');
  const [cashType, setCashType] = useState<'COUNTER_CASH' | 'MAIN_CASH' | 'PETTY_CASH'>('COUNTER_CASH');
  const [branchId, setBranchId] = useState(branches[0]?.id || '');
  const [openingBalance, setOpeningBalance] = useState(0);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (accountToEdit) {
      if (accountToEdit.type === 'cash') {
        const ca = accountToEdit.data as CashAccount;
        setCategoryType('CASH');
        setAccountName(ca.name);
        setCashType(ca.type);
        setBranchId(ca.branchId);
        setOpeningBalance(ca.balance);
      } else {
        const ba = accountToEdit.data as BankAccount;
        setCategoryType('BANK');
        setBankName(ba.bankName);
        setAccountName(ba.accountName);
        setAccountNumber(ba.accountNumber);
        setBranchName(ba.branchName);
        setAccountSubtype(ba.type);
        setOpeningBalance(ba.balance);
      }
      setConfirmDelete(false);
      setErrorMsg('');
    } else {
      setCategoryType('BANK');
      setBankName('');
      setAccountName('');
      setAccountNumber('');
      setBranchName('');
      setOpeningBalance(0);
      setConfirmDelete(false);
      setErrorMsg('');
    }
  }, [accountToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (categoryType === 'CASH') {
      if (!accountName.trim()) {
        setErrorMsg('Please enter Cashbox / Drawer Name');
        return;
      }
      if (isEdit && accountToEdit) {
        updateCashAccount(accountToEdit.data.id, {
          name: accountName.trim(),
          type: cashType,
          branchId
        });
      } else {
        addCashAccount({
          name: accountName.trim(),
          branchId,
          balance: Number(openingBalance) || 0,
          type: cashType
        });
      }
    } else {
      if (!bankName.trim() || !accountNumber.trim()) {
        setErrorMsg('Please enter Bank/Provider Name and Account Number');
        return;
      }
      if (isEdit && accountToEdit) {
        updateBankAccount(accountToEdit.data.id, {
          bankName: bankName.trim(),
          accountName: accountName.trim() || bankName.trim(),
          accountNumber: accountNumber.trim(),
          branchName: branchName.trim() || 'Principal Branch',
          type: accountSubtype
        });
      } else {
        addBankAccount({
          bankName: bankName.trim(),
          accountName: accountName.trim() || bankName.trim(),
          accountNumber: accountNumber.trim(),
          branchName: branchName.trim() || 'Principal Branch',
          balance: Number(openingBalance) || 0,
          type: accountSubtype
        });
      }
    }

    onClose();
  };

  const handleDelete = () => {
    if (!accountToEdit) return;
    if (accountToEdit.type === 'cash') {
      deleteCashAccount(accountToEdit.data.id);
    } else {
      deleteBankAccount(accountToEdit.data.id);
    }
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
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Landmark className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-wide">
                {isEdit ? 'একাউন্ট তথ্য সম্পাদনা' : 'নতুন একাউন্ট যুক্ত করুন'}
              </h2>
              <p className="text-[11px] text-slate-400">
                {isEdit ? 'Bank, MFS or Cash Drawer Details' : 'Add Bank, bKash/Nagad or Cash Drawer'}
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
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-xs">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {!isEdit && (
            <div>
              <label className="font-bold text-slate-700 mb-1 block">Account Category</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setCategoryType('BANK')}
                  className={`p-2 rounded-xl border text-center font-bold transition ${
                    categoryType === 'BANK' ? 'bg-blue-50 border-blue-500 text-blue-800' : 'bg-slate-50 text-slate-600'
                  }`}
                >
                  Bank / MFS
                </button>
                <button
                  type="button"
                  onClick={() => setCategoryType('CASH')}
                  className={`p-2 rounded-xl border text-center font-bold transition ${
                    categoryType === 'CASH' ? 'bg-emerald-50 border-emerald-500 text-emerald-800' : 'bg-slate-50 text-slate-600'
                  }`}
                >
                  Cash Drawer
                </button>
              </div>
            </div>
          )}

          {categoryType === 'CASH' ? (
            <>
              <div>
                <label className="font-bold text-slate-700 mb-1 block">Cash Drawer Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Counter Cash #3 (Jamuna)"
                  value={accountName}
                  onChange={e => setAccountName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 mb-1 block">Drawer Type</label>
                  <select
                    value={cashType}
                    onChange={e => setCashType(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium focus:bg-white"
                  >
                    <option value="COUNTER_CASH">Counter Cash</option>
                    <option value="MAIN_CASH">Main Showroom Vault</option>
                    <option value="PETTY_CASH">Petty Cash</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 mb-1 block">Operating Branch</label>
                  <select
                    value={branchId}
                    onChange={e => setBranchId(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium focus:bg-white"
                  >
                    {branches.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 mb-1 block">Provider / Bank *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. bKash Merchant / BRAC Bank"
                    value={bankName}
                    onChange={e => setBankName(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white font-medium"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 mb-1 block">Account Subtype</label>
                  <select
                    value={accountSubtype}
                    onChange={e => setAccountSubtype(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium focus:bg-white"
                  >
                    <option value="BANK">Commercial Bank</option>
                    <option value="BKASH_MERCHANT">bKash Merchant</option>
                    <option value="NAGAD_MERCHANT">Nagad Merchant</option>
                    <option value="ROCKET">Rocket Corporate</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 mb-1 block">Account Number / Wallet ID *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 01711XXXXXX or 15012039485"
                  value={accountNumber}
                  onChange={e => setAccountNumber(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 mb-1 block">Account Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Mobile D-ERP Ltd"
                    value={accountName}
                    onChange={e => setAccountName(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white font-medium"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 mb-1 block">Branch Location</label>
                  <input
                    type="text"
                    placeholder="e.g. Gulshan Branch"
                    value={branchName}
                    onChange={e => setBranchName(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white"
                  />
                </div>
              </div>
            </>
          )}

          {!isEdit && (
            <div>
              <label className="font-bold text-slate-700 mb-1 block">Initial / Opening Balance (৳)</label>
              <input
                type="number"
                min="0"
                value={openingBalance}
                onChange={e => setOpeningBalance(Number(e.target.value))}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white font-mono font-bold"
              />
            </div>
          )}

          {/* Delete Danger Zone */}
          <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            {isEdit ? (
              !confirmDelete ? (
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  className="text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1.5 py-1 px-2 hover:bg-rose-50 rounded-lg transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Account</span>
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
              )
            ) : <div />}

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
                className="px-5 py-2 font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md transition flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{isEdit ? 'Update Account' : 'Create Account'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
