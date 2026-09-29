import React, { useState } from 'react';
import { 
  Settings, Building2, Store, RotateCcw, Check, 
  ShieldCheck, Phone, MapPin, FileText
} from 'lucide-react';
import { useERP } from '../../services/erpStore';

export const SettingsManager: React.FC = () => {
  const { 
    businessConfig, updateBusinessConfig, businessType, setBusinessType, 
    branches, resetToDemoData, language 
  } = useERP();

  const [formConfig, setFormConfig] = useState(businessConfig);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateBusinessConfig(formConfig);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleResetData = () => {
    if (confirm('Are you sure you want to reset all business records back to clean demo data? This will restore realistic demo products, IMEIs, sales and ledgers.')) {
      resetToDemoData();
      alert('System successfully reset to default mobile business demo data.');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">
          {language === 'bn' ? 'সিস্টেম সেটিংস ও প্রতিষ্ঠান প্রোফাইল' : 'Business Settings & SaaS Configuration'}
        </h1>
        <p className="text-xs text-slate-500">
          {language === 'bn' 
            ? 'দোকানের নাম, ঠিকানা, ট্রেড লাইসেন্স, ভ্যাট বিন এবং ইনভয়েস প্রিন্ট সেটিংস' 
            : 'Configure your company profile, invoice headers, warranty terms, and operational branches.'}
        </p>
      </div>

      {saveSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Business profile settings successfully saved!</span>
        </div>
      )}

      {/* Business Type Selector */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Store className="w-4 h-4 text-emerald-600" />
          <span>Target Business Model (ব্যবসার ধরন)</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => setBusinessType('RETAIL')}
            className={`p-3 rounded-xl border text-left transition ${
              businessType === 'RETAIL' 
                ? 'bg-emerald-50 border-emerald-500 ring-1 ring-emerald-500' 
                : 'border-slate-200 hover:bg-slate-50'
            }`}
          >
            <p className="text-xs font-bold text-slate-900">Retail Mobile Shop</p>
            <p className="text-[11px] text-slate-500 mt-1">Single phone POS, counter cash, customer warranties</p>
          </button>

          <button
            type="button"
            onClick={() => setBusinessType('WHOLESALE')}
            className={`p-3 rounded-xl border text-left transition ${
              businessType === 'WHOLESALE' 
                ? 'bg-emerald-50 border-emerald-500 ring-1 ring-emerald-500' 
                : 'border-slate-200 hover:bg-slate-50'
            }`}
          >
            <p className="text-xs font-bold text-slate-900">Wholesale Mobile Dealer</p>
            <p className="text-[11px] text-slate-500 mt-1">Bulk cartons, dealer credit limits, multi-tier pricing</p>
          </button>

          <button
            type="button"
            onClick={() => setBusinessType('RETAIL_WHOLESALE')}
            className={`p-3 rounded-xl border text-left transition ${
              businessType === 'RETAIL_WHOLESALE' 
                ? 'bg-emerald-50 border-emerald-500 ring-1 ring-emerald-500' 
                : 'border-slate-200 hover:bg-slate-50'
            }`}
          >
            <p className="text-xs font-bold text-slate-900">Retail + Wholesale (Both)</p>
            <p className="text-[11px] text-slate-500 mt-1">Full enterprise ERP with both retail and dealer modules</p>
          </button>
        </div>
      </div>

      {/* Business Profile Form */}
      <form onSubmit={handleSubmit} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4 text-xs">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Building2 className="w-4 h-4 text-emerald-600" />
          <span>Company & Invoice Information (বাংলাদেশ বাণিজ্যিক তথ্য)</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="font-semibold text-slate-700 mb-1 block">Business Name</label>
            <input
              type="text"
              value={formConfig.name}
              onChange={(e) => setFormConfig({ ...formConfig, name: e.target.value })}
              className="w-full p-2 border border-slate-300 rounded-lg text-slate-900 font-bold"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 mb-1 block">Bangla Tagline</label>
            <input
              type="text"
              value={formConfig.tagline}
              onChange={(e) => setFormConfig({ ...formConfig, tagline: e.target.value })}
              className="w-full p-2 border border-slate-300 rounded-lg"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 mb-1 block">Contact Phone Number</label>
            <input
              type="text"
              value={formConfig.phone}
              onChange={(e) => setFormConfig({ ...formConfig, phone: e.target.value })}
              className="w-full p-2 font-mono border border-slate-300 rounded-lg"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 mb-1 block">Trade License Number (ট্রেড লাইসেন্স)</label>
            <input
              type="text"
              value={formConfig.tradeLicense}
              onChange={(e) => setFormConfig({ ...formConfig, tradeLicense: e.target.value })}
              className="w-full p-2 font-mono border border-slate-300 rounded-lg"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 mb-1 block">VAT / Tax BIN Number</label>
            <input
              type="text"
              value={formConfig.taxNumber}
              onChange={(e) => setFormConfig({ ...formConfig, taxNumber: e.target.value })}
              className="w-full p-2 font-mono border border-slate-300 rounded-lg"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 mb-1 block">Official Address</label>
            <input
              type="text"
              value={formConfig.address}
              onChange={(e) => setFormConfig({ ...formConfig, address: e.target.value })}
              className="w-full p-2 border border-slate-300 rounded-lg"
            />
          </div>
        </div>

        <div>
          <label className="font-semibold text-slate-700 mb-1 block">Warranty Terms (Printed on Invoice)</label>
          <textarea
            rows={2}
            value={formConfig.warrantyTerms}
            onChange={(e) => setFormConfig({ ...formConfig, warrantyTerms: e.target.value })}
            className="w-full p-2 border border-slate-300 rounded-lg"
          />
        </div>

        <div>
          <label className="font-semibold text-slate-700 mb-1 block">Invoice Footer Note</label>
          <input
            type="text"
            value={formConfig.invoiceFooterNote}
            onChange={(e) => setFormConfig({ ...formConfig, invoiceFooterNote: e.target.value })}
            className="w-full p-2 border border-slate-300 rounded-lg"
          />
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition shadow-xs"
          >
            Save Settings
          </button>
        </div>
      </form>

      {/* Reset to Demo Data Card */}
      <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 flex items-center justify-between">
        <div>
          <h3 className="font-bold text-xs text-slate-900">Reset Demo Database</h3>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Reset all entities back to factory Bangladesh mobile demo state.
          </p>
        </div>
        <button
          onClick={handleResetData}
          className="px-3.5 py-2 bg-rose-100 hover:bg-rose-200 text-rose-800 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Demo Data</span>
        </button>
      </div>
    </div>
  );
};
