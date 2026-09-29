import React, { useState, useEffect } from 'react';
import { 
  X, Plus, Trash2, ShoppingBag, Smartphone, User, AlertCircle, 
  Check, CreditCard, ShieldAlert, ArrowRight, Scan
} from 'lucide-react';
import { useERP } from '../../services/erpStore';
import { formatBDT, getPriceForCustomer } from '../../utils/formatters';
import { PaymentMethod, PaymentRecord, SaleItem } from '../../types/erp';

interface NewSaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (invoiceNo: string) => void;
}

export const NewSaleModal: React.FC<NewSaleModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const {
    customers,
    products,
    imeis,
    cashAccounts,
    bankAccounts,
    branches,
    currentBranchId,
    currentUser,
    users,
    createSale,
    language
  } = useERP();

  // Selected branch
  const activeBranchId = currentBranchId !== 'all' ? currentBranchId : branches[0].id;
  const [branchId, setBranchId] = useState(activeBranchId);
  const [salesmanId, setSalesmanId] = useState(currentUser.id);

  // Customer state
  const [selectedCustomerId, setSelectedCustomerId] = useState(customers[0]?.id || '');
  const selectedCustomer = customers.find(c => c.id === selectedCustomerId);

  // Cart Items
  const [cartItems, setCartItems] = useState<SaleItem[]>([]);

  // Picker states for adding an item
  const [selectedProductId, setSelectedProductId] = useState('');
  const [selectedVariantId, setSelectedVariantId] = useState('');
  const [selectedImeis, setSelectedImeis] = useState<string[]>([]);
  const [itemQuantity, setItemQuantity] = useState(1);
  const [itemUnitPrice, setItemUnitPrice] = useState(0);
  const [itemDiscount, setItemDiscount] = useState(0);

  // Invoice level discounts & tax
  const [overallDiscount, setOverallDiscount] = useState(0);
  const [notes, setNotes] = useState('');

  // Payment splits
  const [payments, setPayments] = useState<Array<{
    method: PaymentMethod;
    amount: number;
    accountId: string;
    trxId?: string;
  }>>([
    { method: 'Cash', amount: 0, accountId: cashAccounts[0]?.id || '' }
  ]);

  // Credit limit override
  const [creditLimitApproved, setCreditLimitApproved] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Reset or initialize on product selection
  const activeProduct = products.find(p => p.id === selectedProductId);
  const activeVariant = activeProduct?.variants.find(v => v.id === selectedVariantId);

  // Filter available IMEIs for active product & variant in current branch
  const availableImeis = imeis.filter(i => 
    i.productId === selectedProductId &&
    i.variantId === selectedVariantId &&
    i.branchId === branchId &&
    i.status === 'IN_STOCK' &&
    !cartItems.some(ci => ci.imeiList.includes(i.imei1))
  );

  // When customer changes, update unit price for item if being selected
  useEffect(() => {
    if (activeVariant && selectedCustomer) {
      const price = getPriceForCustomer(activeVariant, selectedCustomer.priceLevel);
      setItemUnitPrice(price);
    }
  }, [selectedCustomerId, selectedVariantId]);

  if (!isOpen) return null;

  // Add Item to Cart
  const handleAddItem = () => {
    if (!activeProduct || !activeVariant) {
      setErrorMessage('Please select a product and variant');
      return;
    }

    if (activeProduct.hasImei) {
      if (selectedImeis.length === 0) {
        setErrorMessage('Please select at least 1 IMEI for this phone');
        return;
      }
    } else {
      if (itemQuantity <= 0) {
        setErrorMessage('Please enter a valid quantity');
        return;
      }
      if (itemQuantity > activeVariant.currentStock) {
        setErrorMessage(`Only ${activeVariant.currentStock} units available in stock`);
        return;
      }
    }

    const qty = activeProduct.hasImei ? selectedImeis.length : itemQuantity;
    const itemTotal = (itemUnitPrice * qty) - itemDiscount;

    const newItem: SaleItem = {
      productId: activeProduct.id,
      variantId: activeVariant.id,
      productName: `${activeProduct.brandName} ${activeProduct.model}`,
      variantName: activeVariant.storage ? `${activeVariant.storage} - ${activeVariant.color}` : activeVariant.color,
      imeiList: activeProduct.hasImei ? selectedImeis : [],
      quantity: qty,
      unitPrice: itemUnitPrice,
      unitCost: activeVariant.purchasePrice,
      discount: itemDiscount,
      total: Math.max(0, itemTotal)
    };

    setCartItems(prev => [...prev, newItem]);
    // Reset picker
    setSelectedProductId('');
    setSelectedVariantId('');
    setSelectedImeis([]);
    setItemQuantity(1);
    setItemUnitPrice(0);
    setItemDiscount(0);
    setErrorMessage('');
  };

  const handleRemoveItem = (index: number) => {
    setCartItems(prev => prev.filter((_, idx) => idx !== index));
  };

  // Calculations
  const subtotal = cartItems.reduce((acc, it) => acc + (it.unitPrice * it.quantity), 0);
  const totalItemDiscount = cartItems.reduce((acc, it) => acc + it.discount, 0);
  const totalDiscount = totalItemDiscount + overallDiscount;
  const grandTotal = Math.max(0, subtotal - totalDiscount);

  const totalPaid = payments.reduce((acc, p) => acc + (p.amount || 0), 0);
  const dueAmount = Math.max(0, grandTotal - totalPaid);

  // Check credit limit
  const customerCurrentDue = selectedCustomer?.currentDue || 0;
  const customerCreditLimit = selectedCustomer?.creditLimit || 0;
  const projectedDue = customerCurrentDue + dueAmount;
  const isCreditExceeded = customerCreditLimit > 0 && projectedDue > customerCreditLimit;

  // Complete Sale
  const handleCompleteSale = () => {
    if (cartItems.length === 0) {
      setErrorMessage('Please add at least one product to the sale');
      return;
    }
    if (!selectedCustomerId) {
      setErrorMessage('Please select a customer');
      return;
    }
    if (isCreditExceeded && !creditLimitApproved) {
      setErrorMessage('Customer credit limit exceeded! Manager authorization required.');
      return;
    }

    // Format payment records
    const validPayments: PaymentRecord[] = payments
      .filter(p => p.amount > 0)
      .map(p => {
        const cashAcc = cashAccounts.find(ca => ca.id === p.accountId);
        const bankAcc = bankAccounts.find(ba => ba.id === p.accountId);
        const accName = cashAcc ? cashAcc.name : (bankAcc ? `${bankAcc.bankName} (${bankAcc.accountName})` : p.method);

        return {
          id: `pmt-${Date.now()}-${Math.random()}`,
          method: p.method,
          amount: p.amount,
          accountId: p.accountId,
          accountName: accName,
          trxId: p.trxId,
          date: new Date().toISOString().split('T')[0]
        };
      });

    const res = createSale({
      customerId: selectedCustomerId,
      items: cartItems,
      subtotal,
      discount: totalDiscount,
      tax: 0,
      grandTotal,
      paidAmount: totalPaid,
      dueAmount,
      payments: validPayments,
      salesmanId,
      branchId,
      notes
    });

    if (res.success && res.invoice) {
      onSuccess(res.invoice.invoiceNo);
      onClose();
    } else {
      setErrorMessage(res.error || 'Failed to complete sale');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl border border-slate-200 overflow-hidden my-auto max-h-[95vh] flex flex-col">
        {/* Modal Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold">
                {language === 'bn' ? 'নতুন বিক্রয় মেমো / POS চালান' : 'New Sales Invoice / POS'}
              </h2>
              <p className="text-xs text-slate-300">
                Single transaction updates Stock, IMEI status, Customer Ledger & Double-entry Accounting
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Top Config: Branch, Salesman, Customer */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
            {/* Branch */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Branch / Warehouse
              </label>
              <select
                value={branchId}
                onChange={(e) => setBranchId(e.target.value)}
                className="w-full text-xs font-semibold p-2 rounded-lg border border-slate-300 bg-white focus:ring-1 focus:ring-emerald-500"
              >
                {branches.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>

            {/* Salesman */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Salesman / Rep
              </label>
              <select
                value={salesmanId}
                onChange={(e) => setSalesmanId(e.target.value)}
                className="w-full text-xs font-semibold p-2 rounded-lg border border-slate-300 bg-white focus:ring-1 focus:ring-emerald-500"
              >
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                ))}
              </select>
            </div>

            {/* Customer */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Customer / Dealer Party
              </label>
              <select
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                className="w-full text-xs font-semibold p-2 rounded-lg border border-slate-300 bg-white focus:ring-1 focus:ring-emerald-500"
              >
                {customers.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.businessName ? `${c.businessName} - ${c.name}` : c.name} ({c.customerType})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Customer Profile & Credit Snapshot */}
          {selectedCustomer && (
            <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 flex flex-wrap items-center justify-between text-xs gap-3">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-emerald-700" />
                <span className="font-bold text-slate-900">{selectedCustomer.name}</span>
                <span className="text-slate-500 font-mono">({selectedCustomer.mobile})</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-800 text-[10px] font-bold uppercase">
                  Price: {selectedCustomer.priceLevel}
                </span>
              </div>
              <div className="flex items-center gap-4 text-slate-700">
                <span>
                  Current Due: <strong className={selectedCustomer.currentDue > 0 ? 'text-rose-600 font-mono' : 'text-slate-800 font-mono'}>{formatBDT(selectedCustomer.currentDue)}</strong>
                </span>
                {selectedCustomer.creditLimit > 0 && (
                  <span>
                    Credit Limit: <strong className="font-mono">{formatBDT(selectedCustomer.creditLimit)}</strong>
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Product & IMEI Selection Bar */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-emerald-600" />
                <span>Select Device or Accessory to Add</span>
              </span>
              <span className="text-[11px] text-slate-500">Auto-applies customer pricing level</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {/* Product */}
              <div className="lg:col-span-2">
                <label className="text-[11px] text-slate-600 font-semibold mb-1 block">Product Model</label>
                <select
                  value={selectedProductId}
                  onChange={(e) => {
                    setSelectedProductId(e.target.value);
                    const p = products.find(prod => prod.id === e.target.value);
                    if (p && p.variants.length > 0) {
                      setSelectedVariantId(p.variants[0].id);
                    } else {
                      setSelectedVariantId('');
                    }
                    setSelectedImeis([]);
                  }}
                  className="w-full text-xs font-medium p-2 rounded-lg border border-slate-300 bg-white"
                >
                  <option value="">-- Choose Product --</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.brandName} {p.model} ({p.category})</option>
                  ))}
                </select>
              </div>

              {/* Variant */}
              <div>
                <label className="text-[11px] text-slate-600 font-semibold mb-1 block">Variant / Color</label>
                <select
                  value={selectedVariantId}
                  onChange={(e) => {
                    setSelectedVariantId(e.target.value);
                    setSelectedImeis([]);
                  }}
                  disabled={!selectedProductId}
                  className="w-full text-xs font-medium p-2 rounded-lg border border-slate-300 bg-white disabled:bg-slate-100"
                >
                  <option value="">-- Variant --</option>
                  {activeProduct?.variants.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.storage ? `${v.storage} - ${v.color}` : v.color} (Stock: {v.currentStock})
                    </option>
                  ))}
                </select>
              </div>

              {/* Unit Price */}
              <div>
                <label className="text-[11px] text-slate-600 font-semibold mb-1 block">Unit Price (৳)</label>
                <input
                  type="number"
                  value={itemUnitPrice || ''}
                  onChange={(e) => setItemUnitPrice(Number(e.target.value))}
                  placeholder="0"
                  className="w-full text-xs font-mono font-bold p-2 rounded-lg border border-slate-300 bg-white"
                />
              </div>

              {/* Add Button */}
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={handleAddItem}
                  disabled={!selectedProductId || !selectedVariantId}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add to Cart</span>
                </button>
              </div>
            </div>

            {/* If product has IMEI: Show Available IMEIs Chips for selection */}
            {activeProduct?.hasImei && activeVariant && (
              <div className="pt-2 border-t border-slate-200">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                    <Scan className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Select Specific IMEI(s) in Stock ({availableImeis.length} available):</span>
                  </span>
                  <span className="text-[10px] text-slate-500">Click to select/unselect IMEI</span>
                </div>
                {availableImeis.length === 0 ? (
                  <p className="text-xs text-rose-600 italic py-1">No units with IN_STOCK status in this branch.</p>
                ) : (
                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1 bg-white rounded-lg border border-slate-200">
                    {availableImeis.map(im => {
                      const isSelected = selectedImeis.includes(im.imei1);
                      return (
                        <button
                          key={im.imei1}
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              setSelectedImeis(prev => prev.filter(i => i !== im.imei1));
                            } else {
                              setSelectedImeis(prev => [...prev, im.imei1]);
                            }
                          }}
                          className={`px-2 py-1 rounded text-xs font-mono transition border ${
                            isSelected 
                              ? 'bg-emerald-600 text-white border-emerald-600 font-bold shadow-xs' 
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-emerald-50'
                          }`}
                        >
                          {im.imei1}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Cart Table */}
          <div className="rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-3">Item Description</th>
                  <th className="py-2.5 px-3">IMEI Numbers</th>
                  <th className="py-2.5 px-3 text-center">Qty</th>
                  <th className="py-2.5 px-3 text-right">Unit Rate</th>
                  <th className="py-2.5 px-3 text-right">Total</th>
                  <th className="py-2.5 px-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {cartItems.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                      Cart is empty. Select a product and add to the invoice.
                    </td>
                  </tr>
                ) : (
                  cartItems.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/70">
                      <td className="py-2.5 px-3 font-semibold text-slate-900">
                        {item.productName}
                        <span className="block text-[11px] text-slate-500 font-normal">{item.variantName}</span>
                      </td>
                      <td className="py-2.5 px-3">
                        {item.imeiList.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {item.imeiList.map(im => (
                              <span key={im} className="px-1.5 py-0.5 bg-slate-100 text-slate-800 rounded font-mono text-[10px] border border-slate-200">
                                {im}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">Barcode / Standard item</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-center font-bold font-mono">
                        {item.quantity}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono">
                        {formatBDT(item.unitPrice)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                        {formatBDT(item.total)}
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
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Payment & Settlement Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 rounded-xl bg-slate-50 border border-slate-200">
            {/* Payment Method Split */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-emerald-600" />
                  <span>Settlement Methods</span>
                </span>
                <button
                  type="button"
                  onClick={() => setPayments(prev => [...prev, { method: 'bKash', amount: 0, accountId: bankAccounts[0]?.id || '' }])}
                  className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700"
                >
                  + Add Split Payment
                </button>
              </div>

              {payments.map((pmt, pIdx) => (
                <div key={pIdx} className="grid grid-cols-3 gap-2 bg-white p-2 rounded-lg border border-slate-200 items-center">
                  <select
                    value={pmt.method}
                    onChange={(e) => {
                      const m = e.target.value as PaymentMethod;
                      setPayments(prev => prev.map((p, idx) => idx === pIdx ? { ...p, method: m } : p));
                    }}
                    className="text-xs font-medium p-1.5 border border-slate-300 rounded"
                  >
                    <option value="Cash">Cash</option>
                    <option value="Bank">Bank Transfer</option>
                    <option value="bKash">bKash</option>
                    <option value="Nagad">Nagad</option>
                    <option value="Rocket">Rocket</option>
                    <option value="Card">Card POS</option>
                  </select>

                  <select
                    value={pmt.accountId}
                    onChange={(e) => {
                      const accId = e.target.value;
                      setPayments(prev => prev.map((p, idx) => idx === pIdx ? { ...p, accountId: accId } : p));
                    }}
                    className="text-xs font-medium p-1.5 border border-slate-300 rounded truncate"
                  >
                    <optgroup label="Cash Counters">
                      {cashAccounts.map(ca => (
                        <option key={ca.id} value={ca.id}>{ca.name}</option>
                      ))}
                    </optgroup>
                    <optgroup label="Bank & MFS">
                      {bankAccounts.map(ba => (
                        <option key={ba.id} value={ba.id}>{ba.bankName}</option>
                      ))}
                    </optgroup>
                  </select>

                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      placeholder="Amount ৳"
                      value={pmt.amount || ''}
                      onChange={(e) => {
                        const amt = Number(e.target.value);
                        setPayments(prev => prev.map((p, idx) => idx === pIdx ? { ...p, amount: amt } : p));
                      }}
                      className="w-full text-xs font-mono font-bold p-1.5 border border-slate-300 rounded text-right"
                    />
                    {payments.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setPayments(prev => prev.filter((_, idx) => idx !== pIdx))}
                        className="text-slate-400 hover:text-rose-600 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}

              <div>
                <label className="text-[11px] text-slate-600 font-semibold mb-1 block">Notes / Reference</label>
                <input
                  type="text"
                  placeholder="e.g. 7 days replacement warranty, Trx details"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white"
                />
              </div>
            </div>

            {/* Summary Totals */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2.5">
              <div className="flex justify-between text-xs text-slate-600">
                <span>Subtotal:</span>
                <span className="font-mono font-semibold">{formatBDT(subtotal)}</span>
              </div>
              <div className="flex justify-between items-center text-xs text-slate-600">
                <span>Additional Discount (৳):</span>
                <input
                  type="number"
                  value={overallDiscount || ''}
                  onChange={(e) => setOverallDiscount(Number(e.target.value))}
                  placeholder="0"
                  className="w-24 text-xs font-mono p-1 border border-slate-300 rounded text-right"
                />
              </div>
              <div className="border-t border-slate-200 pt-2 flex justify-between text-sm font-bold text-slate-900">
                <span>Grand Total:</span>
                <span className="font-mono text-base text-emerald-800">{formatBDT(grandTotal)}</span>
              </div>
              <div className="flex justify-between text-xs text-emerald-700 font-medium">
                <span>Paid Amount:</span>
                <span className="font-mono font-bold">{formatBDT(totalPaid)}</span>
              </div>
              <div className="flex justify-between text-xs pt-1 border-t border-slate-100">
                <span className="font-bold text-slate-700">Remaining Due:</span>
                <span className={`font-mono font-bold ${dueAmount > 0 ? 'text-rose-600 text-sm' : 'text-slate-400'}`}>
                  {formatBDT(dueAmount)}
                </span>
              </div>

              {/* Credit Limit Alert if Exceeded */}
              {isCreditExceeded && (
                <div className="mt-3 p-2.5 rounded-lg bg-rose-50 border border-rose-300 text-rose-800 text-xs space-y-1.5">
                  <div className="flex items-center gap-1.5 font-bold">
                    <ShieldAlert className="w-4 h-4 text-rose-600" />
                    <span>Credit Limit Exceeded!</span>
                  </div>
                  <p className="text-[11px]">
                    Limit: {formatBDT(customerCreditLimit)}, Current Due: {formatBDT(customerCurrentDue)}, New Due: {formatBDT(projectedDue)}
                  </p>
                  <label className="flex items-center gap-2 pt-1 font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={creditLimitApproved}
                      onChange={(e) => setCreditLimitApproved(e.target.checked)}
                      className="rounded text-emerald-600"
                    />
                    <span>Authorized Manager Override</span>
                  </label>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-500 font-medium">
            <span>Branch: {branches.find(b => b.id === branchId)?.name}</span>
          </div>
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
              onClick={handleCompleteSale}
              className="px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 rounded-xl transition shadow-md flex items-center gap-1.5"
            >
              <span>{language === 'bn' ? 'চালান তৈরি করুন ও প্রিন্ট' : 'Complete Sale & Invoice'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
