import React, { useState } from 'react';
import { 
  FileText, X, CheckCircle2, AlertCircle, 
  ArrowDownLeft, ArrowUpRight, Wallet, Landmark, User, Building2
} from 'lucide-react';
import { useERP } from '../../services/erpStore';
import { formatBDT } from '../../utils/formatters';

interface QuickLedgerEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultType?: 'CUSTOMER_PAYMENT' | 'SUPPLIER_PAYMENT';
  onSuccess?: () => void;
}

export const QuickLedgerEntryModal: React.FC<QuickLedgerEntryModalProps> = ({
  isOpen,
  onClose,
  defaultType = 'CUSTOMER_PAYMENT',
  onSuccess
}) => {
  const { 
    customers, suppliers, cashAccounts, bankAccounts, 
    receiveCustomerPayment, paySupplier, language 
  } = useERP();

  const [entryType, setEntryType] = useState<'CUSTOMER_PAYMENT' | 'SUPPLIER_PAYMENT'>(defaultType);
  const [selectedPartyId, setSelectedPartyId] = useState('');
  const [amount, setAmount] = useState('');
  const [accountId, setAccountId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Bank' | 'bKash' | 'Nagad' | 'Rocket'>('Cash');
  const [trxId, setTrxId] = useState('');
  const [notes, setNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  // Active party info
  const activeCustomer = entryType === 'CUSTOMER_PAYMENT' 
    ? customers.find(c => c.id === selectedPartyId) 
    : null;
  const activeSupplier = entryType === 'SUPPLIER_PAYMENT' 
    ? suppliers.find(s => s.id === selectedPartyId) 
    : null;

  // Default account if not selected
  const availableAccounts = [
    ...cashAccounts.map(c => ({ id: c.id, name: c.name, type: 'Cash', balance: c.balance })),
    ...bankAccounts.map(b => ({ id: b.id, name: `${b.bankName} - ${b.accountName}`, type: 'Bank', balance: b.balance }))
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!selectedPartyId) {
      setErrorMsg(language === 'bn' ? 'অনুগ্রহ করে পার্টি নির্বাচন করুন' : 'Please select a customer or supplier');
      return;
    }
    if (isNaN(numAmount) || numAmount <= 0) {
      setErrorMsg(language === 'bn' ? 'সঠিক টাকার পরিমাণ দিন' : 'Please enter a valid positive amount');
      return;
    }
    const accToUse = accountId || availableAccounts[0]?.id;
    if (!accToUse) {
      setErrorMsg('No cash or bank account available');
      return;
    }

    if (entryType === 'CUSTOMER_PAYMENT') {
      const ok = receiveCustomerPayment({
        customerId: selectedPartyId,
        amount: numAmount,
        accountId: accToUse,
        method: paymentMethod,
        trxId: trxId.trim() || undefined,
        notes: notes.trim() || undefined
      });
      if (ok) {
        setIsSuccess(true);
        if (onSuccess) onSuccess();
        setTimeout(() => {
          handleReset();
          onClose();
        }, 1400);
      } else {
        setErrorMsg('Failed to record customer payment');
      }
    } else {
      const ok = paySupplier({
        supplierId: selectedPartyId,
        amount: numAmount,
        accountId: accToUse,
        method: paymentMethod,
        trxId: trxId.trim() || undefined,
        notes: notes.trim() || undefined
      });
      if (ok) {
        setIsSuccess(true);
        if (onSuccess) onSuccess();
        setTimeout(() => {
          handleReset();
          onClose();
        }, 1400);
      } else {
        setErrorMsg('Failed to record supplier payment');
      }
    }
  };

  const handleReset = () => {
    setSelectedPartyId('');
    setAmount('');
    setAccountId('');
    setPaymentMethod('Cash');
    setTrxId('');
    setNotes('');
    setErrorMsg('');
    setIsSuccess(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs select-none animate-in fade-in-50">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4.5 bg-gradient-to-r from-[#1E60D5] to-[#2563EB] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-white/20 flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-black tracking-tight">
                {language === 'bn' ? 'খতিয়ান ও লেজার এন্ট্রি (Create Ledger Entry)' : 'Record Ledger Payment Entry'}
              </h2>
              <p className="text-[11px] text-white/80 font-medium">
                {language === 'bn' ? 'বাকি আদায় অথবা মহাজন পেমেন্ট সরাসরি খতিয়ানে জমা করুন' : 'Instant party ledger credit/debit transaction voucher'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => { handleReset(); onClose(); }}
            className="p-1.5 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition active:scale-90"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {isSuccess ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-lg font-black text-slate-900">
              {language === 'bn' ? 'লেজার এন্ট্রি সফলভাবে সম্পন্ন হয়েছে!' : 'Ledger Entry Recorded Successfully!'}
            </h3>
            <p className="text-xs text-slate-500">
              {entryType === 'CUSTOMER_PAYMENT' 
                ? (language === 'bn' ? 'কাস্টমারের বাকি কমে গেছে এবং ক্যাশ ব্যালেন্স বৃদ্ধি পেয়েছে।' : 'Customer receivable credited and cash account updated.')
                : (language === 'bn' ? 'সাপ্লায়ারের বকেয়া কমে গেছে এবং পেমেন্ট ভাউচার জেনারেট হয়েছে।' : 'Supplier payable settled and account debited.')}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {errorMsg && (
              <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Type Segmented Pill Bar */}
            <div className="p-1 bg-slate-100 rounded-2xl flex items-center text-xs font-bold">
              <button
                type="button"
                onClick={() => { setEntryType('CUSTOMER_PAYMENT'); setSelectedPartyId(''); }}
                className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-1.5 transition ${
                  entryType === 'CUSTOMER_PAYMENT' 
                    ? 'bg-white text-[#1E60D5] shadow-xs font-black' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ArrowDownLeft className="w-4 h-4 text-emerald-600" />
                <span>{language === 'bn' ? 'কাস্টমার / ডিলার বাকি আদায়' : 'Customer Due Collection'}</span>
              </button>
              <button
                type="button"
                onClick={() => { setEntryType('SUPPLIER_PAYMENT'); setSelectedPartyId(''); }}
                className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-1.5 transition ${
                  entryType === 'SUPPLIER_PAYMENT' 
                    ? 'bg-white text-[#1E60D5] shadow-xs font-black' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ArrowUpRight className="w-4 h-4 text-rose-600" />
                <span>{language === 'bn' ? 'মহাজন / সাপ্লায়ার পেমেন্ট' : 'Supplier Payment'}</span>
              </button>
            </div>

            {/* Party Selector */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                <span>
                  {entryType === 'CUSTOMER_PAYMENT' 
                    ? (language === 'bn' ? 'কাস্টমার / ডিলার নির্বাচন করুন *' : 'Select Customer / Dealer *')
                    : (language === 'bn' ? 'সাপ্লায়ার / ভেন্ডর নির্বাচন করুন *' : 'Select Supplier / Vendor *')}
                </span>
                {(activeCustomer || activeSupplier) && (
                  <span className={`text-[11px] font-mono font-bold ${
                    (activeCustomer?.currentDue || activeSupplier?.currentPayable || 0) > 0 ? 'text-rose-600' : 'text-slate-500'
                  }`}>
                    {entryType === 'CUSTOMER_PAYMENT' ? 'Total Due: ' : 'Payable: '}
                    {formatBDT(activeCustomer?.currentDue || activeSupplier?.currentPayable || 0)}
                  </span>
                )}
              </label>

              <select
                value={selectedPartyId}
                onChange={(e) => setSelectedPartyId(e.target.value)}
                className="w-full text-xs font-bold p-2.5 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-[#1E60D5] outline-none transition"
                required
              >
                <option value="">-- Choose Party --</option>
                {entryType === 'CUSTOMER_PAYMENT' ? (
                  customers.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.businessName ? `(${c.businessName})` : ''} - Due: {formatBDT(c.currentDue)}
                    </option>
                  ))
                ) : (
                  suppliers.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.company}) - Payable: {formatBDT(s.currentPayable)}
                    </option>
                  ))
                )}
              </select>
            </div>

            {/* Amount & Payment Method */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">
                  {language === 'bn' ? 'টাকার পরিমাণ (BDT) *' : 'Payment Amount (BDT) *'}
                </label>
                <input
                  type="number"
                  min="1"
                  step="any"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full text-xs font-mono font-black p-2.5 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-[#1E60D5] outline-none transition"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">
                  {language === 'bn' ? 'পেমেন্ট মাধ্যম' : 'Payment Method'}
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="w-full text-xs font-bold p-2.5 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-[#1E60D5] outline-none transition"
                >
                  <option value="Cash">Cash (নগদ)</option>
                  <option value="bKash">bKash (বিকাশ)</option>
                  <option value="Nagad">Nagad (নগদ অ্যাপ)</option>
                  <option value="Rocket">Rocket (রকেট)</option>
                  <option value="Bank">Bank Transfer (ব্যাংক)</option>
                </select>
              </div>
            </div>

            {/* Deposit / Withdraw Account */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">
                {entryType === 'CUSTOMER_PAYMENT' 
                  ? (language === 'bn' ? 'জমা হওয়ার একাউন্ট (Cash / Bank)' : 'Deposit Account')
                  : (language === 'bn' ? 'যে একাউন্ট থেকে পরিশোধ হবে' : 'Paid From Account')}
              </label>
              <select
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                className="w-full text-xs font-bold p-2.5 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-[#1E60D5] outline-none transition"
              >
                {availableAccounts.map(acc => (
                  <option key={acc.id} value={acc.id}>
                    {acc.type === 'Cash' ? '💵 ' : '🏛️ '} {acc.name} (Balance: {formatBDT(acc.balance)})
                  </option>
                ))}
              </select>
            </div>

            {/* TrxID / Voucher Note */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">
                  {language === 'bn' ? 'ট্রানজ্যাকশন আইডি / রেফারেন্স' : 'Trx ID / Ref #' }
                </label>
                <input
                  type="text"
                  placeholder="e.g. TRX-904812"
                  value={trxId}
                  onChange={(e) => setTrxId(e.target.value)}
                  className="w-full text-xs font-mono p-2.5 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-[#1E60D5] outline-none transition"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">
                  {language === 'bn' ? 'মন্তব্য / বিবরণ' : 'Description / Notes'}
                </label>
                <input
                  type="text"
                  placeholder="e.g. Partial due payment"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-[#1E60D5] outline-none transition"
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => { handleReset(); onClose(); }}
                className="px-4 py-2.5 rounded-2xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition active:scale-95 cursor-pointer"
              >
                {language === 'bn' ? 'বাতিল' : 'Cancel'}
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-[#1E60D5] hover:bg-blue-700 text-white rounded-2xl text-xs font-black shadow-md shadow-blue-600/25 transition active:scale-95 cursor-pointer flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{language === 'bn' ? 'লেজার ভাউচার সেভ করুন' : 'Confirm Ledger Entry'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
