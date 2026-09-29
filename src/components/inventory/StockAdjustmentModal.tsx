import React, { useState } from 'react';
import { SlidersHorizontal, X, AlertCircle, ArrowRight, Boxes } from 'lucide-react';
import { useERP } from '../../services/erpStore';
import { formatBDT } from '../../utils/formatters';

interface StockAdjustmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (adjNo: string) => void;
}

export const StockAdjustmentModal: React.FC<StockAdjustmentModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { products, branches, imeis, createStockAdjustment, currentBranchId, language } = useERP();

  const [branchId, setBranchId] = useState(currentBranchId !== 'all' ? currentBranchId : branches[0].id);
  const [productId, setProductId] = useState('');
  const [variantId, setVariantId] = useState('');
  const [adjustmentType, setAdjustmentType] = useState<'ADD' | 'REMOVE'>('REMOVE');
  const [quantity, setQuantity] = useState(1);
  const [reason, setReason] = useState<'PHYSICAL_COUNT_DISCREPANCY' | 'DAMAGED' | 'THEFT_LOSS' | 'OTHER'>('DAMAGED');
  const [selectedImeis, setSelectedImeis] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const activeProduct = products.find(p => p.id === productId);
  const activeVariant = activeProduct?.variants.find(v => v.id === variantId);

  const availableImeis = imeis.filter(i => 
    i.productId === productId &&
    i.variantId === variantId &&
    i.branchId === branchId &&
    i.status === 'IN_STOCK'
  );

  const estimatedCostImpact = activeVariant ? (activeVariant.purchasePrice * quantity) : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productId || !variantId) {
      setErrorMessage('Please select a product and variant');
      return;
    }
    if (quantity <= 0) {
      setErrorMessage('Please enter a valid quantity');
      return;
    }

    const res = createStockAdjustment({
      branchId,
      productId,
      variantId,
      adjustmentType,
      quantity,
      imeis: selectedImeis,
      reason,
      notes
    });

    if (res.success && res.adjustmentNo) {
      onSuccess(res.adjustmentNo);
      onClose();
    } else {
      setErrorMessage(res.error || 'Failed to record stock adjustment');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg border border-slate-200 overflow-hidden">
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <h2 className="text-sm font-bold flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-emerald-400" />
            <span>Stock Reconciliation & Adjustment (স্টক সমন্বয়)</span>
          </h2>
          <button onClick={onClose}>
            <X className="w-5 h-5 text-slate-400 hover:text-white" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {errorMessage && (
            <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 mb-1 block">Operating Branch</label>
              <select
                value={branchId}
                onChange={(e) => setBranchId(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg"
              >
                {branches.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 mb-1 block">Adjustment Direction</label>
              <select
                value={adjustmentType}
                onChange={(e) => setAdjustmentType(e.target.value as any)}
                className="w-full p-2 border border-slate-300 rounded-lg font-bold"
              >
                <option value="REMOVE">Deduct / Write-Off (কমানো)</option>
                <option value="ADD">Add / Found Count (বাড়ানো)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 mb-1 block">Product Model</label>
            <select
              value={productId}
              onChange={(e) => {
                setProductId(e.target.value);
                const prod = products.find(p => p.id === e.target.value);
                if (prod && prod.variants.length > 0) {
                  setVariantId(prod.variants[0].id);
                }
              }}
              className="w-full p-2 border border-slate-300 rounded-lg"
            >
              <option value="">-- Choose Product --</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.brandName} {p.model}</option>
              ))}
            </select>
          </div>

          {productId && (
            <div>
              <label className="font-semibold text-slate-700 mb-1 block">Variant</label>
              <select
                value={variantId}
                onChange={(e) => setVariantId(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg"
              >
                {products.find(p => p.id === productId)?.variants.map(v => (
                  <option key={v.id} value={v.id}>
                    {v.storage ? `${v.storage} - ${v.color}` : v.color} (Current Stock: {v.currentStock})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 mb-1 block">Adjustment Reason</label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value as any)}
                className="w-full p-2 border border-slate-300 rounded-lg"
              >
                <option value="DAMAGED">Damaged in Showroom / Broken</option>
                <option value="PHYSICAL_COUNT_DISCREPANCY">Audit Physical Discrepancy</option>
                <option value="THEFT_LOSS">Theft / Shrinkage Loss</option>
                <option value="OTHER">Other Reason</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 mb-1 block">Quantity</label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                className="w-full p-2 border border-slate-300 rounded-lg font-mono font-bold"
              />
            </div>
          </div>

          {activeProduct?.hasImei && adjustmentType === 'REMOVE' && availableImeis.length > 0 && (
            <div>
              <label className="font-semibold text-slate-700 mb-1 block">
                Select Specific IMEI (if applicable):
              </label>
              <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto p-1.5 border rounded-lg bg-slate-50">
                {availableImeis.map(im => {
                  const isSel = selectedImeis.includes(im.imei1);
                  return (
                    <button
                      key={im.imei1}
                      type="button"
                      onClick={() => {
                        if (isSel) {
                          setSelectedImeis(prev => prev.filter(i => i !== im.imei1));
                        } else {
                          setSelectedImeis(prev => [...prev, im.imei1]);
                        }
                      }}
                      className={`px-2 py-0.5 rounded text-[11px] font-mono border ${
                        isSel ? 'bg-rose-600 text-white font-bold' : 'bg-white text-slate-700'
                      }`}
                    >
                      {im.imei1}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div>
            <label className="font-semibold text-slate-700 mb-1 block">Audit / Approver Notes</label>
            <input
              type="text"
              placeholder="e.g. Broken display during restocking"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-lg"
            />
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border flex justify-between items-center font-bold text-xs">
            <span>Estimated Cost Impact:</span>
            <span className="font-mono text-sm text-slate-900">{formatBDT(estimatedCostImpact)}</span>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-lg font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!productId || !variantId}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white rounded-lg font-bold flex items-center gap-1.5"
            >
              <span>Post Adjustment</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
