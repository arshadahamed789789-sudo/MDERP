import React, { useState } from 'react';
import { RotateCcw, X, AlertCircle, ArrowRight, Truck, Check } from 'lucide-react';
import { useERP } from '../../services/erpStore';
import { formatBDT } from '../../utils/formatters';
import { PurchaseReturnItem } from '../../types/erp';

interface PurchaseReturnModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (returnNo: string) => void;
}

export const PurchaseReturnModal: React.FC<PurchaseReturnModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { purchases, imeis, createPurchaseReturn, language } = useERP();

  const [selectedInvoiceNo, setSelectedInvoiceNo] = useState('');
  const [returnItems, setReturnItems] = useState<PurchaseReturnItem[]>([]);
  const [notes, setNotes] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const activeInvoice = purchases.find(p => p.invoiceNo === selectedInvoiceNo);

  const handleSelectInvoice = (invNo: string) => {
    setSelectedInvoiceNo(invNo);
    const pur = purchases.find(p => p.invoiceNo === invNo);
    if (pur) {
      setReturnItems(pur.items.map(it => {
        // Find in-stock IMEIs for this item that came from this purchase
        const itemImeis = it.imeis.map(im => im.imei1);
        const inStockFromThisPur = imeis.filter(i => 
          itemImeis.includes(i.imei1) && i.status === 'IN_STOCK'
        ).map(i => i.imei1);

        return {
          productId: it.productId,
          variantId: it.variantId,
          productName: it.productName,
          variantName: it.variantName,
          quantity: inStockFromThisPur.length > 0 ? 1 : 1,
          returnRate: it.purchaseRate,
          imeiList: inStockFromThisPur.length > 0 ? [inStockFromThisPur[0]] : [],
          reason: 'DEFECTIVE_OR_REPLACEMENT',
          total: it.purchaseRate
        };
      }));
    }
  };

  const totalCreditAmount = returnItems.reduce((acc, it) => acc + it.total, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeInvoice) {
      setErrorMessage('Please select a valid purchase invoice');
      return;
    }
    if (returnItems.length === 0) {
      setErrorMessage('No items selected for return');
      return;
    }

    const res = createPurchaseReturn({
      purchaseInvoiceNo: activeInvoice.invoiceNo,
      supplierId: activeInvoice.supplierId,
      branchId: activeInvoice.branchId,
      items: returnItems,
      notes: notes || 'Returned to distributor for credit note/replacement'
    });

    if (res.success && res.returnNo) {
      onSuccess(res.returnNo);
      onClose();
    } else {
      setErrorMessage(res.error || 'Failed to process purchase return');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl border border-slate-200 overflow-hidden my-auto max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <RotateCcw className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="text-sm font-bold">
                {language === 'bn' ? 'মহাজনকে পণ্য ফেরত (Purchase Return)' : 'New Supplier Purchase Return (Debit Note)'}
              </h2>
              <p className="text-[11px] text-slate-400">
                Return defective devices or unsold stock to distributor; reduces payable debt automatically
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-xs flex-1">
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Select Purchase Invoice */}
          <div>
            <label className="font-semibold text-slate-700 mb-1 block">
              Select Original Purchase Invoice / Bill *
            </label>
            <select
              value={selectedInvoiceNo}
              onChange={(e) => handleSelectInvoice(e.target.value)}
              required
              className="w-full p-2.5 border border-slate-300 rounded-xl bg-slate-50 font-medium"
            >
              <option value="">-- Choose Purchase Invoice --</option>
              {purchases.map(p => (
                <option key={p.id} value={p.invoiceNo}>
                  {p.invoiceNo} • {p.supplierName} • Total: {formatBDT(p.grandTotal)} • Due: {formatBDT(p.dueAmount)}
                </option>
              ))}
            </select>
          </div>

          {activeInvoice && (
            <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200 space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-600">Supplier / Distributor:</span>
                <span className="font-bold text-slate-900">{activeInvoice.supplierName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Current Outstanding Payable to Supplier:</span>
                <span className="font-bold text-amber-700">{formatBDT(activeInvoice.dueAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Warehouse Branch:</span>
                <span className="font-medium text-slate-800">{activeInvoice.branchName}</span>
              </div>
            </div>
          )}

          {/* Items to Return */}
          {returnItems.length > 0 && (
            <div>
              <label className="font-semibold text-slate-700 mb-2 block">
                Select Items and Quantities to Return:
              </label>
              <div className="space-y-2 border border-slate-200 rounded-xl p-3 bg-slate-50">
                {returnItems.map((item, idx) => (
                  <div key={idx} className="bg-white p-3 rounded-lg border border-slate-200 space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-slate-900 text-xs">{item.productName}</h4>
                        <p className="text-[11px] text-slate-500">{item.variantName}</p>
                      </div>
                      <span className="font-mono font-bold text-amber-700 text-sm">
                        {formatBDT(item.total)}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 border-t border-slate-100">
                      <div>
                        <label className="text-[10px] text-slate-500 font-semibold block">Return Qty</label>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => {
                            const val = Math.max(1, parseInt(e.target.value) || 1);
                            const updated = [...returnItems];
                            updated[idx].quantity = val;
                            updated[idx].total = val * updated[idx].returnRate;
                            setReturnItems(updated);
                          }}
                          className="w-full p-1.5 border border-slate-300 rounded text-xs font-mono font-bold"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] text-slate-500 font-semibold block">Credit Rate (৳)</label>
                        <input
                          type="number"
                          value={item.returnRate}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            const updated = [...returnItems];
                            updated[idx].returnRate = val;
                            updated[idx].total = updated[idx].quantity * val;
                            setReturnItems(updated);
                          }}
                          className="w-full p-1.5 border border-slate-300 rounded text-xs font-mono font-bold"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] text-slate-500 font-semibold block">Reason</label>
                        <select
                          value={item.reason}
                          onChange={(e) => {
                            const updated = [...returnItems];
                            updated[idx].reason = e.target.value;
                            setReturnItems(updated);
                          }}
                          className="w-full p-1.5 border border-slate-300 rounded text-xs"
                        >
                          <option value="DEFECTIVE_OR_REPLACEMENT">Defective / DOA</option>
                          <option value="WRONG_VARIANT_SHIPPED">Wrong Variant Shipped</option>
                          <option value="EXCESS_STOCK_RETURN">Overstock Return</option>
                          <option value="WARRANTY_DISPUTE">Warranty Claim</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="font-semibold text-slate-700 mb-1 block">Notes & Distributor Reference</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Return challan #DC-4421 sent via Sundarban Courier"
              className="w-full p-2 border border-slate-300 rounded-lg"
            />
          </div>

          {/* Summary Box */}
          <div className="p-3.5 bg-slate-900 text-white rounded-xl flex items-center justify-between">
            <div>
              <p className="text-[11px] text-slate-400 uppercase font-semibold">Total Credit Note Value</p>
              <p className="text-lg font-black font-mono text-emerald-400">{formatBDT(totalCreditAmount)}</p>
            </div>
            <div className="text-right text-[11px] text-slate-300">
              <p>Will be deducted from</p>
              <p className="font-bold text-white">{activeInvoice?.supplierName || 'Distributor'}&apos;s payable debt</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-xl font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!activeInvoice || returnItems.length === 0}
              className="px-5 py-2 bg-amber-600 hover:bg-amber-700 disabled:bg-slate-300 text-white rounded-xl font-bold transition flex items-center gap-1.5 shadow-sm"
            >
              <Check className="w-4 h-4" />
              <span>Confirm Purchase Return</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
