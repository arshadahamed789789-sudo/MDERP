import React, { useState } from 'react';
import { 
  Building, Search, Plus, Filter, Wallet, ArrowUpRight, 
  FileText, Check, X, Phone, Landmark, Pencil, Trash2, AlertCircle
} from 'lucide-react';
import { useERP } from '../../services/erpStore';
import { formatBDT, formatDate } from '../../utils/formatters';
import { Supplier } from '../../types/erp';
import { EditSupplierModal } from './EditSupplierModal';
import { ShareExportButtons } from '../common/ShareExportButtons';

interface SupplierManagerProps {
  initialSupplierId?: string;
}

export const SupplierManager: React.FC<SupplierManagerProps> = ({ initialSupplierId }) => {
  const { 
    businessConfig, suppliers, supplierLedgers, paySupplier, addSupplier, deleteSupplier,
    cashAccounts, bankAccounts, language 
  } = useERP();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSupplierId, setSelectedSupplierId] = useState<string | null>(initialSupplierId || suppliers[0]?.id || null);
  const [deleteSupplierTarget, setDeleteSupplierTarget] = useState<{ id: string; name: string; payable: number; error?: string } | null>(null);

  React.useEffect(() => {
    if (initialSupplierId) {
      setSelectedSupplierId(initialSupplierId);
    }
  }, [initialSupplierId]);

  // Pay Supplier Modal
  const [showPayModal, setShowPayModal] = useState(false);
  const [paySupId, setPaySupId] = useState('');
  const [payAmount, setPayAmount] = useState(0);
  const [payMethod, setPayMethod] = useState('Bank');
  const [payAccountId, setPayAccountId] = useState(bankAccounts[0]?.id || '');
  const [payTrxId, setPayTrxId] = useState('');
  const [payNotes, setPayNotes] = useState('');

  // Add Supplier Modal
  const [showAddSupplierModal, setShowAddSupplierModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCompany, setNewCompany] = useState('');
  const [newContactPerson, setNewContactPerson] = useState('');
  const [newMobile, setNewMobile] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newBankInfo, setNewBankInfo] = useState('');
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  const filteredSuppliers = suppliers.filter(s => {
    const q = searchTerm.toLowerCase();
    return s.name.toLowerCase().includes(q) || s.company.toLowerCase().includes(q) || s.mobile.includes(q);
  });

  const selectedSupplier = suppliers.find(s => s.id === selectedSupplierId);
  const activeLedger = supplierLedgers.filter(l => l.supplierId === selectedSupplierId);

  const totalPayables = suppliers.reduce((acc, s) => acc + s.currentPayable, 0);

  const handleOpenPay = (sup: Supplier) => {
    setPaySupId(sup.id);
    setPayAmount(sup.currentPayable);
    setShowPayModal(true);
  };

  const handleExecutePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paySupId || payAmount <= 0) return;

    paySupplier({
      supplierId: paySupId,
      amount: payAmount,
      accountId: payAccountId,
      method: payMethod,
      trxId: payTrxId,
      notes: payNotes
    });

    setShowPayModal(false);
    setPayAmount(0);
    setPayTrxId('');
    setPayNotes('');
  };

  const handleCreateSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newMobile.trim()) return;

    const created = addSupplier({
      name: newName,
      company: newCompany || newName,
      contactPerson: newContactPerson || newName,
      mobile: newMobile,
      address: newAddress || 'Dhaka',
      bankInfo: newBankInfo,
      status: 'ACTIVE'
    });

    setSelectedSupplierId(created.id);
    setShowAddSupplierModal(false);
    setNewName('');
    setNewCompany('');
    setNewMobile('');
  };

  const handleConfirmDeleteSupplier = () => {
    if (!deleteSupplierTarget) return;
    const res = deleteSupplier(deleteSupplierTarget.id);
    if (!res.success) {
      setDeleteSupplierTarget(prev => prev ? { ...prev, error: res.error } : null);
      return;
    }
    const rem = suppliers.filter(s => s.id !== deleteSupplierTarget.id);
    if (rem.length > 0) setSelectedSupplierId(rem[0].id);
    else setSelectedSupplierId(null);
    setDeleteSupplierTarget(null);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            {language === 'bn' ? 'মহাজন / সাপ্লায়ার ও পাওনা খাতা' : 'Suppliers & Accounts Payable'}
          </h1>
          <p className="text-xs text-slate-500">
            {language === 'bn' 
              ? 'মোবাইল ফোন আমদানিকারক ও পরিবেশক লেজার এবং দেনা পরিশোধ' 
              : 'Distributor payable tracking, purchasing records, and supplier ledger reconciliation.'}
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          <ShareExportButtons
            title={language === 'bn' ? 'মহাজন ও সাপ্লায়ার দেনা রিপোর্ট' : 'Suppliers & Accounts Payable Statement'}
            subtitle={`Total Suppliers: ${suppliers.length}`}
            summaryMetrics={[
              { label: 'Total Payable (দেনা)', value: formatBDT(totalPayables) },
              { label: 'Registered Distributors', value: `${suppliers.length}` },
              { label: 'Total Procured', value: formatBDT(suppliers.reduce((acc, s) => acc + s.totalPurchased, 0)) }
            ]}
            shareText={`🏛️ *${language === 'bn' ? 'মহাজন ও সাপ্লায়ার দেনা খতিয়ান' : 'Suppliers Accounts Payable'}*\n🏢 শোরুম: *${businessConfig?.name || 'DEALERFLOW ERP'}*\n📅 ${language === 'bn' ? 'তারিখ' : 'Date'}: ${new Date().toLocaleDateString('en-US', { dateStyle: 'medium' })}\n\n💰 *দেনা ও ক্রয় হিসাব:*\n• মোট সাপ্লায়ার/মহাজন: ${suppliers.length} টি প্রতিষ্ঠান\n• বকেয়া দেনা সহ মহাজন: ${suppliers.filter(s => s.currentPayable > 0).length} টি\n• *সর্বমোট বকেয়া দেনা: ${formatBDT(totalPayables)}*\n\nGenerated via DEALERFLOW Hub.`}
            csvData={{
              filename: 'suppliers_payable_list',
              headers: ['Supplier Company', 'Contact Person', 'Mobile', 'Address', 'Bank Account Info', 'Total Purchases (BDT)', 'Total Paid (BDT)', 'Current Payable Due (BDT)'],
              rows: filteredSuppliers.map(s => [
                s.company, s.contactPerson, s.mobile, s.address,
                s.bankInfo || '', s.totalPurchased, s.totalPaid, s.currentPayable
              ])
            }}
          />
          <button
            onClick={() => setShowAddSupplierModal(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{language === 'bn' ? '+ নতুন সাপ্লায়ার' : '+ Add Supplier / Importer'}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <p className="text-xs font-semibold text-amber-600 uppercase">Total Accounts Payable (মহাজন পাওনা)</p>
          <p className="text-xl font-black text-amber-600 font-mono mt-1">{formatBDT(totalPayables)}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Liabilities owed to distributors</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <p className="text-xs font-semibold text-slate-500 uppercase">Registered Importers / Dist.</p>
          <p className="text-xl font-black text-slate-900 font-mono mt-1">{suppliers.length} Companies</p>
          <p className="text-[11px] text-slate-400 mt-0.5">National Samsung, Apple, Xiaomi partners</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <p className="text-xs font-semibold text-emerald-600 uppercase">Total Stock Purchased</p>
          <p className="text-xl font-black text-emerald-700 font-mono mt-1">
            {formatBDT(suppliers.reduce((acc, s) => acc + s.totalPurchased, 0))}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">Cumulative procurement value</p>
        </div>
      </div>

      {/* Main Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: List of Suppliers */}
        <div className="space-y-3">
          <div className="bg-white p-3 rounded-xl border border-slate-200">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search supplier, company, phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full text-xs pl-9 pr-3 py-2 border border-slate-200 rounded-lg bg-slate-50"
              />
            </div>
          </div>

          <div className="space-y-2 max-h-[65vh] overflow-y-auto pr-1">
            {filteredSuppliers.map(s => {
              const isSelected = selectedSupplierId === s.id;
              return (
                <div
                  key={s.id}
                  onClick={() => setSelectedSupplierId(s.id)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition ${
                    isSelected 
                      ? 'bg-white border-blue-500 shadow-md ring-1 ring-blue-500' 
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-xs text-slate-900">{s.name}</h4>
                      <p className="text-[11px] text-slate-500">{s.company}</p>
                      <p className="text-[11px] text-slate-500 font-mono mt-0.5">{s.mobile}</p>
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase">Total Payable</span>
                      <span className={`font-mono font-bold ${s.currentPayable > 0 ? 'text-amber-600' : 'text-slate-700'}`}>
                        {formatBDT(s.currentPayable)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {s.currentPayable > 0 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenPay(s);
                          }}
                          className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded font-bold text-[11px] transition shadow-2xs"
                        >
                          Pay Supplier
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingSupplier(s);
                        }}
                        className="p-1 hover:bg-slate-100 text-slate-400 hover:text-blue-700 rounded transition"
                        title="Edit Supplier"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteSupplierTarget({ id: s.id, name: s.name, payable: s.currentPayable });
                        }}
                        className="p-1 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded transition"
                        title="Delete Supplier"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 2 Columns: Supplier Ledger */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-xs p-5 flex flex-col justify-between">
          {!selectedSupplier ? (
            <div className="py-20 text-center text-slate-400">
              <Building className="w-12 h-12 mx-auto mb-2 text-slate-300 stroke-1" />
              <p className="text-sm font-semibold">Select a supplier to view their statement.</p>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Profile Card */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-base text-slate-900">{selectedSupplier.name}</h3>
                    <button
                      type="button"
                      onClick={() => setEditingSupplier(selectedSupplier)}
                      className="px-2 py-0.5 bg-white hover:bg-slate-200 text-slate-700 border border-slate-300 rounded text-[11px] font-semibold transition flex items-center gap-1 shadow-2xs"
                      title="Edit Supplier Profile"
                    >
                      <Pencil className="w-3 h-3 text-blue-600" />
                      <span>{language === 'bn' ? 'এডিট' : 'Edit'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteSupplierTarget({
                        id: selectedSupplier.id,
                        name: selectedSupplier.name,
                        payable: selectedSupplier.currentPayable
                      })}
                      className="px-2 py-0.5 bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 rounded text-[11px] font-semibold transition flex items-center gap-1 shadow-2xs"
                      title="Delete Supplier"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>{language === 'bn' ? 'ডিলিট' : 'Delete'}</span>
                    </button>
                  </div>
                  <p className="text-xs text-slate-600 font-medium">{selectedSupplier.company}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Contact: {selectedSupplier.contactPerson} ({selectedSupplier.mobile}) • {selectedSupplier.address}
                  </p>
                  {selectedSupplier.bankInfo && (
                    <p className="text-[11px] text-blue-700 font-mono mt-1">
                      Bank A/C: {selectedSupplier.bankInfo}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2.5 flex-wrap">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Current Payable (দেনা)</span>
                    <span className={`text-xl font-black font-mono ${selectedSupplier.currentPayable > 0 ? 'text-amber-600' : 'text-slate-800'}`}>
                      {formatBDT(selectedSupplier.currentPayable)}
                    </span>
                  </div>
                  <ShareExportButtons
                    compact
                    title={`${selectedSupplier.company} - ${language === 'bn' ? 'মহাজন খতিয়ান স্টেটমেন্ট' : 'Supplier Ledger Statement'}`}
                    subtitle={`Contact: ${selectedSupplier.contactPerson} • ${selectedSupplier.mobile}`}
                    summaryMetrics={[
                      { label: 'Current Payable', value: formatBDT(selectedSupplier.currentPayable) },
                      { label: 'Total Procured', value: formatBDT(selectedSupplier.totalPurchased) },
                      { label: 'Total Paid', value: formatBDT(selectedSupplier.totalPaid) }
                    ]}
                    shareText={`📜 *${language === 'bn' ? 'মহাজন ও সাপ্লায়ার খতিয়ান হিসাব স্টেটমেন্ট' : 'Supplier Account Statement'}*\n🏢 *${selectedSupplier.company}* (Contact: ${selectedSupplier.contactPerson})\n📱 মোবাইল: ${selectedSupplier.mobile}\n🏛️ শোরুম: *${businessConfig?.name || 'DEALERFLOW ERP'}*\n📅 ${language === 'bn' ? 'তারিখ' : 'Date'}: ${new Date().toLocaleDateString('en-US', { dateStyle: 'medium' })}\n\n💰 *হিসাব বিবরণ:*\n• সর্বমোট ক্রয় চালান: ${formatBDT(selectedSupplier.totalPurchased)}\n• পরিশোধিত নগদ/ব্যাংক: ${formatBDT(selectedSupplier.totalPaid)}\n• *বর্তমান বকেয়া পাওনা: ${formatBDT(selectedSupplier.currentPayable)}*\n\nGenerated via DEALERFLOW Hub.`}
                    csvData={{
                      filename: `supplier_ledger_${selectedSupplier.company.replace(/\s+/g, '_')}`,
                      headers: ['Date', 'Reference / Bill', 'Transaction Details', 'Debit / Paid (-)', 'Credit / Bill (+)', 'Payable Balance'],
                      rows: activeLedger.map(l => [
                        l.date, l.referenceNo, l.description, l.debit, l.credit, l.balance
                      ])
                    }}
                  />
                  {selectedSupplier.currentPayable > 0 && (
                    <button
                      onClick={() => handleOpenPay(selectedSupplier)}
                      className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
                    >
                      {language === 'bn' ? 'টাকা পরিশোধ' : 'Make Payment'}
                    </button>
                  )}
                </div>
              </div>

              {/* Ledger Statement Table */}
              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span>Supplier Purchase & Payment Ledger (মহাজন খতিয়ান)</span>
                </h4>

                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider">
                      <tr>
                        <th className="py-2.5 px-3">Date</th>
                        <th className="py-2.5 px-3">Reference / Bill</th>
                        <th className="py-2.5 px-3">Transaction Details</th>
                        <th className="py-2.5 px-3 text-right">Debit / Paid (-)</th>
                        <th className="py-2.5 px-3 text-right">Credit / Bill (+)</th>
                        <th className="py-2.5 px-3 text-right">Payable Balance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                      {activeLedger.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-slate-400">
                            No ledger entries for this supplier.
                          </td>
                        </tr>
                      ) : (
                        activeLedger.map(entry => (
                          <tr key={entry.id} className="hover:bg-slate-50/70">
                            <td className="py-2.5 px-3 text-slate-500 whitespace-nowrap">
                              {formatDate(entry.date)}
                            </td>
                            <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                              {entry.referenceNo}
                            </td>
                            <td className="py-2.5 px-3 text-slate-600 max-w-xs">
                              {entry.description}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono text-emerald-700 font-semibold">
                              {entry.debit > 0 ? formatBDT(entry.debit) : '-'}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono text-slate-900 font-semibold">
                              {entry.credit > 0 ? formatBDT(entry.credit) : '-'}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono font-bold text-amber-600">
                              {formatBDT(entry.balance)}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Pay Supplier Modal */}
      {showPayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md border border-slate-200 overflow-hidden">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <h2 className="text-sm font-bold flex items-center gap-2">
                <Landmark className="w-4 h-4 text-amber-400" />
                <span>Supplier Payment (মহাজন বিল পরিশোধ)</span>
              </h2>
              <button onClick={() => setShowPayModal(false)}>
                <X className="w-5 h-5 text-slate-400 hover:text-white" />
              </button>
            </div>
            <form onSubmit={handleExecutePayment} className="p-5 space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 mb-1 block">Supplier / Importer</label>
                <input
                  type="text"
                  disabled
                  value={suppliers.find(s => s.id === paySupId)?.name || ''}
                  className="w-full p-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-700 font-bold"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 mb-1 block">Payment Amount (৳)</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={payAmount || ''}
                  onChange={(e) => setPayAmount(Number(e.target.value))}
                  className="w-full p-2 font-mono font-bold text-base border border-slate-300 rounded-lg text-amber-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 mb-1 block">Payment Method</label>
                  <select
                    value={payMethod}
                    onChange={(e) => setPayMethod(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  >
                    <option value="Bank">Bank Transfer</option>
                    <option value="Cash">Cash Drawer</option>
                    <option value="Cheque">Cheque</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 mb-1 block">Deduct From Account</label>
                  <select
                    value={payAccountId}
                    onChange={(e) => setPayAccountId(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg truncate"
                  >
                    <optgroup label="Bank Accounts">
                      {bankAccounts.map(ba => (
                        <option key={ba.id} value={ba.id}>{ba.bankName}</option>
                      ))}
                    </optgroup>
                    <optgroup label="Cash Counters">
                      {cashAccounts.map(ca => (
                        <option key={ca.id} value={ca.id}>{ca.name}</option>
                      ))}
                    </optgroup>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 mb-1 block">Bank Trx # / Cheque No</label>
                <input
                  type="text"
                  placeholder="e.g. IBBL-FT-99210 or Cheque #8812"
                  value={payTrxId}
                  onChange={(e) => setPayTrxId(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowPayModal(false)}
                  className="px-4 py-2 border rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold"
                >
                  Confirm Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Supplier Modal */}
      {showAddSupplierModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md border border-slate-200 overflow-hidden">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <h2 className="text-sm font-bold">Add Supplier / National Distributor</h2>
              <button onClick={() => setShowAddSupplierModal(false)}>
                <X className="w-5 h-5 text-slate-400 hover:text-white" />
              </button>
            </div>
            <form onSubmit={handleCreateSupplier} className="p-5 space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 mb-1 block">Supplier Company Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Excel Telecom Ltd"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 mb-1 block">Contact Person</label>
                  <input
                    type="text"
                    placeholder="e.g. Asif Iqbal"
                    value={newContactPerson}
                    onChange={(e) => setNewContactPerson(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 mb-1 block">Mobile Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="017xxxxxxxx"
                    value={newMobile}
                    onChange={(e) => setNewMobile(e.target.value)}
                    className="w-full p-2 font-mono border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 mb-1 block">Bank Account Details</label>
                <input
                  type="text"
                  placeholder="e.g. Islami Bank Gulshan Br, A/C: 2050..."
                  value={newBankInfo}
                  onChange={(e) => setNewBankInfo(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 mb-1 block">Office Address</label>
                <input
                  type="text"
                  placeholder="e.g. Gulshan 1, Dhaka"
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddSupplierModal(false)}
                  className="px-4 py-2 border rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold"
                >
                  Save Supplier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Supplier Modal */}
      <EditSupplierModal
        isOpen={!!editingSupplier}
        supplier={editingSupplier}
        onClose={() => setEditingSupplier(null)}
        onDeleteSuccess={() => {
          const rem = suppliers.filter(s => s.id !== editingSupplier?.id);
          if (rem.length > 0) setSelectedSupplierId(rem[0].id);
        }}
      />

      {/* Delete Supplier Confirmation Modal */}
      {deleteSupplierTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in-50">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
            <div className="px-5 py-4 bg-rose-600 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Trash2 className="w-4 h-4 text-white" />
                <span>{language === 'bn' ? 'সাপ্লায়ার / মহাজন ডিলিট' : 'Delete Supplier Account'}</span>
              </h3>
              <button type="button" onClick={() => setDeleteSupplierTarget(null)}>
                <X className="w-4 h-4 text-rose-200 hover:text-white" />
              </button>
            </div>

            <div className="p-5 space-y-3.5 text-xs">
              {deleteSupplierTarget.error && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span className="font-medium">{deleteSupplierTarget.error}</span>
                </div>
              )}

              <p className="text-slate-700 leading-relaxed">
                {language === 'bn' ? (
                  <>
                    আপনি কি নিশ্চিত যে সাপ্লায়ার <strong className="text-slate-900 font-bold">"{deleteSupplierTarget.name}"</strong> মুছে ফেলতে চান?
                  </>
                ) : (
                  <>
                    Are you sure you want to permanently delete supplier <strong className="text-slate-900 font-bold">"{deleteSupplierTarget.name}"</strong>?
                  </>
                )}
              </p>

              {deleteSupplierTarget.payable > 0 && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-[11px] font-medium">
                  {language === 'bn'
                    ? `সতর্কতা: এই মহাজনের কাছে আপনার ${formatBDT(deleteSupplierTarget.payable)} দেনা রয়েছে! দেনা পরিশোধ না করা পর্যন্ত ডিলিট করা যাবে না।`
                    : `Warning: You have an outstanding payable liability of ${formatBDT(deleteSupplierTarget.payable)} to this supplier. Settle before deleting.`}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setDeleteSupplierTarget(null)}
                  className="px-4 py-2 border rounded-lg text-slate-600 hover:bg-slate-50 font-medium"
                >
                  {language === 'bn' ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="button"
                  disabled={deleteSupplierTarget.payable > 0}
                  onClick={handleConfirmDeleteSupplier}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold shadow-xs flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{language === 'bn' ? 'মুছে ফেলুন' : 'Delete'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
