import React, { useState } from 'react';
import { FileText, X, Plus, Trash2, ArrowRight, Smartphone } from 'lucide-react';
import { useERP } from '../../services/erpStore';
import { formatBDT, getPriceForCustomer } from '../../utils/formatters';
import { SaleItem } from '../../types/erp';

interface NewQuotationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (quoteNo: string) => void;
}

export const NewQuotationModal: React.FC<NewQuotationModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { customers, products, branches, createQuotation, currentBranchId, language } = useERP();

  const [customerId, setCustomerId] = useState(customers[0]?.id || '');
  const [branchId, setBranchId] = useState(currentBranchId !== 'all' ? currentBranchId : branches[0].id);
  const [validUntil, setValidUntil] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  });
  const [notes, setNotes] = useState('Price quotation valid for 7 days. Subject to stock availability.');
  const [items, setItems] = useState<SaleItem[]>([]);

  // Item Picker
  const [selectedProductId, setSelectedProductId] = useState('');
  const [selectedVariantId, setSelectedVariantId] = useState('');
  const [qty, setQty] = useState(1);
  const [rate, setRate] = useState(0);

  if (!isOpen) return null;

  const activeCustomer = customers.find(c => c.id === customerId);
  const activeProduct = products.find(p => p.id === selectedProductId);
  const activeVariant = activeProduct?.variants.find(v => v.id === selectedVariantId);

  const handleAddItem = () => {
    if (!activeProduct || !activeVariant) return;
    const newItem: SaleItem = {
      productId: activeProduct.id,
      variantId: activeVariant.id,
      productName: `${activeProduct.brandName} ${activeProduct.model}`,
      variantName: activeVariant.storage ? `${activeVariant.storage} - ${activeVariant.color}` : activeVariant.color,
      imeiList: [],
      quantity: qty,
      unitPrice: rate,
      unitCost: activeVariant.purchasePrice,
      discount: 0,
      total: rate * qty
    };
    setItems(prev => [...prev, newItem]);
    setSelectedProductId('');
    setSelectedVariantId('');
    setQty(1);
    setRate(0);
  };

  const subtotal = items.reduce((acc, it) => acc + (it.unitPrice * it.quantity), 0);
  const grandTotal = subtotal;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0 || !customerId) return;

    const quote = createQuotation({
      customerId,
      branchId,
      validUntil,
      items,
      subtotal,
      discount: 0,
      grandTotal,
      notes
    });

    onSuccess(quote.quoteNo);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <h2 className="text-sm font-bold flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-400" />
            <span>Create Wholesale Price Quotation (দরপ্রস্তাব)</span>
          </h2>
          <button onClick={onClose}>
            <X className="w-5 h-5 text-slate-400 hover:text-white" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-slate-50 border rounded-xl">
            <div>
              <label className="font-semibold text-slate-700 mb-1 block">Customer / Dealer</label>
              <select
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg bg-white"
              >
                {customers.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.businessName ? `${c.businessName} (${c.name})` : c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 mb-1 block">Quotation Branch</label>
              <select
                value={branchId}
                onChange={(e) => setBranchId(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg bg-white"
              >
                {branches.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 mb-1 block">Valid Until Date</label>
              <input
                type="date"
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg bg-white"
              />
            </div>
          </div>

          {/* Add Item Bar */}
          <div className="p-3 bg-slate-50 border rounded-xl space-y-2">
            <span className="font-bold text-slate-700 block">Add Model to Quotation</span>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
              <div className="sm:col-span-2">
                <select
                  value={selectedProductId}
                  onChange={(e) => {
                    setSelectedProductId(e.target.value);
                    const prod = products.find(p => p.id === e.target.value);
                    if (prod && prod.variants.length > 0) {
                      setSelectedVariantId(prod.variants[0].id);
                      const price = activeCustomer ? getPriceForCustomer(prod.variants[0], activeCustomer.priceLevel) : prod.variants[0].retailPrice;
                      setRate(price);
                    }
                  }}
                  className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                >
                  <option value="">-- Select Product --</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.brandName} {p.model}</option>
                  ))}
                </select>
              </div>

              <div>
                <select
                  value={selectedVariantId}
                  onChange={(e) => {
                    setSelectedVariantId(e.target.value);
                    const v = activeProduct?.variants.find(it => it.id === e.target.value);
                    if (v && activeCustomer) setRate(getPriceForCustomer(v, activeCustomer.priceLevel));
                  }}
                  disabled={!selectedProductId}
                  className="w-full p-2 border border-slate-300 rounded-lg bg-white disabled:bg-slate-100"
                >
                  <option value="">-- Variant --</option>
                  {activeProduct?.variants.map(v => (
                    <option key={v.id} value={v.id}>{v.storage ? `${v.storage} - ${v.color}` : v.color}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2">
                <input
                  type="number"
                  min="1"
                  value={qty}
                  onChange={(e) => setQty(Math.max(1, Number(e.target.value)))}
                  placeholder="Qty"
                  className="w-16 p-2 border border-slate-300 rounded-lg text-center font-mono font-bold"
                />
                <button
                  type="button"
                  onClick={handleAddItem}
                  disabled={!selectedProductId || !selectedVariantId}
                  className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white rounded-lg font-bold"
                >
                  + Add
                </button>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="border rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-600 font-semibold border-b">
                <tr>
                  <th className="py-2.5 px-3">Item</th>
                  <th className="py-2.5 px-3 text-center">Qty</th>
                  <th className="py-2.5 px-3 text-right">Quoted Rate</th>
                  <th className="py-2.5 px-3 text-right">Total</th>
                  <th className="py-2.5 px-3 text-center">Remove</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      No items added to quotation yet.
                    </td>
                  </tr>
                ) : (
                  items.map((it, idx) => (
                    <tr key={idx}>
                      <td className="py-2 px-3 font-semibold text-slate-900">
                        {it.productName} ({it.variantName})
                      </td>
                      <td className="py-2 px-3 text-center font-mono">{it.quantity}</td>
                      <td className="py-2 px-3 text-right font-mono">{formatBDT(it.unitPrice)}</td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">{formatBDT(it.total)}</td>
                      <td className="py-2 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => setItems(prev => prev.filter((_, i) => i !== idx))}
                          className="p-1 text-slate-400 hover:text-rose-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between items-center p-3 bg-slate-50 border rounded-xl font-bold text-sm">
            <span>Total Quoted Amount:</span>
            <span className="font-mono text-emerald-800 text-base">{formatBDT(grandTotal)}</span>
          </div>

          <div>
            <label className="font-semibold text-slate-700 mb-1 block">Terms & Validity Note</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-lg"
            />
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
              disabled={items.length === 0}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white rounded-lg font-bold flex items-center gap-1.5"
            >
              <span>Generate Quotation</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
