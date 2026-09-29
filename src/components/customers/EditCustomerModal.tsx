import React, { useState, useEffect } from 'react';
import { X, Check, Trash2, Edit3, AlertCircle, User, Building, Phone, MapPin, DollarSign } from 'lucide-react';
import { Customer, PriceLevel } from '../../types/erp';
import { useERP } from '../../services/erpStore';

interface EditCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer | null;
  onDeleteSuccess?: () => void;
}

export const EditCustomerModal: React.FC<EditCustomerModalProps> = ({
  isOpen,
  onClose,
  customer,
  onDeleteSuccess
}) => {
  const { updateCustomer, deleteCustomer, language } = useERP();

  const [name, setName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [mobile, setMobile] = useState('');
  const [address, setAddress] = useState('');
  const [customerType, setCustomerType] = useState<any>('Wholesale Dealer');
  const [priceLevel, setPriceLevel] = useState<PriceLevel>('dealer');
  const [creditLimit, setCreditLimit] = useState(200000);
  const [status, setStatus] = useState<'ACTIVE' | 'BLOCKED'>('ACTIVE');
  const [errorMsg, setErrorMsg] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (customer) {
      setName(customer.name);
      setBusinessName(customer.businessName || '');
      setMobile(customer.mobile);
      setAddress(customer.address || '');
      setCustomerType(customer.customerType);
      setPriceLevel(customer.priceLevel);
      setCreditLimit(customer.creditLimit);
      setStatus(customer.status || 'ACTIVE');
      setErrorMsg('');
      setConfirmDelete(false);
    }
  }, [customer, isOpen]);

  if (!isOpen || !customer) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !mobile.trim()) {
      setErrorMsg(language === 'bn' ? 'নাম এবং মোবাইল নাম্বার বাধ্যতামূলক' : 'Name and mobile number are required');
      return;
    }

    const success = updateCustomer(customer.id, {
      name: name.trim(),
      businessName: businessName.trim() || undefined,
      mobile: mobile.trim(),
      address: address.trim(),
      customerType,
      priceLevel,
      creditLimit: Number(creditLimit) || 0,
      status
    });

    if (success) {
      onClose();
    }
  };

  const handleDelete = () => {
    const res = deleteCustomer(customer.id);
    if (!res.success) {
      setErrorMsg(res.error || 'Cannot delete customer');
      setConfirmDelete(false);
    } else {
      if (onDeleteSuccess) onDeleteSuccess();
      onClose();
    }
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
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Edit3 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-wide">
                {language === 'bn' ? 'কাস্টমার / ডিলার তথ্য সম্পাদনা' : 'Edit Customer & Dealer Profile'}
              </h2>
              <p className="text-[11px] text-slate-400">
                {customer.businessName || customer.name} ({customer.mobile})
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 mb-1 block">Proprietor Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Md. Mostafizur Rahman"
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white font-medium"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 mb-1 block">Shop / Business Name</label>
              <input
                type="text"
                value={businessName}
                onChange={e => setBusinessName(e.target.value)}
                placeholder="e.g. Rahman Telecom"
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 mb-1 block">Mobile Number *</label>
              <input
                type="text"
                required
                value={mobile}
                onChange={e => setMobile(e.target.value)}
                placeholder="017XXXXXXXX"
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white font-mono"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 mb-1 block">Account Status</label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as any)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium focus:bg-white"
              >
                <option value="ACTIVE">Active (সক্রিয়)</option>
                <option value="BLOCKED">Blocked (বাকি স্থগিত)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="font-bold text-slate-700 mb-1 block">Category</label>
              <select
                value={customerType}
                onChange={e => setCustomerType(e.target.value as any)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium focus:bg-white"
              >
                <option value="Wholesale Dealer">Wholesale Dealer</option>
                <option value="Sub Dealer">Sub Dealer</option>
                <option value="Retail Customer">Retail Customer</option>
                <option value="VIP Customer">VIP Customer</option>
              </select>
            </div>
            <div>
              <label className="font-bold text-slate-700 mb-1 block">Price Level</label>
              <select
                value={priceLevel}
                onChange={e => setPriceLevel(e.target.value as any)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-emerald-800 focus:bg-white"
              >
                <option value="retail">Retail MRP</option>
                <option value="wholesale">Wholesale Rate</option>
                <option value="dealer">Dealer Special Rate</option>
              </select>
            </div>
            <div>
              <label className="font-bold text-slate-700 mb-1 block">Credit Limit (BDT)</label>
              <input
                type="number"
                min="0"
                value={creditLimit}
                onChange={e => setCreditLimit(Number(e.target.value))}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 mb-1 block">Shop Address & Market</label>
            <input
              type="text"
              value={address}
              onChange={e => setAddress(e.target.value)}
              placeholder="e.g. Shop 42, Level 5, Bashundhara City"
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
                <span>Delete Party Profile</span>
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
                className="px-5 py-2 font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md transition flex items-center gap-1.5"
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
