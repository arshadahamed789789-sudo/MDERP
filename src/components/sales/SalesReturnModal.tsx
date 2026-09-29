import React, { useState } from 'react';
import { RotateCcw, X, AlertCircle, Check, ArrowRight, ShieldCheck, ShoppingBag } from 'lucide-react';
import { useERP } from '../../services/erpStore';
import { formatBDT } from '../../utils/formatters';
import { SalesReturnItem } from '../../types/erp';

interface SalesReturnModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (returnNo: string) => void;
}

export const SalesReturnModal: React.FC<SalesReturnModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { sales, cashAccounts, bankAccounts, createSalesReturn, language } = useERP();

  const [selectedInvoiceNo, setSelectedInvoiceNo] = useState('');
  const [returnItems, setReturnItems] = useState<SalesReturnItem[]>([]);
  const [refundMethod, setRefundMethod] = useState<'Credit_Adjustment' | 'Cash' | 'Bank'>('Credit_Adjustment');
  const [accountId, setAccountId] = useState(cashAccounts[0]?.id || '');
  const [notes, setNotes] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const activeInvoice = sales.find(s => s.invoiceNo === selectedInvoiceNo);

  const handleSelectInvoice = (invNo: string) => {
    setSelectedInvoiceNo(invNo);
    const inv = sales.find(s => s.invoiceNo === invNo);
    if (inv) {
      // Initialize return items from invoice
      setReturnItems(inv.items.map(it => ({
        productId: it.productId,
        variantId: it.variantId,
        productName: it.productName,
        variantName: it.variantName,
        quantity: 1,
        refundRate: it.unitPrice,
        imeiList: it.imeiList.length > 0 ? [it.imeiList[0]] : [],
        condition: 'RESTOCKABLE',
        total: it.unitPrice
      })));
    }
  };

  const totalRefundAmount = returnItems.reduce((acc, it) => acc + it.total, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeInvoice) {
      setErrorMessage('Please select a valid sales invoice');
      return;
    }
    if (returnItems.length === 0) {
      setErrorMessage('No items selected for return');
      return;
    }

    const res = createSalesReturn({
      saleInvoiceNo: activeInvoice.invoiceNo,
      customerId: activeInvoice.customerId,
      branchId: activeInvoice.branchId,
      items: returnItems,
      refundMethod,
      accountId: refundMethod !== 'Credit_Adjustment' ? accountId : undefined,
      notes
    });

    if (res.success && res.returnNo) {
      onSuccess(res.returnNo);
      onClose();
    } else {
      setErrorMessage(res.error || 'Failed to process sales return');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <h2 className="text-sm font-bold flex items-center gap-2">
            <RotateCcw className="w-4 h-4 text-emerald-400" />
            <span>Process Sales Return & IMEI Restock (বিক্রয় ফেরত)</span>
          </h2>
          <button onClick={onClose}>
            <X className="w-5 h-5 text-slate-400 hover:text-white" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-xs">
          {errorMessage && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Invoice Picker */}
          <div>
            <label className="font-semibold text-slate-700 mb-1 block">Select Original Sales Invoice</label>
            <select
              value={selectedInvoiceNo}
              onChange={(e) => handleSelectInvoice(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-lg font-mono font-medium"
            >
              <option value="">-- Choose Sales Invoice --</option>
              {sales.map(s => (
                <option key={s.id} value={s.invoiceNo}>
                  {s.invoiceNo} — {s.customerName} ({formatBDT(s.grandTotal)})
                </option>
              ))}
            </select>
          </div>

          {activeInvoice && (
            <>
              {/* Invoice Summary */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <p className="font-bold text-slate-900">{activeInvoice.customerName} ({activeInvoice.customerMobile})</p>
                <p className="text-slate-500">Invoice Date: {activeInvoice.date} • Branch: {activeInvoice.branchName}</p>
                <p className="text-slate-600">Grand Total: <strong>{formatBDT(activeInvoice.grandTotal)}</strong> • Paid: {formatBDT(activeInvoice.paidAmount)} • Due: {formatBDT(activeInvoice.dueAmount)}</p>
              </div>

              {/* Items to Return */}
              <div>
                <label className="font-bold text-slate-800 uppercase tracking-wider block mb-1">
                  Items Returned by Customer
                </label>
                <div className="space-y-2">
                  {returnItems.map((item, idx) => (
                    <div key={idx} className="p-3 bg-white border border-slate-200 rounded-xl space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-bold text-slate-900">{item.productName}</p>
                          <p className="text-[11px] text-slate-500">{item.variantName}</p>
                          {item.imeiList.length > 0 && (
                            <p className="text-[11px] font-mono text-emerald-700 font-bold mt-0.5">
                              IMEI: {item.imeiList.join(', ')}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 block uppercase">Refund Value</span>
                          <span className="font-mono font-bold text-slate-900">{formatBDT(item.total)}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                        <div>
                          <label className="text-[10px] font-semibold text-slate-500 block mb-0.5">Item Condition</label>
                          <select
                            value={item.condition}
                            onChange={(e) => {
                              const cond = e.target.value as any;
                              setReturnItems(prev => prev.map((it, i) => i === idx ? { ...it, condition: cond } : it));
                            }}
                            className="w-full p-1.5 border border-slate-300 rounded text-xs"
                          >
                            <option value="RESTOCKABLE">Resellable / Back into In-Stock</option>
                            <option value="DEFECTIVE_SERVICE">Defective / Send for Warranty</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] font-semibold text-slate-500 block mb-0.5">Refund Rate (৳)</label>
                          <input
                            type="number"
                            value={item.refundRate || ''}
                            onChange={(e) => {
                              const rate = Number(e.target.value);
                              setReturnItems(prev => prev.map((it, i) => i === idx ? { ...it, refundRate: rate, total: rate * it.quantity } : it));
                            }}
                            className="w-full p-1.5 border border-slate-300 rounded font-mono text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Settlement / Refund Options */}
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200">
                <div>
                  <label className="font-semibold text-slate-700 mb-1 block">Refund Settlement Type</label>
                  <select
                    value={refundMethod}
                    onChange={(e) => setRefundMethod(e.target.value as any)}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  >
                    <option value="Credit_Adjustment">Adjust Against Customer Due Balance</option>
                    <option value="Cash">Cash Refund (Counter)</option>
                    <option value="Bank">Bank / MFS Refund</option>
                  </select>
                </div>

                {refundMethod !== 'Credit_Adjustment' && (
                  <div>
                    <label className="font-semibold text-slate-700 mb-1 block">Deduct Refund From Account</label>
                    <select
                      value={accountId}
                      onChange={(e) => setAccountId(e.target.value)}
                      className="w-full p-2 border border-slate-300 rounded-lg"
                    >
                      <optgroup label="Cash Drawers">
                        {cashAccounts.map(ca => (
                          <option key={ca.id} value={ca.id}>{ca.name}</option>
                        ))}
                      </optgroup>
                      <optgroup label="Bank Accounts">
                        {bankAccounts.map(ba => (
                          <option key={ba.id} value={ba.id}>{ba.bankName}</option>
                        ))}
                      </optgroup>
                    </select>
                  </div>
                )}
              </div>

              <div>
                <label className="font-semibold text-slate-700 mb-1 block">Reason / Return Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Customer returned adapter unopened within 3 days"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex justify-between items-center font-bold text-sm text-emerald-900">
                <span>Total Refund Amount:</span>
                <span className="font-mono text-base">{formatBDT(totalRefundAmount)}</span>
              </div>
            </>
          )}

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-lg font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!activeInvoice}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white rounded-lg font-bold transition flex items-center gap-1.5"
            >
              <span>Confirm Sales Return</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
