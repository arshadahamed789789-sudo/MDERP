import React, { useState, useEffect } from 'react';
import { X, Check, Trash2, Edit3, AlertCircle, Smartphone, Tag } from 'lucide-react';
import { ProductIMEI } from '../../types/erp';
import { useERP } from '../../services/erpStore';
import { formatBDT } from '../../utils/formatters';

interface EditImeiModalProps {
  isOpen: boolean;
  onClose: () => void;
  imei: ProductIMEI | null;
  onDeleteSuccess?: () => void;
}

export const EditImeiModal: React.FC<EditImeiModalProps> = ({
  isOpen,
  onClose,
  imei,
  onDeleteSuccess
}) => {
  const { updateIMEI, deleteIMEI, language } = useERP();

  const [imei1, setImei1] = useState('');
  const [imei2, setImei2] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (imei) {
      setImei1(imei.imei1);
      setImei2(imei.imei2 || '');
      setSerialNumber(imei.serialNumber || '');
      setConfirmDelete(false);
      setErrorMsg('');
    }
  }, [imei, isOpen]);

  if (!isOpen || !imei) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!imei1.trim() || imei1.trim().length < 8) {
      setErrorMsg(language === 'bn' ? 'সঠিক আইএমইআই (কমপক্ষে ৮-১৫ ডিজিট) দিন' : 'Please provide a valid IMEI (min 8 digits)');
      return;
    }

    const ok = updateIMEI(imei.imei1, {
      imei1: imei1.trim(),
      imei2: imei2.trim() || undefined,
      serialNumber: serialNumber.trim() || undefined
    });

    if (ok) {
      onClose();
    }
  };

  const handleDelete = () => {
    const res = deleteIMEI(imei.imei1);
    if (!res.success) {
      setErrorMsg(res.error || 'Cannot delete IMEI');
      setConfirmDelete(false);
    } else {
      if (onDeleteSuccess) onDeleteSuccess();
      onClose();
    }
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
              <Edit3 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-wide">
                {language === 'bn' ? 'আইএমইআই (IMEI) সংশোধন ও ডিলিট' : 'Edit / Update Device IMEI'}
              </h2>
              <p className="text-[11px] text-slate-400 font-mono">
                {imei.productName} • {imei.branchName}
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
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Device Status</span>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-800">{imei.productName} ({imei.variantName})</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                imei.status === 'IN_STOCK' ? 'bg-emerald-100 text-emerald-800' :
                imei.status === 'SOLD' ? 'bg-blue-100 text-blue-800' :
                'bg-amber-100 text-amber-800'
              }`}>
                {imei.status}
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Purchase Cost: <strong className="font-mono text-slate-800">{formatBDT(imei.purchaseCost)}</strong>
            </p>
          </div>

          <div>
            <label className="font-bold text-slate-700 mb-1 block">IMEI 1 (Primary 15-Digit Barcode) *</label>
            <input
              type="text"
              required
              value={imei1}
              onChange={e => setImei1(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono text-slate-800 focus:bg-white focus:ring-1 focus:ring-emerald-500"
              placeholder="e.g. 861234567890123"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 mb-1 block">IMEI 2 (Optional Dual-SIM)</label>
            <input
              type="text"
              value={imei2}
              onChange={e => setImei2(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono text-slate-800 focus:bg-white focus:ring-1 focus:ring-emerald-500"
              placeholder="e.g. 861234567890124"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 mb-1 block">Serial Number (S/N)</label>
            <input
              type="text"
              value={serialNumber}
              onChange={e => setSerialNumber(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono text-slate-800 focus:bg-white focus:ring-1 focus:ring-emerald-500"
              placeholder="e.g. R58M123456X"
            />
          </div>

          {/* Delete Option if in stock */}
          {imei.status === 'IN_STOCK' && (
            <div className="pt-3 border-t border-slate-200">
              {!confirmDelete ? (
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  className="w-full py-2 px-3 text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{language === 'bn' ? 'স্টক থেকে এই আইএমইআই মুছে ফেলুন' : 'Delete IMEI from Active Stock'}</span>
                </button>
              ) : (
                <div className="p-3 bg-rose-50 border border-rose-300 rounded-xl space-y-2">
                  <p className="text-[11px] font-semibold text-rose-900">
                    {language === 'bn' 
                      ? 'আপনি কি নিশ্চিত যে এই আইএমইআই ডিভাইসটি মুছে ফেলতে চান? এতে স্টকের সংখ্যা ১ কমবে।' 
                      : 'Are you sure you want to delete this device? Stock count will be reduced by 1.'}
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(false)}
                      className="flex-1 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-bold transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleDelete}
                      className="flex-1 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition shadow-xs"
                    >
                      Confirm Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
            >
              <Check className="w-4 h-4" />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
