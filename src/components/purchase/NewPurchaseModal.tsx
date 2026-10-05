import React, { useState } from 'react';
import { 
  X, Plus, Trash2, Truck, Smartphone, Building, AlertCircle, 
  ArrowRight, Calculator, Check, Sparkles
} from 'lucide-react';
import { useERP } from '../../services/erpStore';
import { formatBDT } from '../../utils/formatters';
import { PaymentMethod, PaymentRecord } from '../../types/erp';

interface NewPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (invoiceNo: string) => void;
}

export const NewPurchaseModal: React.FC<NewPurchaseModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const {
    suppliers,
    products,
    cashAccounts,
    bankAccounts,
    branches,
    currentBranchId,
    createPurchase,
    language
  } = useERP();

  const [supplierId, setSupplierId] = useState(suppliers[0]?.id || '');
  const [supplierInvoiceNo, setSupplierInvoiceNo] = useState('');
  const [branchId, setBranchId] = useState(currentBranchId !== 'all' ? currentBranchId : branches[0].id);

  // Items in Purchase
  const [items, setItems] = useState<Array<{
    productId: string;
    variantId: string;
    productName: string;
    variantName: string;
    hasImei: boolean;
    quantity: number;
    purchaseRate: number;
    imeis: { imei1: string; imei2?: string }[];
  }>>([]);

  // Item Picker
  const [selectedProductId, setSelectedProductId] = useState('');
  const [selectedVariantId, setSelectedVariantId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [purchaseRate, setPurchaseRate] = useState(0);
  const [inputImeisText, setInputImeisText] = useState('');

  // Landed Cost inputs
  const [transportCost, setTransportCost] = useState(0);
  const [courierCost, setCourierCost] = useState(0);
  const [handlingCost, setHandlingCost] = useState(0);
  const [otherCost, setOtherCost] = useState(0);

  // Payments
  const [payments, setPayments] = useState<Array<{
    method: PaymentMethod;
    amount: number;
    accountId: string;
    trxId?: string;
  }>>([
    { method: 'Bank', amount: 0, accountId: bankAccounts[0]?.id || '' }
  ]);

  const [errorMessage, setErrorMessage] = useState('');

  const activeProduct = products.find(p => p.id === selectedProductId);
  const activeVariant = activeProduct?.variants.find(v => v.id === selectedVariantId);

  if (!isOpen) return null;

  // Quick Helper: Generate random 15-digit test IMEIs
  const handleAutoGenerateImeis = () => {
    const list: string[] = [];
    for (let i = 0; i < quantity; i++) {
      const randomDigits = Math.floor(1000000000 + Math.random() * 9000000000);
      list.push(`86${randomDigits}`);
    }
    setInputImeisText(list.join('\n'));
  };

  // Add Item to Purchase Draft
  const handleAddItem = () => {
    if (!activeProduct || !activeVariant) {
      setErrorMessage('Please select a product and variant');
      return;
    }
    if (quantity <= 0 || purchaseRate <= 0) {
      setErrorMessage('Please enter valid quantity and rate');
      return;
    }

    let parsedImeis: { imei1: string; imei2?: string }[] = [];
    if (activeProduct.hasImei) {
      const lines = inputImeisText
        .split(/[\n,]/)
        .map(s => s.trim())
        .filter(s => s.length > 0);

      if (lines.length < quantity) {
        setErrorMessage(`Please enter ${quantity} IMEI numbers (currently entered: ${lines.length})`);
        return;
      }

      parsedImeis = lines.slice(0, quantity).map(line => {
        const parts = line.split('/');
        return {
          imei1: parts[0]?.trim() || '',
          imei2: parts[1]?.trim() || undefined
        };
      });
    }

    setItems(prev => [
      ...prev,
      {
        productId: activeProduct.id,
        variantId: activeVariant.id,
        productName: `${activeProduct.brandName} ${activeProduct.model}`,
        variantName: activeVariant.storage ? `${activeVariant.storage} - ${activeVariant.color}` : activeVariant.color,
        hasImei: activeProduct.hasImei,
        quantity,
        purchaseRate,
        imeis: parsedImeis
      }
    ]);

    // Reset picker
    setSelectedProductId('');
    setSelectedVariantId('');
    setQuantity(1);
    setPurchaseRate(0);
    setInputImeisText('');
    setErrorMessage('');
  };

  const handleRemoveItem = (index: number) => {
    setItems(prev => prev.filter((_, idx) => idx !== index));
  };

  // Landed Cost & Totals Calculation
  const subtotal = items.reduce((acc, it) => acc + (it.purchaseRate * it.quantity), 0);
  const totalLandedCost = transportCost + courierCost + handlingCost + otherCost;
  const grandTotal = subtotal + totalLandedCost;

  const totalPaid = payments.reduce((acc, p) => acc + (p.amount || 0), 0);
  const dueAmount = Math.max(0, grandTotal - totalPaid);

  // Allocate Landed Cost proportionally to each unit
  const totalQuantity = items.reduce((acc, it) => acc + it.quantity, 0);
  const allocatedPerUnit = totalQuantity > 0 ? (totalLandedCost / totalQuantity) : 0;

  const preparedItems = items.map(it => {
    const unitLanded = Math.round(allocatedPerUnit);
    const effectiveCost = it.purchaseRate + unitLanded;
    return {
      productId: it.productId,
      variantId: it.variantId,
      productName: it.productName,
      variantName: it.variantName,
      quantity: it.quantity,
      purchaseRate: it.purchaseRate,
      allocatedLandedCost: unitLanded,
      effectiveUnitCost: effectiveCost,
      total: effectiveCost * it.quantity,
      imeis: it.imeis
    };
  });

  const handleCompletePurchase = () => {
    if (items.length === 0) {
      setErrorMessage('Please add at least one item');
      return;
    }
    if (!supplierId) {
      setErrorMessage('Please select a supplier');
      return;
    }

    const validPayments: PaymentRecord[] = payments
      .filter(p => p.amount > 0)
      .map(p => {
        const cashAcc = cashAccounts.find(ca => ca.id === p.accountId);
        const bankAcc = bankAccounts.find(ba => ba.id === p.accountId);
        return {
          id: `pmt-${Date.now()}-${Math.random()}`,
          method: p.method,
          amount: p.amount,
          accountId: p.accountId,
          accountName: cashAcc ? cashAcc.name : (bankAcc ? bankAcc.bankName : p.method),
          trxId: p.trxId,
          date: new Date().toISOString().split('T')[0]
        };
      });

    const res = createPurchase({
      supplierId,
      supplierInvoiceNo: supplierInvoiceNo || `BILL-${Date.now().toString().slice(-4)}`,
      branchId,
      items: preparedItems,
      landedCost: {
        transport: transportCost,
        courier: courierCost,
        handling: handlingCost,
        other: otherCost
      },
      totalLandedCost,
      subtotal,
      grandTotal,
      paidAmount: totalPaid,
      dueAmount,
      payments: validPayments
    });

    if (res.success && res.invoice) {
      onSuccess(res.invoice.invoiceNo);
      onClose();
    } else {
      setErrorMessage(res.error || 'Failed to complete purchase');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl border border-slate-200 overflow-hidden my-auto max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold">
                {language === 'bn' ? 'নতুন মাল ক্রয় ও চালান (New Purchase)' : 'New Purchase with Landed Cost & IMEI'}
              </h2>
              <p className="text-xs text-slate-300">
                Landed costs (Transport, Handling) are automatically allocated to phone unit costs
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Supplier & Invoice metadata */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Supplier / Distributor
              </label>
              <select
                value={supplierId}
                onChange={(e) => setSupplierId(e.target.value)}
                className="w-full text-xs font-semibold p-2 rounded-lg border border-slate-300 bg-white"
              >
                {suppliers.map(s => (
                  <option key={s.id} value={s.id}>{s.name} ({s.company})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Supplier Bill / Invoice #
              </label>
              <input
                type="text"
                placeholder="e.g. EXL-DH-9018"
                value={supplierInvoiceNo}
                onChange={(e) => setSupplierInvoiceNo(e.target.value)}
                className="w-full text-xs font-mono font-bold p-2 rounded-lg border border-slate-300 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Destination Branch / Warehouse
              </label>
              <select
                value={branchId}
                onChange={(e) => setBranchId(e.target.value)}
                className="w-full text-xs font-semibold p-2 rounded-lg border border-slate-300 bg-white"
              >
                {branches.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Product Picker */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-blue-600" />
              <span>Select Product to Purchase</span>
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              <div className="lg:col-span-2">
                <label className="text-[11px] text-slate-600 font-semibold mb-1 block">Product</label>
                <select
                  value={selectedProductId}
                  onChange={(e) => {
                    setSelectedProductId(e.target.value);
                    const p = products.find(prod => prod.id === e.target.value);
                    if (p && p.variants.length > 0) {
                      setSelectedVariantId(p.variants[0].id);
                      setPurchaseRate(p.variants[0].purchasePrice);
                    }
                  }}
                  className="w-full text-xs font-medium p-2 rounded-lg border border-slate-300 bg-white"
                >
                  <option value="">-- Choose Product --</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.brandName} {p.model}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] text-slate-600 font-semibold mb-1 block">Variant / Storage</label>
                <select
                  value={selectedVariantId}
                  onChange={(e) => {
                    setSelectedVariantId(e.target.value);
                    const v = activeProduct?.variants.find(item => item.id === e.target.value);
                    if (v) setPurchaseRate(v.purchasePrice);
                  }}
                  disabled={!selectedProductId}
                  className="w-full text-xs font-medium p-2 rounded-lg border border-slate-300 bg-white disabled:bg-slate-100"
                >
                  <option value="">-- Variant --</option>
                  {activeProduct?.variants.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.storage ? `${v.storage} - ${v.color}` : v.color}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] text-slate-600 font-semibold mb-1 block">Qty</label>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                  className="w-full text-xs font-mono font-bold p-2 rounded-lg border border-slate-300 bg-white"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-600 font-semibold mb-1 block">Unit Rate (৳)</label>
                <input
                  type="number"
                  value={purchaseRate || ''}
                  onChange={(e) => setPurchaseRate(Number(e.target.value))}
                  placeholder="0"
                  className="w-full text-xs font-mono font-bold p-2 rounded-lg border border-slate-300 bg-white"
                />
              </div>
            </div>

            {/* IMEI input textarea if phone has IMEI */}
            {activeProduct?.hasImei && (
              <div className="pt-2 border-t border-slate-200">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-bold text-slate-700">
                    Enter {quantity} IMEI Number(s) (One per line or comma separated):
                  </span>
                  <button
                    type="button"
                    onClick={handleAutoGenerateImeis}
                    className="text-[11px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Auto-Generate Valid Test IMEIs</span>
                  </button>
                </div>
                <textarea
                  rows={2}
                  placeholder={`Paste ${quantity} IMEIs here (e.g. 864209061001234 or dual IMEI: 864209061001234/864209061001235)`}
                  value={inputImeisText}
                  onChange={(e) => setInputImeisText(e.target.value)}
                  className="w-full text-xs font-mono p-2 rounded-lg border border-slate-300 bg-white"
                />
              </div>
            )}

            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={handleAddItem}
                disabled={!selectedProductId || !selectedVariantId}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Item to Bill</span>
              </button>
            </div>
          </div>

          {/* Items Draft Table */}
          <div className="rounded-xl border border-slate-200 overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[650px]">
              <thead className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-3">Item</th>
                  <th className="py-2.5 px-3">IMEIs</th>
                  <th className="py-2.5 px-3 text-center">Qty</th>
                  <th className="py-2.5 px-3 text-right">Purchase Rate</th>
                  <th className="py-2.5 px-3 text-right">Landed Cost/Unit</th>
                  <th className="py-2.5 px-3 text-right">Effective Cost</th>
                  <th className="py-2.5 px-3 text-right">Total</th>
                  <th className="py-2.5 px-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400">
                      No purchase items added yet.
                    </td>
                  </tr>
                ) : (
                  items.map((it, idx) => {
                    const unitLanded = Math.round(allocatedPerUnit);
                    const effective = it.purchaseRate + unitLanded;
                    return (
                      <tr key={idx} className="hover:bg-slate-50/70">
                        <td className="py-2.5 px-3 font-semibold text-slate-900">
                          {it.productName}
                          <span className="block text-[11px] text-slate-500 font-normal">{it.variantName}</span>
                        </td>
                        <td className="py-2.5 px-3">
                          {it.imeis.length > 0 ? (
                            <span className="font-mono text-[10px] text-slate-600 font-bold">
                              {it.imeis.length} IMEIs Registered
                            </span>
                          ) : (
                            <span className="text-slate-400 italic text-[11px]">Barcode Item</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono font-bold">{it.quantity}</td>
                        <td className="py-2.5 px-3 text-right font-mono">{formatBDT(it.purchaseRate)}</td>
                        <td className="py-2.5 px-3 text-right font-mono text-blue-700">+{formatBDT(unitLanded)}</td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">{formatBDT(effective)}</td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                          {formatBDT(effective * it.quantity)}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(idx)}
                            className="p-1 text-slate-400 hover:text-rose-600 transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Landed Cost Inputs & Settlement */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 rounded-xl bg-slate-50 border border-slate-200">
            {/* Landed Costs */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Calculator className="w-4 h-4 text-blue-600" />
                <span>Landed Cost Breakdown (পরিবহন ও অন্যান্য খরচ)</span>
              </span>
              <p className="text-[11px] text-slate-500">
                Additional expenses will be proportionally distributed into unit cost.
              </p>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="text-[11px] text-slate-600 font-semibold mb-1 block">Transport (৳)</label>
                  <input
                    type="number"
                    value={transportCost || ''}
                    onChange={(e) => setTransportCost(Number(e.target.value))}
                    placeholder="0"
                    className="w-full font-mono p-1.5 border border-slate-300 rounded bg-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-600 font-semibold mb-1 block">Courier / Sundarban (৳)</label>
                  <input
                    type="number"
                    value={courierCost || ''}
                    onChange={(e) => setCourierCost(Number(e.target.value))}
                    placeholder="0"
                    className="w-full font-mono p-1.5 border border-slate-300 rounded bg-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-600 font-semibold mb-1 block">Loading / Handling (৳)</label>
                  <input
                    type="number"
                    value={handlingCost || ''}
                    onChange={(e) => setHandlingCost(Number(e.target.value))}
                    placeholder="0"
                    className="w-full font-mono p-1.5 border border-slate-300 rounded bg-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-600 font-semibold mb-1 block">Insurance / Other (৳)</label>
                  <input
                    type="number"
                    value={otherCost || ''}
                    onChange={(e) => setOtherCost(Number(e.target.value))}
                    placeholder="0"
                    className="w-full font-mono p-1.5 border border-slate-300 rounded bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Totals & Payments */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2.5">
              <div className="flex justify-between text-xs text-slate-600">
                <span>Products Base Total:</span>
                <span className="font-mono font-semibold">{formatBDT(subtotal)}</span>
              </div>
              <div className="flex justify-between text-xs text-blue-700">
                <span>Total Landed Cost:</span>
                <span className="font-mono font-semibold">+{formatBDT(totalLandedCost)}</span>
              </div>
              <div className="border-t border-slate-200 pt-2 flex justify-between text-sm font-bold text-slate-900">
                <span>Total Invoice Value:</span>
                <span className="font-mono text-base text-blue-800">{formatBDT(grandTotal)}</span>
              </div>

              {/* Payment input */}
              <div className="pt-2 border-t border-slate-100">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Payment to Supplier (পরিশোধ):
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={payments[0]?.accountId}
                    onChange={(e) => setPayments([{ ...payments[0], accountId: e.target.value }])}
                    className="text-xs p-1.5 border border-slate-300 rounded"
                  >
                    <optgroup label="Bank Accounts">
                      {bankAccounts.map(ba => (
                        <option key={ba.id} value={ba.id}>{ba.bankName}</option>
                      ))}
                    </optgroup>
                    <optgroup label="Cash Drawers">
                      {cashAccounts.map(ca => (
                        <option key={ca.id} value={ca.id}>{ca.name}</option>
                      ))}
                    </optgroup>
                  </select>
                  <input
                    type="number"
                    placeholder="Paid Amount ৳"
                    value={payments[0]?.amount || ''}
                    onChange={(e) => setPayments([{ ...payments[0], amount: Number(e.target.value) }])}
                    className="text-xs font-mono font-bold p-1.5 border border-slate-300 rounded text-right"
                  />
                </div>
              </div>

              <div className="flex justify-between font-bold text-xs pt-2 border-t border-slate-200">
                <span className="text-slate-800">Payable to Supplier (বাকি):</span>
                <span className={`font-mono ${dueAmount > 0 ? 'text-rose-600 text-sm' : 'text-slate-500'}`}>
                  {formatBDT(dueAmount)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-500 font-medium">
            Supplier: {suppliers.find(s => s.id === supplierId)?.name}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleCompletePurchase}
              className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition shadow-md flex items-center gap-1.5"
            >
              <span>{language === 'bn' ? 'ক্রয় চালান নিশ্চিত করুন' : 'Confirm Purchase & Stock In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
