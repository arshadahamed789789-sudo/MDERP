import React, { useState } from 'react';
import { 
  X, Printer, Check, Ban, AlertCircle, Truck, Building, 
  DollarSign, FileText, Smartphone, ArrowDownRight, Tag, MessageSquare, Copy
} from 'lucide-react';
import { PurchaseInvoice } from '../../types/erp';
import { useERP } from '../../services/erpStore';
import { formatBDT, formatDate } from '../../utils/formatters';
import { shareViaWhatsApp, copyToClipboard } from '../../utils/shareUtils';

interface PurchaseBillDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  purchase: PurchaseInvoice | null;
  onVoidSuccess?: () => void;
}

export const PurchaseBillDetailsModal: React.FC<PurchaseBillDetailsModalProps> = ({
  isOpen,
  onClose,
  purchase,
  onVoidSuccess
}) => {
  const { businessConfig, suppliers, bankAccounts, cashAccounts, paySupplier, voidPurchaseBill, language } = useERP();

  const [showPayForm, setShowPayForm] = useState(false);
  const [payAmount, setPayAmount] = useState(0);
  const [payAccountId, setPayAccountId] = useState(bankAccounts[0]?.id || cashAccounts[0]?.id || '');
  const [payMethod, setPayMethod] = useState<'Bank' | 'Cash' | 'bKash' | 'Nagad'>('Bank');
  const [payTrxId, setPayTrxId] = useState('');
  const [payNotes, setPayNotes] = useState('');
  const [copied, setCopied] = useState(false);

  const [confirmVoid, setConfirmVoid] = useState(false);
  const [voidReason, setVoidReason] = useState('');
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  if (!isOpen || !purchase) return null;

  const supplier = suppliers.find(s => s.id === purchase.supplierId);

  const handlePaySupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (payAmount <= 0) return;

    paySupplier({
      supplierId: purchase.supplierId,
      amount: payAmount,
      accountId: payAccountId,
      method: payMethod,
      trxId: payTrxId,
      notes: payNotes || `Payment for Bill #${purchase.invoiceNo}`
    });

    setActionSuccess('Payment recorded and supplier ledger credited!');
    setShowPayForm(false);
    setTimeout(() => setActionSuccess(''), 3000);
  };

  const handleVoidBill = () => {
    const res = voidPurchaseBill(purchase.invoiceNo, voidReason || 'Voided from Purchase Manager');
    if (!res.success) {
      setActionError(res.error || 'Cannot cancel purchase bill');
      setConfirmVoid(false);
    } else {
      if (onVoidSuccess) onVoidSuccess();
      onClose();
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const billShareText = `📦 *${businessConfig?.shopName || 'DEALERFLOW HUB'} - ক্রয় চালান (Purchase Bill)*
📄 চালান নং: *${purchase.invoiceNo}* ${purchase.supplierInvoiceNo ? `(সাপ্লায়ার মেমো: ${purchase.supplierInvoiceNo})` : ''}
📅 তারিখ: ${formatDate(purchase.date)}
🏢 মহাজন / সাপ্লায়ার: *${purchase.supplierName}*

📋 *ক্রয়কৃত পণ্যের বিবরণ:*
${purchase.items.map((it, idx) => `${idx + 1}. ${it.productModel} (${it.variantName}) x ${it.quantity} = ${formatBDT(it.total)}${it.imeis?.length ? `\n   IMEI (${it.imeis.length}): ${it.imeis.join(', ')}` : ''}`).join('\n')}

💵 চালান মোট মূল্য: ${formatBDT(purchase.grandTotal)}
✅ পরিশোধিত: ${formatBDT(purchase.paidAmount)}
${purchase.dueAmount > 0 ? `⚠️ *মহাজন বাকি পাওনা: ${formatBDT(purchase.dueAmount)}*` : '🎉 *সম্পূর্ণ পরিশোধিত (Full Paid)*'}`;

  const handleCopyText = async () => {
    const success = await copyToClipboard(billShareText);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in-50">
      <div 
        className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold tracking-wide">
                  {language === 'bn' ? 'ক্রয় চালান বিস্তারিত (Purchase Bill)' : 'Purchase Bill & Goods Received Note'}
                </h2>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                  purchase.status === 'CANCELLED' ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {purchase.status}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono">
                Bill #: {purchase.invoiceNo} {purchase.supplierInvoiceNo && `(Ref: ${purchase.supplierInvoiceNo})`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => shareViaWhatsApp(billShareText, supplier?.mobile)}
              className="px-2.5 py-1 bg-[#25D366] hover:bg-[#20ba59] text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
              title="WhatsApp এ ক্রয় চালান শেয়ার করুন"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">WhatsApp</span>
            </button>
            <button
              type="button"
              onClick={handleCopyText}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              title="ক্রয় চালান কপি করুন"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{copied ? 'কপি হয়েছে' : 'কপি'}</span>
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              title="Print Goods Receipt"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button 
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-xs">
          {actionError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{actionError}</span>
            </div>
          )}

          {actionSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{actionSuccess}</span>
            </div>
          )}

          {/* Supplier & Bill Metadata */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-50 border border-slate-200 rounded-xl">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Supplier / Importer</span>
              <p className="font-extrabold text-sm text-slate-900 mt-0.5">{purchase.supplierName}</p>
              {supplier && (
                <p className="text-[11px] text-slate-600 mt-0.5">
                  Contact: {supplier.contactPerson} • {supplier.mobile}
                </p>
              )}
              {supplier?.address && (
                <p className="text-[11px] text-slate-500 mt-0.5">{supplier.address}</p>
              )}
            </div>

            <div className="sm:text-right">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Receiving Details</span>
              <p className="font-semibold text-slate-800 mt-0.5">
                Date: <strong>{formatDate(purchase.date)}</strong>
              </p>
              <p className="text-[11px] text-slate-600 mt-0.5">
                Destination: <strong>{purchase.branchName}</strong>
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Supplier Bill Ref: <span className="font-mono">{purchase.supplierInvoiceNo || 'N/A'}</span>
              </p>
            </div>
          </div>

          {/* Items Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-2.5 px-3">Item / Device Model</th>
                  <th className="py-2.5 px-3">Variant</th>
                  <th className="py-2.5 px-3 text-center">Qty</th>
                  <th className="py-2.5 px-3 text-right">Unit Rate</th>
                  <th className="py-2.5 px-3 text-right">Landed Cost</th>
                  <th className="py-2.5 px-3 text-right">Total (৳)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {purchase.items.map((it, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/70">
                    <td className="py-3 px-3">
                      <p className="font-bold text-slate-900">{it.productName}</p>
                      {it.imeis && it.imeis.length > 0 && (
                        <div className="mt-1 flex flex-wrap gap-1">
                          {it.imeis.map(im => (
                            <span key={im.imei1} className="font-mono text-[10px] px-1.5 py-0.5 bg-slate-200 text-slate-800 rounded">
                              {im.imei1}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-3 text-slate-600">{it.variantName}</td>
                    <td className="py-3 px-3 text-center font-bold text-slate-900">{it.quantity}</td>
                    <td className="py-3 px-3 text-right font-mono text-slate-700">{formatBDT(it.purchaseRate)}</td>
                    <td className="py-3 px-3 text-right font-mono text-blue-700">+{formatBDT(it.allocatedLandedCost)}</td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">{formatBDT(it.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Financial Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Landed Cost Breakdown</span>
              <div className="flex justify-between text-slate-600">
                <span>Transport / Freight:</span>
                <span className="font-mono">{formatBDT(purchase.landedCost?.transport || 0)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Courier / Logistics:</span>
                <span className="font-mono">{formatBDT(purchase.landedCost?.courier || 0)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Handling / Port:</span>
                <span className="font-mono">{formatBDT(purchase.landedCost?.handling || 0)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Other Costs:</span>
                <span className="font-mono">{formatBDT(purchase.landedCost?.other || 0)}</span>
              </div>
              <div className="flex justify-between font-bold text-slate-800 pt-1 border-t border-slate-200">
                <span>Total Landed Surcharges:</span>
                <span className="font-mono text-blue-700">+{formatBDT(purchase.totalLandedCost)}</span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-right">
              <div className="flex justify-between text-slate-600">
                <span>Bill Subtotal:</span>
                <span className="font-mono">{formatBDT(purchase.subtotal)}</span>
              </div>
              <div className="flex justify-between font-extrabold text-slate-900 text-sm pt-1 border-t border-slate-200">
                <span>Grand Total:</span>
                <span className="font-mono">{formatBDT(purchase.grandTotal)}</span>
              </div>
              <div className="flex justify-between font-semibold text-emerald-700">
                <span>Paid Amount:</span>
                <span className="font-mono">{formatBDT(purchase.paidAmount)}</span>
              </div>
              <div className="flex justify-between font-extrabold text-amber-600 text-sm pt-1 border-t border-slate-200">
                <span>Payable Due (দেনা):</span>
                <span className="font-mono">{formatBDT(purchase.dueAmount)}</span>
              </div>
            </div>
          </div>

          {/* Settle Due Form Toggle */}
          {purchase.dueAmount > 0 && purchase.status !== 'CANCELLED' && (
            <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-amber-900">Outstanding Supplier Payable: {formatBDT(purchase.dueAmount)}</h4>
                  <p className="text-[11px] text-amber-700">Record payments to distributor to reduce payable balance.</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setPayAmount(purchase.dueAmount);
                    setShowPayForm(!showPayForm);
                  }}
                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold text-xs shadow-xs"
                >
                  {showPayForm ? 'Hide Payment Form' : 'Settle Payment Now'}
                </button>
              </div>

              {showPayForm && (
                <form onSubmit={handlePaySupplier} className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-amber-200">
                  <div>
                    <label className="font-semibold text-amber-900 mb-1 block">Payment Amount (৳)</label>
                    <input
                      type="number"
                      max={purchase.dueAmount}
                      value={payAmount || ''}
                      onChange={e => setPayAmount(Number(e.target.value))}
                      className="w-full p-2 bg-white border border-amber-300 rounded-lg font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-amber-900 mb-1 block">Payment Method</label>
                    <select
                      value={payMethod}
                      onChange={e => setPayMethod(e.target.value as any)}
                      className="w-full p-2 bg-white border border-amber-300 rounded-lg"
                    >
                      <option value="Bank">Bank Transfer</option>
                      <option value="Cash">Cash Counter</option>
                      <option value="bKash">bKash Merchant</option>
                      <option value="Nagad">Nagad</option>
                    </select>
                  </div>
                  <div className="flex items-end">
                    <button
                      type="submit"
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold shadow-xs flex items-center justify-center gap-1.5"
                    >
                      <Check className="w-4 h-4" />
                      <span>Confirm Payment</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Void / Cancel Purchase Bill (CRUD) */}
          {purchase.status !== 'CANCELLED' && (
            <div className="pt-3 border-t border-slate-200">
              {!confirmVoid ? (
                <button
                  type="button"
                  onClick={() => setConfirmVoid(true)}
                  className="px-3 py-1.5 text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold transition flex items-center gap-1.5"
                >
                  <Ban className="w-3.5 h-3.5" />
                  <span>{language === 'bn' ? 'চালান বাতিল করুন (Void Bill)' : 'Void / Cancel Purchase Bill'}</span>
                </button>
              ) : (
                <div className="p-3 bg-rose-50 border border-rose-300 rounded-xl space-y-2">
                  <p className="text-[11px] font-semibold text-rose-900">
                    {language === 'bn'
                      ? 'আপনি কি নিশ্চিত যে এই ক্রয় চালানটি বাতিল করতে চান? ইনভেন্টরি থেকে অবিক্রিত আইএমইআই ডিভাইস মুছে যাবে এবং মহাজন দেনা রিভার্স হবে।'
                      : 'Are you sure you want to void this bill? Unsold IMEIs will be removed from stock and supplier payables will be reversed.'}
                  </p>
                  <input
                    type="text"
                    placeholder="Reason for cancellation (e.g. Supplier invoice cancelled, wrong entry)..."
                    value={voidReason}
                    onChange={e => setVoidReason(e.target.value)}
                    className="w-full p-2 text-xs border border-rose-300 rounded-lg bg-white"
                  />
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setConfirmVoid(false)}
                      className="flex-1 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-bold transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleVoidBill}
                      className="flex-1 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition shadow-xs"
                    >
                      Confirm Void Bill
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
