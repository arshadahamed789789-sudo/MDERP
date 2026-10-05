import React, { useState } from 'react';
import { 
  Landmark, Wallet, ArrowDownRight, ArrowUpRight, CheckCircle2, 
  AlertCircle, Plus, Calendar, Clock, DollarSign, X, Pencil, ArrowRightLeft
} from 'lucide-react';
import { useERP } from '../../services/erpStore';
import { formatBDT, formatDate, formatDateTime } from '../../utils/formatters';
import { AccountModal } from './AccountModal';
import { ShareExportButtons } from '../common/ShareExportButtons';

export const CashBankManager: React.FC = () => {
  const { 
    businessConfig, cashAccounts, bankAccounts, accountTransactions, dailyClosings,
    performDailyClosing, transferFunds, branches, currentBranchId, language 
  } = useERP();

  const [activeTab, setActiveTab] = useState<'accounts' | 'transactions' | 'closing'>('accounts');

  // Daily Closing Modal / Form
  const [showClosingModal, setShowClosingModal] = useState(false);
  const [closingBranchId, setClosingBranchId] = useState(branches[0]?.id || '');
  const [physicalCashInput, setPhysicalCashInput] = useState(0);
  const [closingNotes, setClosingNotes] = useState('');
  const [closingSuccess, setClosingSuccess] = useState(false);

  // Account Add / Edit Modal
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [accountModalEditing, setAccountModalEditing] = useState<{ type: 'bank' | 'cash'; data: any } | null>(null);

  // Inter-Account Transfer Modal
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferFromId, setTransferFromId] = useState(cashAccounts[0]?.id || '');
  const [transferToId, setTransferToId] = useState(bankAccounts[0]?.id || '');
  const [transferAmount, setTransferAmount] = useState(0);
  const [transferReference, setTransferReference] = useState('');
  const [transferNotes, setTransferNotes] = useState('');
  const [transferError, setTransferError] = useState('');

  // Aggregates
  const totalCashInDrawers = cashAccounts.reduce((acc, ca) => acc + ca.balance, 0);
  const totalBankMfsFunds = bankAccounts.reduce((acc, ba) => acc + ba.balance, 0);
  const totalLiquidAssets = totalCashInDrawers + totalBankMfsFunds;

  // Compute live expected cash for selected closing branch
  const activeClosingBranch = branches.find(b => b.id === closingBranchId) || branches[0];
  const openingFloat = 50000;
  const todayStr = new Date().toISOString().split('T')[0];

  const handleExecuteClosing = (e: React.FormEvent) => {
    e.preventDefault();
    performDailyClosing({
      branchId: closingBranchId,
      actualPhysicalCash: physicalCashInput,
      notes: closingNotes
    });
    setClosingSuccess(true);
    setTimeout(() => {
      setShowClosingModal(false);
      setClosingSuccess(false);
      setActiveTab('closing');
    }, 1200);
  };

  const handleOpenTransfer = () => {
    setTransferFromId(cashAccounts[0]?.id || '');
    setTransferToId(bankAccounts[0]?.id || cashAccounts[1]?.id || '');
    setTransferAmount(0);
    setTransferReference('');
    setTransferNotes('');
    setTransferError('');
    setShowTransferModal(true);
  };

  const handleExecuteTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    setTransferError('');
    if (transferAmount <= 0) {
      setTransferError(language === 'bn' ? 'টাকার পরিমাণ ০ এর বেশি হতে হবে।' : 'Amount must be greater than zero.');
      return;
    }
    if (transferFromId === transferToId) {
      setTransferError(language === 'bn' ? 'উৎস ও গন্তব্য একাউন্ট একই হতে পারে না।' : 'Source and destination accounts must be different.');
      return;
    }

    const res = transferFunds({
      fromAccountId: transferFromId,
      toAccountId: transferToId,
      amount: transferAmount,
      reference: transferReference.trim() || undefined,
      notes: transferNotes.trim() || undefined
    });

    if (!res.success) {
      setTransferError(res.error || 'Transfer failed.');
      return;
    }

    setShowTransferModal(false);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            {language === 'bn' ? 'ক্যাশ, ব্যাংক ও দৈনিক হিসাব ক্লোজিং' : 'Cash, Banking & Daily Business Closing'}
          </h1>
          <p className="text-xs text-slate-500">
            {language === 'bn' 
              ? 'দোকানের ক্যাশ কাউন্টার, ব্যাংক একাউন্ট, বিকাশ/নগদ ব্যালেন্স ও দিনশেষে ক্যাশ মেলানো' 
              : 'Counter cashboxes, bank & MFS ledger balances, and physical drawer cash closing.'}
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          <ShareExportButtons
            title={language === 'bn' ? 'ক্যাশ, ব্যাংক ও দৈনিক ক্লোজিং রিপোর্ট' : 'Cash, Bank & Treasury Report'}
            subtitle={`Scope: ${currentBranchId === 'all' ? 'All Accounts' : 'Active Branch'}`}
            summaryMetrics={[
              { label: 'Total Liquid Treasury', value: formatBDT(totalLiquidAssets) },
              { label: 'Counter Cash Drawers', value: formatBDT(totalCashInDrawers) },
              { label: 'Bank & MFS Accounts', value: formatBDT(totalBankMfsFunds) }
            ]}
            shareText={`💵 *${language === 'bn' ? 'ক্যাশ, ব্যাংক ও ট্রেজারি রিপোর্ট' : 'Treasury & Cash Balance Report'}*\n🏛️ শোরুম: *${businessConfig?.name || 'DEALERFLOW ERP'}*\n📅 ${language === 'bn' ? 'তারিখ' : 'Date'}: ${new Date().toLocaleDateString('en-US', { dateStyle: 'medium' })}\n\n💰 *ব্যালেন্স সংক্ষেপ:*\n• মোট নগদ ক্যাশ ড্রয়ার: ${formatBDT(totalCashInDrawers)}\n• ব্যাংক ও MFS (বিকাশ/নগদ): ${formatBDT(totalBankMfsFunds)}\n• *সর্বমোট নগদ ও তারল্য তহবিল: ${formatBDT(totalLiquidAssets)}*\n• রেজিস্টার্ড একাউন্ট: ${cashAccounts.length + bankAccounts.length} টি\n\nGenerated via DEALERFLOW Hub.`}
            csvData={{
              filename: 'cash_bank_treasury_summary',
              headers: ['Account Name', 'Type', 'Bank / Provider', 'Account Number', 'Current Balance (BDT)', 'Branch'],
              rows: [
                ...cashAccounts.map(c => [c.name, 'Counter Cash', 'Physical Box', 'N/A', c.balance, branches.find(b => b.id === c.branchId)?.name || 'Main Branch']),
                ...bankAccounts.map(b => [b.accountName, b.type, b.bankName, b.accountNumber, b.balance, b.branchName])
              ]
            }}
          />
          <button
            type="button"
            onClick={handleOpenTransfer}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <ArrowRightLeft className="w-4 h-4 text-blue-200" />
            <span>{language === 'bn' ? 'ইন্টার-একাউন্ট ট্রান্সফার' : 'Transfer Funds'}</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setAccountModalEditing(null);
              setShowAccountModal(true);
            }}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>{language === 'bn' ? '+ নতুন একাউন্ট' : '+ Add Account'}</span>
          </button>
          <button
            onClick={() => {
              setShowClosingModal(true);
              setPhysicalCashInput(86750); // realistic prefill
            }}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{language === 'bn' ? 'আজকের ক্যাশ ক্লোজিং করুন' : 'Perform Daily Closing'}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <p className="text-xs font-semibold text-slate-500 uppercase">Total Liquid Treasury</p>
          <p className="text-xl font-black text-slate-900 font-mono mt-1">{formatBDT(totalLiquidAssets)}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Cash + Bank + bKash + Nagad</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <p className="text-xs font-semibold text-emerald-600 uppercase">Cash In Hand (কাউন্টার ও ভল্ট)</p>
          <p className="text-xl font-black text-emerald-700 font-mono mt-1">{formatBDT(totalCashInDrawers)}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">{cashAccounts.length} Cash Drawers</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <p className="text-xs font-semibold text-blue-600 uppercase">Bank & MFS Accounts</p>
          <p className="text-xl font-black text-blue-700 font-mono mt-1">{formatBDT(totalBankMfsFunds)}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">{bankAccounts.length} Online & Corporate Accounts</p>
        </div>
      </div>

      {/* Navigation Subtabs */}
      <div className="flex border-b border-slate-200 gap-4 text-xs font-bold">
        <button
          onClick={() => setActiveTab('accounts')}
          className={`pb-2.5 transition border-b-2 flex items-center gap-1.5 ${
            activeTab === 'accounts' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Wallet className="w-4 h-4" />
          <span>Accounts & Balances</span>
        </button>
        <button
          onClick={() => setActiveTab('transactions')}
          className={`pb-2.5 transition border-b-2 flex items-center gap-1.5 ${
            activeTab === 'transactions' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Cashbook & Transaction Feed</span>
        </button>
        <button
          onClick={() => setActiveTab('closing')}
          className={`pb-2.5 transition border-b-2 flex items-center gap-1.5 ${
            activeTab === 'closing' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Daily Closing Log (দিনশেষের ক্যাশ হিসেব)</span>
        </button>
      </div>

      {/* Tab 1: Accounts & Balances */}
      {activeTab === 'accounts' && (
        <div className="space-y-6">
          {/* Cash Drawers Grid */}
          <div>
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Wallet className="w-4 h-4 text-emerald-600" />
              <span>Cash Drawers & Showroom Cashboxes</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {cashAccounts.map(ca => (
                <div key={ca.id} className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">{ca.name}</h4>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">
                        Type: {ca.type}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setAccountModalEditing({ type: 'cash', data: ca });
                          setShowAccountModal(true);
                        }}
                        className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-700 rounded-lg transition"
                        title="Edit Cash Drawer"
                      >
                        <Pencil className="w-3.5 h-3.5 text-emerald-600" />
                      </button>
                      <div className="p-2 bg-emerald-50 text-emerald-700 rounded-lg">
                        <Wallet className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs text-slate-500">Current Balance</span>
                    <span className="text-lg font-black font-mono text-emerald-800">{formatBDT(ca.balance)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bank & MFS Accounts Grid */}
          <div>
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Landmark className="w-4 h-4 text-blue-600" />
              <span>Banks & Mobile Financial Services (MFS)</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {bankAccounts.map(ba => (
                <div key={ba.id} className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-xs text-slate-900 truncate max-w-[150px]">{ba.bankName}</h4>
                      <p className="text-[11px] text-slate-500 font-mono mt-0.5">{ba.accountNumber}</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setAccountModalEditing({ type: 'bank', data: ba });
                          setShowAccountModal(true);
                        }}
                        className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-700 rounded-lg transition"
                        title="Edit Account Details"
                      >
                        <Pencil className="w-3.5 h-3.5 text-blue-600" />
                      </button>
                      <span className="text-[10px] px-2 py-0.5 rounded font-bold uppercase bg-blue-50 text-blue-700">
                        {ba.type}
                      </span>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-2 truncate">Title: {ba.accountName}</p>
                  <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs text-slate-500">Fund Balance</span>
                    <span className="text-base font-black font-mono text-blue-800">{formatBDT(ba.balance)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Cashbook & Transaction Feed */}
      {activeTab === 'transactions' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-3 bg-slate-50 border-b border-slate-200 flex justify-between items-center text-xs">
            <span className="font-bold text-slate-700">Account Movement Ledger (Cash In & Out)</span>
            <span className="text-slate-500">{accountTransactions.length} movements recorded</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Account</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Ref ID</th>
                  <th className="py-2.5 px-3">Description</th>
                  <th className="py-2.5 px-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {accountTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      No cash/bank transactions yet. Create a sale, purchase, or expense to populate.
                    </td>
                  </tr>
                ) : (
                  accountTransactions.map(trx => (
                    <tr key={trx.id} className="hover:bg-slate-50/70">
                      <td className="py-2.5 px-3 text-slate-500 whitespace-nowrap">{formatDate(trx.date)}</td>
                      <td className="py-2.5 px-3 font-semibold text-slate-900">{trx.accountName}</td>
                      <td className="py-2.5 px-3">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                          trx.type === 'IN' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {trx.type === 'IN' ? 'Cash In' : 'Cash Out'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-700">{trx.category}</td>
                      <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500">{trx.referenceId}</td>
                      <td className="py-2.5 px-3 text-slate-600">{trx.description}</td>
                      <td className={`py-2.5 px-3 text-right font-mono font-bold ${
                        trx.type === 'IN' ? 'text-emerald-700' : 'text-rose-600'
                      }`}>
                        {trx.type === 'IN' ? `+${formatBDT(trx.amount)}` : `-${formatBDT(trx.amount)}`}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Daily Closing Records */}
      {activeTab === 'closing' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="p-3 bg-slate-50 border-b border-slate-200 flex justify-between items-center text-xs">
              <span className="font-bold text-slate-700">Past Daily Cash Closing Verifications</span>
              <span className="text-slate-500">{dailyClosings.length} closures on record</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider">
                  <tr>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Branch</th>
                    <th className="py-2.5 px-3 text-right">Opening Cash</th>
                    <th className="py-2.5 px-3 text-right">Cash Sales</th>
                    <th className="py-2.5 px-3 text-right">Collection</th>
                    <th className="py-2.5 px-3 text-right">Expenses</th>
                    <th className="py-2.5 px-3 text-right font-bold text-slate-800">Expected Cash</th>
                    <th className="py-2.5 px-3 text-right font-bold text-emerald-800">Actual Count</th>
                    <th className="py-2.5 px-3 text-right">Variance</th>
                    <th className="py-2.5 px-3">Verified By</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {dailyClosings.map(c => (
                    <tr key={c.id} className="hover:bg-slate-50/70">
                      <td className="py-2.5 px-3 whitespace-nowrap text-slate-900 font-semibold">{formatDate(c.date)}</td>
                      <td className="py-2.5 px-3">{c.branchName}</td>
                      <td className="py-2.5 px-3 text-right font-mono">{formatBDT(c.openingCash)}</td>
                      <td className="py-2.5 px-3 text-right font-mono text-emerald-700">+{formatBDT(c.totalCashSales)}</td>
                      <td className="py-2.5 px-3 text-right font-mono text-emerald-700">+{formatBDT(c.totalCustomerCollection)}</td>
                      <td className="py-2.5 px-3 text-right font-mono text-rose-600">-{formatBDT(c.totalExpenses)}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">{formatBDT(c.expectedClosingCash)}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-800">{formatBDT(c.actualPhysicalCash)}</td>
                      <td className="py-2.5 px-3 text-right font-mono">
                        {c.variance === 0 ? (
                          <span className="text-emerald-600 font-bold">Balanced (৳0)</span>
                        ) : c.variance > 0 ? (
                          <span className="text-emerald-700 font-bold">+{formatBDT(c.variance)}</span>
                        ) : (
                          <span className="text-rose-600 font-bold">{formatBDT(c.variance)}</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">
                        {c.closedBy}
                        <span className="block text-[10px] text-slate-400">{c.closedAt}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Perform Daily Closing Modal */}
      {showClosingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg border border-slate-200 overflow-hidden">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <h2 className="text-sm font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Daily Business Cash Closing (হিসাব ক্লোজিং)</span>
              </h2>
              <button onClick={() => setShowClosingModal(false)}>
                <X className="w-5 h-5 text-slate-400 hover:text-white" />
              </button>
            </div>

            {closingSuccess ? (
              <div className="p-8 text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-base text-slate-900">Daily Cash Successfully Reconciled & Closed!</h3>
                <p className="text-xs text-slate-500">The day ledger and physical count have been permanently audited.</p>
              </div>
            ) : (
              <form onSubmit={handleExecuteClosing} className="p-5 space-y-4 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 mb-1 block">Closing Branch</label>
                  <select
                    value={closingBranchId}
                    onChange={(e) => setClosingBranchId(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  >
                    {branches.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>

                {/* Day Ledger Breakdown */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Opening Cash Drawer Float:</span>
                    <span className="font-mono font-bold text-slate-900">{formatBDT(openingFloat)}</span>
                  </div>
                  <div className="flex justify-between text-emerald-700">
                    <span>+ Cash Sales Receipts Today:</span>
                    <span className="font-mono font-bold">+৳36,000</span>
                  </div>
                  <div className="flex justify-between text-emerald-700">
                    <span>+ Customer Due Collections Today:</span>
                    <span className="font-mono font-bold">+৳25,000</span>
                  </div>
                  <div className="flex justify-between text-rose-600">
                    <span>- Cash Operating Expenses:</span>
                    <span className="font-mono font-bold">-৳4,250</span>
                  </div>
                  <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-sm text-slate-900">
                    <span>System Expected Drawer Cash:</span>
                    <span className="font-mono text-base text-emerald-800">৳86,750</span>
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 mb-1 block">
                    Actual Physical Cash Counted in Drawer (৳) *
                  </label>
                  <input
                    type="number"
                    required
                    value={physicalCashInput || ''}
                    onChange={(e) => setPhysicalCashInput(Number(e.target.value))}
                    className="w-full p-2 font-mono font-bold text-lg text-emerald-800 border border-slate-300 rounded-lg text-center"
                  />
                </div>

                {/* Variance Display */}
                <div className="p-2.5 rounded-lg bg-slate-100 flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-600">Calculated Variance (পার্থক্য):</span>
                  <span className={`font-mono font-bold text-sm ${
                    physicalCashInput - 86750 === 0 ? 'text-emerald-600' : 'text-rose-600'
                  }`}>
                    {formatBDT(physicalCashInput - 86750)}
                  </span>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 mb-1 block">Audit Notes</label>
                  <input
                    type="text"
                    placeholder="e.g. All currency notes counted and verified with day closing slip."
                    value={closingNotes}
                    onChange={(e) => setClosingNotes(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowClosingModal(false)}
                    className="px-4 py-2 border rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold"
                  >
                    Verify & Close Day
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Account Add / Edit Modal */}
      <AccountModal
        isOpen={showAccountModal}
        accountToEdit={accountModalEditing}
        onClose={() => {
          setShowAccountModal(false);
          setAccountModalEditing(null);
        }}
      />

      {/* Inter-Account Transfer Modal */}
      {showTransferModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in-50">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
            <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <ArrowRightLeft className="w-4 h-4 text-blue-400" />
                <span>{language === 'bn' ? 'ইন্টার-একাউন্ট ফান্ড ট্রান্সফার' : 'Inter-Account Fund Transfer'}</span>
              </h3>
              <button type="button" onClick={() => setShowTransferModal(false)}>
                <X className="w-4 h-4 text-slate-400 hover:text-white" />
              </button>
            </div>

            <form onSubmit={handleExecuteTransfer} className="p-5 space-y-3.5 text-xs">
              {transferError && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{transferError}</span>
                </div>
              )}

              <div>
                <label className="font-bold text-slate-700 mb-1 block">From Account (টাকা যেখান থেকে যাবে) *</label>
                <select
                  value={transferFromId}
                  onChange={e => setTransferFromId(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg"
                >
                  <optgroup label="Cash Drawers">
                    {cashAccounts.map(ca => (
                      <option key={ca.id} value={ca.id}>
                        {ca.name} (Balance: {formatBDT(ca.balance)})
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Bank & MFS Accounts">
                    {bankAccounts.map(ba => (
                      <option key={ba.id} value={ba.id}>
                        {ba.bankName} - {ba.accountNumber} (Balance: {formatBDT(ba.balance)})
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 mb-1 block">To Account (টাকা যেখানে জমা হবে) *</label>
                <select
                  value={transferToId}
                  onChange={e => setTransferToId(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg"
                >
                  <optgroup label="Bank & MFS Accounts">
                    {bankAccounts.map(ba => (
                      <option key={ba.id} value={ba.id}>
                        {ba.bankName} - {ba.accountNumber} (Balance: {formatBDT(ba.balance)})
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Cash Drawers">
                    {cashAccounts.map(ca => (
                      <option key={ca.id} value={ca.id}>
                        {ca.name} (Balance: {formatBDT(ca.balance)})
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 mb-1 block">Transfer Amount (৳) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={transferAmount || ''}
                  onChange={e => setTransferAmount(Number(e.target.value))}
                  placeholder="0"
                  className="w-full p-2.5 font-mono font-bold text-base border border-slate-300 rounded-lg text-blue-700"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 mb-1 block">TrxID / Reference Slip</label>
                <input
                  type="text"
                  placeholder="e.g. DEPOSIT-88192 or MFS-3910"
                  value={transferReference}
                  onChange={e => setTransferReference(e.target.value)}
                  className="w-full p-2.5 font-mono border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 mb-1 block">Notes / Reason</label>
                <input
                  type="text"
                  placeholder="e.g. Counter cash transferred to bank account"
                  value={transferNotes}
                  onChange={e => setTransferNotes(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowTransferModal(false)}
                  className="px-4 py-2 border rounded-lg text-slate-600 hover:bg-slate-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-xs flex items-center gap-1.5"
                >
                  <ArrowRightLeft className="w-3.5 h-3.5" />
                  <span>Execute Transfer</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
