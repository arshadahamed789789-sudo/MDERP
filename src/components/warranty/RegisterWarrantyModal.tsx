import React, { useState } from 'react';
import { 
  ShieldAlert, X, Smartphone, User, Phone, 
  FileText, CheckCircle2, AlertCircle, Search
} from 'lucide-react';
import { useERP } from '../../services/erpStore';

interface RegisterWarrantyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (claimNo: string) => void;
}

export const RegisterWarrantyModal: React.FC<RegisterWarrantyModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { imeis, customers, createWarrantyClaim, language } = useERP();

  const [imeiInput, setImeiInput] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [problemDescription, setProblemDescription] = useState('');
  const [matchedImeiInfo, setMatchedImeiInfo] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [successClaimNo, setSuccessClaimNo] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleImeiChange = (val: string) => {
    setImeiInput(val);
    setErrorMsg('');
    if (!val.trim()) {
      setMatchedImeiInfo(null);
      return;
    }
    const cleanVal = val.trim().toLowerCase();
    const match = imeis.find(i => 
      i.imei1.toLowerCase().includes(cleanVal) || 
      (i.imei2 && i.imei2.toLowerCase().includes(cleanVal))
    );
    if (match) {
      setMatchedImeiInfo(match);
      if (match.customerName && !customerName) {
        setCustomerName(match.customerName);
      }
      if (match.customerId && !customerPhone) {
        const cust = customers.find(c => c.id === match.customerId);
        if (cust?.mobile) setCustomerPhone(cust.mobile);
      }
    } else {
      setMatchedImeiInfo(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!imeiInput.trim()) {
      setErrorMsg(language === 'bn' ? 'অনুগ্রহ করে আইএমইআই (IMEI) নম্বর দিন' : 'Please provide IMEI number');
      return;
    }
    if (!customerName.trim()) {
      setErrorMsg(language === 'bn' ? 'কাস্টমারের নাম প্রদান করুন' : 'Please provide customer name');
      return;
    }
    if (!problemDescription.trim()) {
      setErrorMsg(language === 'bn' ? 'ডিভাইসের সমস্যার বিবরণ লিখুন' : 'Please enter problem description');
      return;
    }

    const res = createWarrantyClaim({
      imei: imeiInput.trim(),
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      problemDescription: problemDescription.trim()
    });

    if (res.success && res.claimNo) {
      setSuccessClaimNo(res.claimNo);
      if (onSuccess) onSuccess(res.claimNo);
      setTimeout(() => {
        handleReset();
        onClose();
      }, 1500);
    } else {
      setErrorMsg(res.error || 'Failed to register claim');
    }
  };

  const handleReset = () => {
    setImeiInput('');
    setCustomerName('');
    setCustomerPhone('');
    setProblemDescription('');
    setMatchedImeiInfo(null);
    setErrorMsg('');
    setSuccessClaimNo(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs select-none animate-in fade-in-50">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4.5 bg-gradient-to-r from-rose-600 to-pink-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-white/20 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-black tracking-tight">
                {language === 'bn' ? 'ওয়ারেন্টি সার্ভিসিং এন্ট্রি (Register Warranty)' : 'Register Warranty Claim'}
              </h2>
              <p className="text-[11px] text-white/80 font-medium">
                {language === 'bn' ? 'ডিভাইস মেরামত বা রিপ্লেসমেন্ট ক্লেইম বুকিং' : 'Record device repair or warranty service ticket'}
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
        {successClaimNo ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-lg font-black text-slate-900">
              {language === 'bn' ? 'ওয়ারেন্টি ক্লেইম সফলভাবে নথিভুক্ত হয়েছে!' : 'Warranty Claim Registered!'}
            </h3>
            <p className="text-xs text-slate-500 font-mono font-bold bg-slate-100 px-3 py-1.5 rounded-full inline-block">
              Claim #{successClaimNo}
            </p>
            <p className="text-xs text-slate-500">
              {language === 'bn' ? 'টেকনিশিয়ান ও সার্ভিস ট্র্যাকিং লিস্টে আপডেট সম্পন্ন।' : 'Device queued for diagnostics & repair processing.'}
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

            {/* IMEI Lookup Field */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                <span>{language === 'bn' ? 'ডিভাইস আইএমইআই (IMEI 1 / 2) *' : 'Device IMEI 1 / 2 *'}</span>
                {matchedImeiInfo && (
                  <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    ✓ Found in Database
                  </span>
                )}
              </label>
              <div className="relative">
                <Smartphone className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="e.g. 864201047284910"
                  value={imeiInput}
                  onChange={(e) => handleImeiChange(e.target.value)}
                  className="w-full text-xs font-mono font-bold pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-rose-500 outline-none transition"
                  required
                />
              </div>
              {matchedImeiInfo && (
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900">{matchedImeiInfo.productName}</span>
                    <span className="text-slate-400 ml-1.5 font-mono">({matchedImeiInfo.variantName || 'Base'})</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                    matchedImeiInfo.status === 'SOLD' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    {matchedImeiInfo.status}
                  </span>
                </div>
              )}
            </div>

            {/* Customer Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">
                  {language === 'bn' ? 'গ্রাহকের নাম *' : 'Customer Name *'}
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Customer full name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full text-xs font-bold pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-rose-500 outline-none transition"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">
                  {language === 'bn' ? 'মোবাইল নম্বর' : 'Phone Number'}
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="tel"
                    placeholder="017XXXXXXXX"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full text-xs font-bold pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-rose-500 outline-none transition"
                  />
                </div>
              </div>
            </div>

            {/* Problem Description */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">
                {language === 'bn' ? 'সমস্যার বিবরণ (Problem Description) *' : 'Problem Description *'}
              </label>
              <textarea
                rows={3}
                placeholder={language === 'bn' ? 'যেমন: চার্জ হচ্ছে না, ডিসপ্লেতে দাগ, ক্যামেরা ব্লার...' : 'e.g. No power / display flickering / mic issue...'}
                value={problemDescription}
                onChange={(e) => setProblemDescription(e.target.value)}
                className="w-full text-xs font-medium p-3 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-rose-500 outline-none transition resize-none"
                required
              />
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
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl text-xs font-black shadow-md shadow-rose-600/25 transition active:scale-95 cursor-pointer flex items-center gap-1.5"
              >
                <ShieldAlert className="w-4 h-4" />
                <span>{language === 'bn' ? 'ক্লেইম সাবমিট করুন' : 'Submit Warranty Claim'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
