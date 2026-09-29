import React, { useState, useEffect } from 'react';
import { X, Check, Trash2, Edit3, AlertCircle, Building, Phone, MapPin, Landmark } from 'lucide-react';
import { Supplier } from '../../types/erp';
import { useERP } from '../../services/erpStore';

interface EditSupplierModalProps {
  isOpen: boolean;
  onClose: () => void;
  supplier: Supplier | null;
  onDeleteSuccess?: () => void;
}

export const EditSupplierModal: React.FC<EditSupplierModalProps> = ({
  isOpen,
  onClose,
  supplier,
  onDeleteSuccess
}) => {
  const { updateSupplier, deleteSupplier, language } = useERP();

  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [mobile, setMobile] = useState('');
  const [address, setAddress] = useState('');
  const [bankInfo, setBankInfo] = useState('');
  const [status, setStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');
  const [errorMsg, setErrorMsg] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (supplier) {
      setName(supplier.name);
      setCompany(supplier.company || '');
      setContactPerson(supplier.contactPerson || '');
      setMobile(supplier.mobile);
      setAddress(supplier.address || '');
      setBankInfo(supplier.bankInfo || '');
      setStatus(supplier.status || 'ACTIVE');
      setErrorMsg('');
      setConfirmDelete(false);
    }
  }, [supplier, isOpen]);

  if (!isOpen || !supplier) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !mobile.trim()) {
      setErrorMsg(language === 'bn' ? 'সাপ্লায়ার নাম ও মোবাইল বাধ্যতামূলক' : 'Supplier name and mobile are required');
      return;
    }

    const success = updateSupplier(supplier.id, {
      name: name.trim(),
      company: company.trim(),
      contactPerson: contactPerson.trim() || name.trim(),
      mobile: mobile.trim(),
      address: address.trim(),
      bankInfo: bankInfo.trim() || undefined,
      status
    });

    if (success) {
      onClose();
    }
  };

  const handleDelete = () => {
    const res = deleteSupplier(supplier.id);
    if (!res.success) {
      setErrorMsg(res.error || 'Cannot delete supplier');
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
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
              <Edit3 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-wide">
                {language === 'bn' ? 'মহাজন / সাপ্লায়ার তথ্য সম্পাদনা' : 'Edit Supplier & Importer Profile'}
              </h2>
              <p className="text-[11px] text-slate-400">
                {supplier.name} • {supplier.company}
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
              <label className="font-bold text-slate-700 mb-1 block">Supplier Display Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Smart Technologies BD"
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white font-medium"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 mb-1 block">Company / Agency *</label>
              <input
                type="text"
                required
                value={company}
                onChange={e => setCompany(e.target.value)}
                placeholder="e.g. Official Xiaomi Distributor"
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 mb-1 block">Contact Person</label>
              <input
                type="text"
                value={contactPerson}
                onChange={e => setContactPerson(e.target.value)}
                placeholder="Manager / Sales Rep"
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 mb-1 block">Mobile Number *</label>
              <input
                type="text"
                required
                value={mobile}
                onChange={e => setMobile(e.target.value)}
                placeholder="018XXXXXXXX"
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white font-mono"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 mb-1 block">Office / Warehouse Address</label>
            <input
              type="text"
              value={address}
              onChange={e => setAddress(e.target.value)}
              placeholder="e.g. Level 7, Motijheel C/A, Dhaka"
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 mb-1 block">Settlement Bank Account Details</label>
            <input
              type="text"
              value={bankInfo}
              onChange={e => setBankInfo(e.target.value)}
              placeholder="e.g. City Bank - 1102938472910, Gulshan Branch"
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white font-mono"
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
                <span>Delete Supplier</span>
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
                className="px-5 py-2 font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition flex items-center gap-1.5"
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
