import React, { useState, useEffect } from 'react';
import { X, Check, Trash2, Edit3, ShieldAlert, AlertCircle, Smartphone } from 'lucide-react';
import { WarrantyClaim } from '../../types/erp';
import { useERP } from '../../services/erpStore';

interface EditWarrantyModalProps {
  isOpen: boolean;
  onClose: () => void;
  claim: WarrantyClaim | null;
}

export const EditWarrantyModal: React.FC<EditWarrantyModalProps> = ({
  isOpen,
  onClose,
  claim
}) => {
  const { updateWarrantyClaim, deleteWarrantyClaim, language } = useERP();

  const [status, setStatus] = useState<any>('PENDING');
  const [problemDescription, setProblemDescription] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (claim) {
      setStatus(claim.status);
      setProblemDescription(claim.problemDescription);
      setResolutionNotes(claim.resolutionNotes || '');
      setCustomerName(claim.customerName);
      setCustomerPhone(claim.customerPhone);
      setConfirmDelete(false);
    }
  }, [claim, isOpen]);

  if (!isOpen || !claim) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateWarrantyClaim(claim.id, {
      status,
      problemDescription: problemDescription.trim(),
      resolutionNotes: resolutionNotes.trim() || undefined,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim()
    });
    onClose();
  };

  const handleDelete = () => {
    deleteWarrantyClaim(claim.id);
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
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-wide">
                {language === 'bn' ? 'ওয়ারেন্টি ক্লেইম আপডেট' : 'Update Warranty Claim'}
              </h2>
              <p className="text-[11px] text-slate-400 font-mono">
                {claim.claimNo} • IMEI: {claim.imei}
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
          <div>
            <label className="font-bold text-slate-700 mb-1 block">Claim Status</label>
            <select
              value={status}
              onChange={e => setStatus(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-800 focus:bg-white"
            >
              <option value="PENDING">PENDING (অপেক্ষমান / ডায়াগনস্টিক)</option>
              <option value="IN_REPAIR">IN_REPAIR (সার্ভিস সেন্টারে মেরামত চলছে)</option>
              <option value="DELIVERED">DELIVERED (সফলভাবে গ্রাহককে হস্তান্তর)</option>
              <option value="REPLACED">REPLACED (নতুন হ্যান্ডসেট রিপ্লেসমেন্ট প্রদান)</option>
              <option value="REJECTED">REJECTED (ওয়ারেন্টি বাতিল / ফিজিক্যাল ড্যামেজ)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 mb-1 block">Customer Name</label>
              <input
                type="text"
                required
                value={customerName}
                onChange={e => setCustomerName(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white font-medium"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 mb-1 block">Customer Phone</label>
              <input
                type="text"
                required
                value={customerPhone}
                onChange={e => setCustomerPhone(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white font-mono"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 mb-1 block">Problem Description</label>
            <textarea
              rows={2}
              value={problemDescription}
              onChange={e => setProblemDescription(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 mb-1 block">Diagnostic & Resolution Notes</label>
            <textarea
              rows={2}
              value={resolutionNotes}
              onChange={e => setResolutionNotes(e.target.value)}
              placeholder="e.g. Display ribbon replaced by Samsung official center. Tested OK."
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
                <span>Delete Claim</span>
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
                className="px-5 py-2 font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-md transition flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{language === 'bn' ? 'সংরক্ষণ করুন' : 'Update Claim'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
