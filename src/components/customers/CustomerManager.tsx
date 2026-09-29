import React, { useState } from 'react';
import { 
  Users, Search, Plus, Filter, Wallet, ArrowDownRight, 
  FileText, ShieldAlert, Check, X, Phone, MapPin, Building, Clock, MessageSquare, Download, Pencil
} from 'lucide-react';
import { useERP } from '../../services/erpStore';
import { formatBDT, formatDate } from '../../utils/formatters';
import { Customer, CustomerType, PriceLevel } from '../../types/erp';
import { AgingDueDashboard } from './AgingDueDashboard';
import { DueReminderModal } from './DueReminderModal';
import { EditCustomerModal } from './EditCustomerModal';
import { exportToCSV } from '../../utils/exportToCsv';

interface CustomerManagerProps {
  onOpenReceiveDue?: (customerId: string) => void;
}

export const CustomerManager: React.FC<CustomerManagerProps> = ({
  onOpenReceiveDue
}) => {
  const { 
    customers, customerLedgers, receiveCustomerPayment, 
    addCustomer, cashAccounts, bankAccounts, language 
  } = useERP();

  const [viewTab, setViewTab] = useState<'ledger' | 'aging'>('ledger');
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(customers[0]?.id || null);

  // Receive Payment Modal
  const [showPayModal, setShowPayModal] = useState(false);
  const [payCustId, setPayCustId] = useState('');
  const [payAmount, setPayAmount] = useState(0);
  const [payMethod, setPayMethod] = useState('Cash');
  const [payAccountId, setPayAccountId] = useState(cashAccounts[0]?.id || '');
  const [payTrxId, setPayTrxId] = useState('');
  const [payNotes, setPayNotes] = useState('');

  // Add Customer Modal
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newBizName, setNewBizName] = useState('');
  const [newMobile, setNewMobile] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newType, setNewType] = useState<CustomerType>('Wholesale Dealer');
  const [newPriceLevel, setNewPriceLevel] = useState<PriceLevel>('dealer');
  const [newCreditLimit, setNewCreditLimit] = useState(200000);

  // Due Reminder Modal
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [reminderCustomer, setReminderCustomer] = useState<Customer | null>(null);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  const filteredCustomers = customers.filter(c => {
    const q = searchTerm.toLowerCase();
    const matchSearch = 
      c.name.toLowerCase().includes(q) ||
      c.mobile.includes(q) ||
      (c.businessName && c.businessName.toLowerCase().includes(q));
    const matchType = typeFilter === 'ALL' || c.customerType === typeFilter;
    return matchSearch && matchType;
  });

  const selectedCustomer = customers.find(c => c.id === selectedCustomerId);
  const activeLedger = customerLedgers.filter(l => l.customerId === selectedCustomerId);

  // Totals
  const totalDueReceivables = customers.reduce((acc, c) => acc + c.currentDue, 0);
  const totalCustomersCount = customers.length;
  const dealersCount = customers.filter(c => c.customerType.includes('Dealer')).length;

  const handleOpenPayment = (cust: Customer) => {
    setPayCustId(cust.id);
    setPayAmount(cust.currentDue);
    setShowPayModal(true);
  };

  const handleExecutePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payCustId || payAmount <= 0) return;

    receiveCustomerPayment({
      customerId: payCustId,
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

  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newMobile.trim()) return;

    const created = addCustomer({
      name: newName,
      businessName: newBizName || undefined,
      mobile: newMobile,
      address: newAddress || 'Dhaka, Bangladesh',
      customerType: newType,
      priceLevel: newPriceLevel,
      creditLimit: newCreditLimit,
      status: 'ACTIVE'
    });

    setSelectedCustomerId(created.id);
    setShowAddCustomerModal(false);
    setNewName('');
    setNewBizName('');
    setNewMobile('');
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            {language === 'bn' ? 'কাস্টমার, ডিলার ও বাকি খাতা' : 'Customers, Dealers & Due Ledger'}
          </h1>
          <p className="text-xs text-slate-500">
            {language === 'bn' 
              ? 'ডিলার ক্রেডিট লিমিট, সম্পূর্ণ লেজার খাতা ও বাকি টাকা আদায়ের ব্যবস্থাপনা' 
              : 'Wholesale dealer credit management, individual customer ledgers, and due collection.'}
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => {
              const headers = ['Party Name', 'Business / Shop', 'Mobile', 'Category', 'Price Level', 'Credit Limit (BDT)', 'Current Due (BDT)', 'Total Purchases (BDT)', 'Total Paid (BDT)', 'Address'];
              const rows = filteredCustomers.map(c => [
                c.name,
                c.businessName || '',
                c.mobile,
                c.customerType,
                c.priceLevel,
                c.creditLimit,
                c.currentDue,
                c.totalPurchased,
                c.totalPaid,
                c.address || ''
              ]);
              exportToCSV('customers_and_dealers_due_list', headers, rows);
            }}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 border border-slate-300 shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? 'এক্সপোর্ট CSV' : 'Export Due List'}</span>
          </button>
          <button
            onClick={() => setShowAddCustomerModal(true)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>{language === 'bn' ? '+ নতুন কাস্টমার/ডিলার' : '+ Add Customer / Dealer'}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <p className="text-xs font-semibold text-rose-600 uppercase">Total Accounts Receivable (বাকি)</p>
          <p className="text-xl font-black text-rose-600 font-mono mt-1">{formatBDT(totalDueReceivables)}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {customers.filter(c => c.currentDue > 0).length} parties have overdue balance
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <p className="text-xs font-semibold text-slate-500 uppercase">Wholesale Dealers</p>
          <p className="text-xl font-black text-slate-900 font-mono mt-1">{dealersCount} Dealers</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Assigned credit limits and wholesale pricing</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <p className="text-xs font-semibold text-emerald-600 uppercase">Total Registered Parties</p>
          <p className="text-xl font-black text-emerald-700 font-mono mt-1">{totalCustomersCount}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Retail, Wholesale, Sub-dealer & VIP</p>
        </div>
      </div>

      {/* Navigation Subtabs */}
      <div className="flex border-b border-slate-200 gap-4 text-xs font-bold">
        <button
          onClick={() => setViewTab('ledger')}
          className={`pb-2.5 transition border-b-2 flex items-center gap-1.5 ${
            viewTab === 'ledger' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Customer Profiles & Detailed Ledgers</span>
        </button>
        <button
          onClick={() => setViewTab('aging')}
          className={`pb-2.5 transition border-b-2 flex items-center gap-1.5 ${
            viewTab === 'aging' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Due Aging Dashboard & SMS Reminders</span>
        </button>
      </div>

      {viewTab === 'ledger' ? (
        /* Main 2-Column Split: Customer List & Customer Ledger Statement */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: List of Customers */}
        <div className="space-y-3">
          <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search name, phone, shop..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full text-xs pl-9 pr-3 py-2 border border-slate-200 rounded-lg bg-slate-50"
              />
            </div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full text-xs font-medium p-2 border border-slate-200 rounded-lg bg-slate-50"
            >
              <option value="ALL">All Categories</option>
              <option value="Wholesale Dealer">Wholesale Dealers</option>
              <option value="Sub Dealer">Sub Dealers</option>
              <option value="Retail Customer">Retail Customers</option>
              <option value="VIP Customer">VIP Customers</option>
            </select>
          </div>

          <div className="space-y-2 max-h-[65vh] overflow-y-auto pr-1">
            {filteredCustomers.map(c => {
              const isSelected = selectedCustomerId === c.id;
              return (
                <div
                  key={c.id}
                  onClick={() => setSelectedCustomerId(c.id)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition ${
                    isSelected 
                      ? 'bg-white border-emerald-500 shadow-md ring-1 ring-emerald-500' 
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-xs text-slate-900">
                        {c.businessName || c.name}
                      </h4>
                      {c.businessName && <p className="text-[11px] text-slate-500">{c.name}</p>}
                      <p className="text-[11px] text-slate-500 font-mono mt-0.5">{c.mobile}</p>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-slate-100 text-slate-700">
                      {c.priceLevel}
                    </span>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase">Current Due</span>
                      <span className={`font-mono font-bold ${c.currentDue > 0 ? 'text-rose-600' : 'text-slate-700'}`}>
                        {formatBDT(c.currentDue)}
                      </span>
                    </div>
                    {c.currentDue > 0 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenPayment(c);
                        }}
                        className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded font-bold text-[11px] transition"
                      >
                        Receive Due
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 2 Columns: Detailed Customer Ledger Statement */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-xs p-5 flex flex-col justify-between">
          {!selectedCustomer ? (
            <div className="py-20 text-center text-slate-400">
              <Users className="w-12 h-12 mx-auto mb-2 text-slate-300 stroke-1" />
              <p className="text-sm font-semibold">Select a customer to view their complete ledger statement.</p>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Profile Card Header */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-base text-slate-900">
                      {selectedCustomer.businessName || selectedCustomer.name}
                    </h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 uppercase">
                      {selectedCustomer.customerType}
                    </span>
                    <button
                      type="button"
                      onClick={() => setEditingCustomer(selectedCustomer)}
                      className="px-2 py-0.5 bg-white hover:bg-slate-200 text-slate-700 border border-slate-300 rounded text-[11px] font-semibold transition flex items-center gap-1 shadow-2xs"
                      title="Edit Customer Profile"
                    >
                      <Pencil className="w-3 h-3 text-emerald-600" />
                      <span>{language === 'bn' ? 'এডিট' : 'Edit'}</span>
                    </button>
                  </div>
                  {selectedCustomer.businessName && (
                    <p className="text-xs text-slate-600 font-medium">Proprietor: {selectedCustomer.name}</p>
                  )}
                  <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                    <span>Phone: <strong>{selectedCustomer.mobile}</strong></span>
                    <span>• Address: {selectedCustomer.address}</span>
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Current Due (পাওনা)</span>
                    <span className={`text-xl font-black font-mono ${selectedCustomer.currentDue > 0 ? 'text-rose-600' : 'text-slate-800'}`}>
                      {formatBDT(selectedCustomer.currentDue)}
                    </span>
                  </div>
                  {selectedCustomer.currentDue > 0 && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setReminderCustomer(selectedCustomer);
                          setShowReminderModal(true);
                        }}
                        className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-1.5"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{language === 'bn' ? 'তাগাদা SMS/WhatsApp' : 'Send Reminder'}</span>
                      </button>
                      <button
                        onClick={() => handleOpenPayment(selectedCustomer)}
                        className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
                      >
                        Receive Payment
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Credit Limit Exposure Bar */}
              {selectedCustomer.creditLimit > 0 && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                  <div className="flex justify-between font-semibold mb-1">
                    <span>Credit Limit: {formatBDT(selectedCustomer.creditLimit)}</span>
                    <span className="text-slate-600">
                      Available Credit: {formatBDT(Math.max(0, selectedCustomer.creditLimit - selectedCustomer.currentDue))}
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${
                        (selectedCustomer.currentDue / selectedCustomer.creditLimit) > 0.8 ? 'bg-rose-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, Math.round((selectedCustomer.currentDue / selectedCustomer.creditLimit) * 100))}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Ledger Statement Table */}
              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-emerald-600" />
                  <span>Official Customer Ledger (খতিয়ান বই)</span>
                </h4>

                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider">
                      <tr>
                        <th className="py-2.5 px-3">Date</th>
                        <th className="py-2.5 px-3">Reference / Bill</th>
                        <th className="py-2.5 px-3">Transaction Details</th>
                        <th className="py-2.5 px-3 text-right">Debit (+)</th>
                        <th className="py-2.5 px-3 text-right">Credit (-)</th>
                        <th className="py-2.5 px-3 text-right">Balance Due</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                      {activeLedger.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-slate-400">
                            No transactions recorded in ledger for this customer.
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
                            <td className="py-2.5 px-3 text-right font-mono text-slate-900 font-semibold">
                              {entry.debit > 0 ? formatBDT(entry.debit) : '-'}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono text-emerald-700 font-semibold">
                              {entry.credit > 0 ? formatBDT(entry.credit) : '-'}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono font-bold text-rose-600">
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
      ) : (
        <AgingDueDashboard onCollectDue={handleOpenPayment} />
      )}

      {/* Receive Due Payment Modal */}
      {showPayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md border border-slate-200 overflow-hidden">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <h2 className="text-sm font-bold flex items-center gap-2">
                <Wallet className="w-4 h-4 text-emerald-400" />
                <span>Receive Customer Payment (বাকি আদায়)</span>
              </h2>
              <button onClick={() => setShowPayModal(false)}>
                <X className="w-5 h-5 text-slate-400 hover:text-white" />
              </button>
            </div>
            <form onSubmit={handleExecutePayment} className="p-5 space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 mb-1 block">Customer / Party</label>
                <input
                  type="text"
                  disabled
                  value={customers.find(c => c.id === payCustId)?.name || ''}
                  className="w-full p-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-700 font-bold"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 mb-1 block">Collected Amount (৳)</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={payAmount || ''}
                  onChange={(e) => setPayAmount(Number(e.target.value))}
                  className="w-full p-2 font-mono font-bold text-base border border-slate-300 rounded-lg text-emerald-700"
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
                    <option value="Cash">Cash (Counter)</option>
                    <option value="Bank">Bank Deposit</option>
                    <option value="bKash">bKash</option>
                    <option value="Nagad">Nagad</option>
                    <option value="Rocket">Rocket</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 mb-1 block">Receiving Account</label>
                  <select
                    value={payAccountId}
                    onChange={(e) => setPayAccountId(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg truncate"
                  >
                    <optgroup label="Cash Drawers">
                      {cashAccounts.map(ca => (
                        <option key={ca.id} value={ca.id}>{ca.name}</option>
                      ))}
                    </optgroup>
                    <optgroup label="Bank / MFS">
                      {bankAccounts.map(ba => (
                        <option key={ba.id} value={ba.id}>{ba.bankName}</option>
                      ))}
                    </optgroup>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 mb-1 block">TrxID / Reference (optional)</label>
                <input
                  type="text"
                  placeholder="e.g. BKS-991208 or Cheque #12948"
                  value={payTrxId}
                  onChange={(e) => setPayTrxId(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 mb-1 block">Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Weekly settlement from Motijheel shop"
                  value={payNotes}
                  onChange={(e) => setPayNotes(e.target.value)}
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
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold"
                >
                  Confirm Collection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Customer Modal */}
      {showAddCustomerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md border border-slate-200 overflow-hidden">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <h2 className="text-sm font-bold">Add New Customer or Wholesale Dealer</h2>
              <button onClick={() => setShowAddCustomerModal(false)}>
                <X className="w-5 h-5 text-slate-400 hover:text-white" />
              </button>
            </div>
            <form onSubmit={handleCreateCustomer} className="p-5 space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 mb-1 block">Contact Person Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Md. Shahidul Islam"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 mb-1 block">Business / Shop Name (for Dealers)</label>
                <input
                  type="text"
                  placeholder="e.g. Shahidul Telecom, Motijheel"
                  value={newBizName}
                  onChange={(e) => setNewBizName(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
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
                <div>
                  <label className="font-semibold text-slate-700 mb-1 block">Customer Type</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as CustomerType)}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  >
                    <option value="Wholesale Dealer">Wholesale Dealer</option>
                    <option value="Sub Dealer">Sub Dealer</option>
                    <option value="Retail Customer">Retail Customer</option>
                    <option value="VIP Customer">VIP Customer</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 mb-1 block">Price Level</label>
                  <select
                    value={newPriceLevel}
                    onChange={(e) => setNewPriceLevel(e.target.value as PriceLevel)}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  >
                    <option value="dealer">Dealer Price</option>
                    <option value="wholesale">Wholesale Price</option>
                    <option value="retail">Retail Price</option>
                    <option value="special">Special Price</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 mb-1 block">Credit Limit (৳)</label>
                  <input
                    type="number"
                    value={newCreditLimit || ''}
                    onChange={(e) => setNewCreditLimit(Number(e.target.value))}
                    className="w-full p-2 font-mono border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 mb-1 block">Shop Address</label>
                <input
                  type="text"
                  placeholder="e.g. Shop 14, Level 2, Bashundhara City"
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddCustomerModal(false)}
                  className="px-4 py-2 border rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold"
                >
                  Save Party
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Due Collection Reminder SMS / WhatsApp Modal */}
      <DueReminderModal
        isOpen={showReminderModal}
        onClose={() => setShowReminderModal(false)}
        customer={reminderCustomer}
      />

      {/* Edit Customer Profile Modal */}
      <EditCustomerModal
        isOpen={!!editingCustomer}
        customer={editingCustomer}
        onClose={() => setEditingCustomer(null)}
        onDeleteSuccess={() => {
          const remaining = customers.filter(c => c.id !== editingCustomer?.id);
          if (remaining.length > 0) setSelectedCustomerId(remaining[0].id);
        }}
      />
    </div>
  );
};
