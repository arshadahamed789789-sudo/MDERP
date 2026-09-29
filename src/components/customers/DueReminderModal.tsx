import React, { useState } from 'react';
import { MessageSquare, X, Copy, Check, ExternalLink, Send, ShieldAlert, Phone } from 'lucide-react';
import { useERP } from '../../services/erpStore';
import { formatBDT } from '../../utils/formatters';
import { Customer } from '../../types/erp';

interface DueReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer | null;
}

export const DueReminderModal: React.FC<DueReminderModalProps> = ({
  isOpen,
  onClose,
  customer
}) => {
  const { businessConfig, language } = useERP();
  const [templateType, setTemplateType] = useState<'friendly' | 'urgent' | 'bkash' | 'english'>('friendly');
  const [copied, setCopied] = useState(false);

  if (!isOpen || !customer) return null;

  const due = customer.currentDue;
  const custName = customer.name;
  const shopName = customer.businessName ? `(${customer.businessName})` : '';

  const getTemplateMessage = () => {
    switch (templateType) {
      case 'friendly':
        return `সম্মানিত ${custName} ${shopName}, ${businessConfig.name} থেকে শুভেচ্ছা। আপনার অ্যাকাউন্টে বর্তমান বাকি বকেয়া ৳${formatBDT(due, false)} টাকা। অনুগ্রহ করে চলতি সপ্তাহের মধ্যে হিসাব সমন্বয় করার বিনীত অনুরোধ জানাচ্ছি। ধন্যবাদ! - ${businessConfig.name}, যোগাযোগ: ${businessConfig.phone}`;
      case 'urgent':
        return `জরুরি নোটিশ: জনাব ${custName} ${shopName}, আপনার অ্যাকাউন্টে দীর্ঘদিন ধরে ৳${formatBDT(due, false)} টাকা বাকি অপরিশোধিত রয়েছে। নতুন কোনো স্টক বা চালান উত্তোলনের পূর্বে অতিসত্বর পাওনা পরিশোধ নিশ্চিত করুন। - ${businessConfig.name}, হেল্পলাইন: ${businessConfig.phone}`;
      case 'bkash':
        return `পেমেন্ট রিকোয়েস্ট: সম্মানিত ${custName}, আপনার বকেয়া ৳${formatBDT(due, false)} টাকা আমাদের বিকাশ/নগদ মার্চেন্ট নম্বরে পরিশোধ করতে পারেন: ${businessConfig.phone} (Merchant)। পেমেন্টের পর TrxID টি আমাদের অবগত করুন। - ${businessConfig.name}`;
      case 'english':
        return `Dear ${custName} ${shopName}, Greetings from ${businessConfig.name}. This is a gentle reminder regarding your outstanding ledger balance of ৳${formatBDT(due, false)}. Kindly settle the payment at your earliest convenience. Contact: ${businessConfig.phone}. Thank you!`;
    }
  };

  const currentMessage = getTemplateMessage();

  const handleCopy = () => {
    navigator.clipboard.writeText(currentMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSendWhatsApp = () => {
    // Format Bangladesh phone to 880 format
    let cleanPhone = customer.mobile.replace(/\D/g, '');
    if (cleanPhone.startsWith('0')) {
      cleanPhone = '88' + cleanPhone;
    } else if (!cleanPhone.startsWith('88')) {
      cleanPhone = '880' + cleanPhone;
    }
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(currentMessage)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-slate-200 overflow-hidden my-auto max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-emerald-400" />
            <div>
              <h2 className="text-sm font-bold">
                {language === 'bn' ? 'বাকি পরিশোধের তাগাদা বার্তা (SMS / WhatsApp)' : 'Due Collection Reminder Message'}
              </h2>
              <p className="text-[11px] text-slate-400">
                Generate instant Bangla SMS & WhatsApp reminder templates for wholesale & retail due
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Party Info Card */}
        <div className="p-4 bg-rose-50 border-b border-rose-100 flex items-center justify-between text-xs">
          <div>
            <h4 className="font-bold text-slate-900">{customer.name}</h4>
            {customer.businessName && <p className="text-slate-600 font-medium">{customer.businessName}</p>}
            <p className="text-slate-500 font-mono mt-0.5">{customer.mobile}</p>
          </div>
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-rose-600">Total Outstanding Due</span>
            <p className="text-lg font-black font-mono text-rose-700">{formatBDT(due)}</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs flex-1 overflow-y-auto">
          {/* Template Selector */}
          <div>
            <label className="font-semibold text-slate-700 mb-1.5 block">Select Reminder Template</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setTemplateType('friendly')}
                className={`p-2 border rounded-xl text-left font-medium transition ${
                  templateType === 'friendly' ? 'bg-emerald-50 border-emerald-500 text-emerald-800 font-bold' : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                ১. সাধারণ তাগাদা (Friendly)
              </button>
              <button
                type="button"
                onClick={() => setTemplateType('urgent')}
                className={`p-2 border rounded-xl text-left font-medium transition ${
                  templateType === 'urgent' ? 'bg-rose-50 border-rose-500 text-rose-800 font-bold' : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                ২. জরুরি নোটিশ (Urgent)
              </button>
              <button
                type="button"
                onClick={() => setTemplateType('bkash')}
                className={`p-2 border rounded-xl text-left font-medium transition ${
                  templateType === 'bkash' ? 'bg-pink-50 border-pink-500 text-pink-800 font-bold' : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                ৩. বিকাশ/মার্চেন্ট রিকোয়েস্ট
              </button>
              <button
                type="button"
                onClick={() => setTemplateType('english')}
                className={`p-2 border rounded-xl text-left font-medium transition ${
                  templateType === 'english' ? 'bg-blue-50 border-blue-500 text-blue-800 font-bold' : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                4. English Formal Reminder
              </button>
            </div>
          </div>

          {/* Message Preview Box */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="font-semibold text-slate-700 block">Message Preview</label>
              <span className="text-[11px] text-slate-400">{currentMessage.length} characters</span>
            </div>
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl font-sans text-slate-800 leading-relaxed whitespace-pre-wrap">
              {currentMessage}
            </div>
          </div>

          {/* Quick Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              onClick={handleCopy}
              className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl border border-slate-300 transition flex items-center justify-center gap-2"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-600" />}
              <span>{copied ? 'Copied to Clipboard!' : 'Copy SMS Text'}</span>
            </button>

            <button
              type="button"
              onClick={handleSendWhatsApp}
              className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs transition flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>Send via WhatsApp</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
