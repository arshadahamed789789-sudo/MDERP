import React, { useState } from 'react';
import { 
  Settings, Building2, Store, RotateCcw, Check, 
  ShieldCheck, Phone, MapPin, FileText, Plus, Pencil, Trash2, Globe, Building, X, AlertCircle
} from 'lucide-react';
import { useERP } from '../../services/erpStore';
import { Branch } from '../../types/erp';

export const SettingsManager: React.FC = () => {
  const { 
    businessConfig, updateBusinessConfig, businessType, setBusinessType, 
    branches, addBranch, updateBranch, deleteBranch,
    brands, addBrand, deleteBrand, resetToDemoData, language 
  } = useERP();

  const [formConfig, setFormConfig] = useState(businessConfig);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Branch CRUD State
  const [showBranchModal, setShowBranchModal] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [branchName, setBranchName] = useState('');
  const [branchCode, setBranchCode] = useState('');
  const [branchType, setBranchType] = useState<'BRANCH' | 'WAREHOUSE' | 'HEAD_OFFICE'>('BRANCH');
  const [branchLocation, setBranchLocation] = useState('');
  const [branchContact, setBranchContact] = useState('');
  const [branchError, setBranchError] = useState('');

  // Brand CRUD State
  const [showBrandInput, setShowBrandInput] = useState(false);
  const [newBrandName, setNewBrandName] = useState('');
  const [newBrandCountry, setNewBrandCountry] = useState('International');
  const [brandError, setBrandError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateBusinessConfig(formConfig);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleOpenAddBranch = () => {
    setEditingBranch(null);
    setBranchName('');
    setBranchCode(`BR-${branches.length + 1}`);
    setBranchType('BRANCH');
    setBranchLocation('');
    setBranchContact('01700-000000');
    setBranchError('');
    setShowBranchModal(true);
  };

  const handleOpenEditBranch = (b: Branch) => {
    setEditingBranch(b);
    setBranchName(b.name);
    setBranchCode(b.code);
    setBranchType(b.type);
    setBranchLocation(b.location);
    setBranchContact(b.contact);
    setBranchError('');
    setShowBranchModal(true);
  };

  const handleSaveBranch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!branchName.trim() || !branchLocation.trim()) {
      setBranchError('Please provide branch name and address location.');
      return;
    }

    if (editingBranch) {
      updateBranch(editingBranch.id, {
        name: branchName.trim(),
        code: branchCode.trim() || editingBranch.code,
        type: branchType,
        location: branchLocation.trim(),
        contact: branchContact.trim()
      });
    } else {
      addBranch({
        name: branchName.trim(),
        code: branchCode.trim() || `BR-${Date.now().toString().slice(-3)}`,
        type: branchType,
        location: branchLocation.trim(),
        contact: branchContact.trim(),
        isDefault: false
      });
    }

    setShowBranchModal(false);
  };

  const handleDeleteBranch = (id: string) => {
    if (confirm('Are you sure you want to delete this branch?')) {
      const res = deleteBranch(id);
      if (!res.success) {
        alert(res.error || 'Cannot delete branch');
      }
    }
  };

  const handleAddBrand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBrandName.trim()) return;
    addBrand(newBrandName.trim(), newBrandCountry.trim() || 'International');
    setNewBrandName('');
    setShowBrandInput(false);
  };

  const handleDeleteBrand = (id: string, name: string) => {
    if (confirm(`Are you sure you want to remove brand ${name}?`)) {
      const res = deleteBrand(id);
      if (!res.success) {
        alert(res.error || 'Cannot delete brand');
      }
    }
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

      {/* Operational Branches & Showrooms (CRUD) */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Building className="w-4 h-4 text-blue-600" />
              <span>{language === 'bn' ? 'ব্রাঞ্চ ও শোরুম ব্যবস্থাপনা' : 'Operational Branches & Showrooms'}</span>
            </h2>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {language === 'bn' ? 'দোকানের নতুন ব্রাঞ্চ সংযোজন, এডিট ও লোকেশন পরিবর্তন' : 'Manage multi-location shops, central warehouses, and branch codes.'}
            </p>
          </div>
          <button
            type="button"
            onClick={handleOpenAddBranch}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? '+ নতুন ব্রাঞ্চ' : '+ Add Branch'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {branches.map(b => (
            <div key={b.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-white transition flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-xs text-slate-900">{b.name}</h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase bg-blue-100 text-blue-800">
                    {b.type}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                  <span>{b.location}</span>
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                  <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                  <span className="font-mono">{b.contact}</span>
                  <span className="text-slate-300">•</span>
                  <span className="font-mono text-slate-600">Code: {b.code}</span>
                </p>
              </div>

              <div className="flex items-center justify-end gap-1.5 mt-3 pt-2 border-t border-slate-200/60">
                <button
                  type="button"
                  onClick={() => handleOpenEditBranch(b)}
                  className="px-2 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded text-[11px] font-semibold transition flex items-center gap-1 shadow-2xs"
                >
                  <Pencil className="w-3 h-3 text-blue-600" />
                  <span>Edit</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteBranch(b.id)}
                  disabled={branches.length <= 1}
                  className="px-2 py-1 bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 rounded text-[11px] font-semibold transition flex items-center gap-1 disabled:opacity-50"
                  title="Delete Branch"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile Brands & Manufacturers (CRUD) */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Globe className="w-4 h-4 text-emerald-600" />
              <span>{language === 'bn' ? 'মোবাইল ব্র্যান্ড ও ম্যানুফ্যাকচারার' : 'Mobile Brands & Manufacturers'}</span>
            </h2>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {language === 'bn' ? 'ব্র্যান্ড তালিকা ও নতুন ব্র্যান্ড সংযোজন' : 'Supported phone brands and accessory manufacturer directory.'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowBrandInput(!showBrandInput)}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? '+ নতুন ব্র্যান্ড' : '+ Add Brand'}</span>
          </button>
        </div>

        {showBrandInput && (
          <form onSubmit={handleAddBrand} className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-xl flex flex-col sm:flex-row gap-2.5 items-end text-xs animate-in fade-in-50">
            <div className="w-full sm:flex-1">
              <label className="font-semibold text-emerald-950 mb-1 block">Brand Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Nothing, Infinix, OnePlus"
                value={newBrandName}
                onChange={e => setNewBrandName(e.target.value)}
                className="w-full p-2 bg-white border border-emerald-300 rounded-lg text-slate-900"
              />
            </div>
            <div className="w-full sm:w-48">
              <label className="font-semibold text-emerald-950 mb-1 block">Origin / Country</label>
              <input
                type="text"
                placeholder="e.g. UK, China, South Korea"
                value={newBrandCountry}
                onChange={e => setNewBrandCountry(e.target.value)}
                className="w-full p-2 bg-white border border-emerald-300 rounded-lg text-slate-900"
              />
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold shadow-xs flex items-center justify-center gap-1"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Save</span>
            </button>
          </form>
        )}

        <div className="flex flex-wrap gap-2">
          {brands.map(br => (
            <div 
              key={br.id}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 flex items-center gap-2 hover:bg-slate-100 transition shadow-2xs"
            >
              <span>{br.name}</span>
              <span className="text-[10px] text-slate-400 font-normal">({br.country})</span>
              <button
                type="button"
                onClick={() => handleDeleteBrand(br.id, br.name)}
                className="p-0.5 hover:bg-rose-100 text-slate-400 hover:text-rose-600 rounded transition"
                title="Remove brand"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Add / Edit Branch Modal */}
      {showBranchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in-50">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
            <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Building className="w-4 h-4 text-blue-400" />
                <span>{editingBranch ? 'Edit Branch Details' : 'Add New Branch / Showroom'}</span>
              </h3>
              <button onClick={() => setShowBranchModal(false)}>
                <X className="w-4 h-4 text-slate-400 hover:text-white" />
              </button>
            </div>

            <form onSubmit={handleSaveBranch} className="p-5 space-y-3.5 text-xs">
              {branchError && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{branchError}</span>
                </div>
              )}

              <div>
                <label className="font-bold text-slate-700 mb-1 block">Branch / Showroom Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Uttara Mega Mall Branch"
                  value={branchName}
                  onChange={e => setBranchName(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 mb-1 block">Branch Code</label>
                  <input
                    type="text"
                    value={branchCode}
                    onChange={e => setBranchCode(e.target.value)}
                    className="w-full p-2 font-mono border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 mb-1 block">Type</label>
                  <select
                    value={branchType}
                    onChange={e => setBranchType(e.target.value as any)}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  >
                    <option value="BRANCH">Retail Showroom</option>
                    <option value="WAREHOUSE">Warehouse / Godown</option>
                    <option value="HEAD_OFFICE">Head Office</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 mb-1 block">Location / Address *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sector 3, Uttara, Dhaka"
                  value={branchLocation}
                  onChange={e => setBranchLocation(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 mb-1 block">Contact Phone Number</label>
                <input
                  type="text"
                  value={branchContact}
                  onChange={e => setBranchContact(e.target.value)}
                  className="w-full p-2 font-mono border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowBranchModal(false)}
                  className="px-4 py-2 border rounded-lg text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-xs"
                >
                  Save Branch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
