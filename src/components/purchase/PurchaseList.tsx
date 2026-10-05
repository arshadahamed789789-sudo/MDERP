import React, { useState } from 'react';
import { Truck, Search, Plus, Filter, Eye, ArrowUpRight, RotateCcw, FileText, CheckCircle2 } from 'lucide-react';
import { useERP } from '../../services/erpStore';
import { formatBDT, formatDate } from '../../utils/formatters';
import { PurchaseInvoice } from '../../types/erp';
import { PurchaseReturnModal } from './PurchaseReturnModal';
import { PurchaseBillDetailsModal } from './PurchaseBillDetailsModal';
import { ShareExportButtons } from '../common/ShareExportButtons';

interface PurchaseListProps {
  onOpenNewPurchase: () => void;
}

export const PurchaseList: React.FC<PurchaseListProps> = ({
  onOpenNewPurchase
}) => {
  const { businessConfig, purchases, purchaseReturns, language, currentBranchId } = useERP();
  const [activeTab, setActiveTab] = useState<'bills' | 'returns'>('bills');
  const [searchTerm, setSearchTerm] = useState('');
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState<PurchaseInvoice | null>(null);

  const filteredPurchases = purchases
    .filter(p => currentBranchId === 'all' || p.branchId === currentBranchId)
    .filter(p => {
      const q = searchTerm.toLowerCase();
      return (
        p.invoiceNo.toLowerCase().includes(q) ||
        p.supplierName.toLowerCase().includes(q) ||
        p.supplierInvoiceNo.toLowerCase().includes(q) ||
        p.items.some(it => it.productName.toLowerCase().includes(q))
      );
    });

  const filteredReturns = purchaseReturns
    .filter(pr => currentBranchId === 'all' || pr.branchId === currentBranchId)
    .filter(pr => {
      const q = searchTerm.toLowerCase();
      return (
        pr.returnNo.toLowerCase().includes(q) ||
        pr.supplierName.toLowerCase().includes(q) ||
        pr.purchaseInvoiceNo.toLowerCase().includes(q) ||
        pr.items.some(it => it.productName.toLowerCase().includes(q))
      );
    });

  const totalPurchases = filteredPurchases.reduce((acc, p) => acc + p.grandTotal, 0);
  const totalPaid = filteredPurchases.reduce((acc, p) => acc + p.paidAmount, 0);
  const totalDue = filteredPurchases.reduce((acc, p) => acc + p.dueAmount, 0);
  const totalReturnsValue = filteredReturns.reduce((acc, r) => acc + r.totalCredit, 0);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            {language === 'bn' ? 'ক্রয় চালান ও ফেরত ব্যবস্থাপনা' : 'Procurement & Supplier Returns'}
          </h1>
          <p className="text-xs text-slate-500">
            {language === 'bn' 
              ? 'মহাজনদের থেকে পণ্য ক্রয়, পরিবহন খরচ, আইএমইআই সংযোজন ও ক্রয় ফেরত' 
              : 'Inventory procurement, landed cost breakdown, and supplier return debit notes.'}
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          <ShareExportButtons
            title={language === 'bn' ? 'ক্রয় চালান ও মহাজন হিসাব' : 'Procurement & Supplier Purchases'}
            subtitle={`Tab: ${activeTab.toUpperCase()}`}
            summaryMetrics={[
              { label: 'Total Purchases', value: formatBDT(totalPurchases) },
              { label: 'Paid to Suppliers', value: formatBDT(totalPaid) },
              { label: 'Payable Due', value: formatBDT(totalDue) },
              { label: 'Returns Value', value: formatBDT(totalReturnsValue) }
            ]}
            shareText={`📦 *${language === 'bn' ? 'ক্রয় চালান ও মহাজন খতিয়ান রিপোর্ট' : 'Procurement & Supplier Statement'}*\n🏛️ *${businessConfig?.name || 'DEALERFLOW ERP'}*\n📅 ${language === 'bn' ? 'তারিখ' : 'Date'}: ${new Date().toLocaleDateString('en-US', { dateStyle: 'medium' })}\n\n💰 *ক্রয় হিসাব সংক্ষেপ:*\n• মোট ক্রয় চালান: ${filteredPurchases.length} টি\n• সর্বমোট ক্রয় মূল্য: ${formatBDT(totalPurchases)}\n• পরিশোধিত নগদ/ব্যাংক: ${formatBDT(totalPaid)}\n• মহাজন বকেয়া দেনা: ${formatBDT(totalDue)}\n• সাপ্লায়ার রিটার্ন: ${formatBDT(totalReturnsValue)}\n\nGenerated via DEALERFLOW Hub.`}
            csvData={
              activeTab === 'bills' ? {
                filename: 'purchase_bills',
                headers: ['Bill No', 'Date', 'Supplier Name', 'Supplier Inv No', 'Subtotal', 'Landed Cost', 'Grand Total', 'Paid', 'Due', 'Branch'],
                rows: filteredPurchases.map(p => [
                  p.invoiceNo, p.date, p.supplierName, p.supplierInvoiceNo,
                  p.subtotal, p.totalLandedCost || 0, p.grandTotal,
                  p.paidAmount, p.dueAmount, p.branchName
                ])
              } : {
                filename: 'purchase_returns',
                headers: ['Return No', 'Date', 'Supplier', 'Original Purchase Inv', 'Credit Total', 'Branch', 'Reason'],
                rows: filteredReturns.map(r => [
                  r.returnNo, r.date, r.supplierName, r.purchaseInvoiceNo,
                  r.totalCredit, r.branchName, r.notes || r.items[0]?.reason || 'Returned to supplier'
                ])
              }
            }
          />
          <button
            onClick={() => setIsReturnModalOpen(true)}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold transition flex items-center gap-1.5 shadow-sm"
          >
            <RotateCcw className="w-4 h-4 text-amber-400" />
            <span>{language === 'bn' ? 'পণ্য ফেরত (Return)' : 'Return to Supplier'}</span>
          </button>
          <button
            onClick={onOpenNewPurchase}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>{language === 'bn' ? '+ নতুন ক্রয় চালান' : '+ New Purchase Bill'}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <p className="text-xs font-semibold text-slate-500 uppercase">Total Purchases</p>
          <p className="text-xl font-black text-slate-900 font-mono mt-1">{formatBDT(totalPurchases)}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">{filteredPurchases.length} Purchase bills recorded</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <p className="text-xs font-semibold text-emerald-600 uppercase">Amount Paid to Suppliers</p>
          <p className="text-xl font-black text-emerald-700 font-mono mt-1">{formatBDT(totalPaid)}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Cleared via Bank/Cash</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <p className="text-xs font-semibold text-amber-600 uppercase">Payable Balance (দেনা)</p>
          <p className="text-xl font-black text-amber-600 font-mono mt-1">{formatBDT(totalDue)}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Outstanding to distributors</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <p className="text-xs font-semibold text-rose-600 uppercase">Supplier Returns</p>
          <p className="text-xl font-black text-rose-600 font-mono mt-1">{formatBDT(totalReturnsValue)}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">{filteredReturns.length} Debit notes credited</p>
        </div>
      </div>

      {/* Subtab Navigation */}
      <div className="flex border-b border-slate-200 gap-4 text-xs font-bold overflow-x-auto whitespace-nowrap pb-0.5">
        <button
          onClick={() => setActiveTab('bills')}
          className={`pb-2.5 transition border-b-2 flex items-center gap-1.5 shrink-0 ${
            activeTab === 'bills' ? 'border-blue-600 text-blue-700' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Truck className="w-4 h-4" />
          <span>Purchase Bills & Landed Costs ({filteredPurchases.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('returns')}
          className={`pb-2.5 transition border-b-2 flex items-center gap-1.5 ${
            activeTab === 'returns' ? 'border-blue-600 text-blue-700' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <RotateCcw className="w-4 h-4" />
          <span>Supplier Purchase Returns ({filteredReturns.length})</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder={activeTab === 'bills' ? 'Search purchase #, supplier, product...' : 'Search return #, supplier, bill...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white"
          />
        </div>
      </div>

      {activeTab === 'bills' ? (
        /* Purchase Bills Table */
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-3">Purchase #</th>
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3">Supplier / Party</th>
                  <th className="py-3 px-3">Items Purchased</th>
                  <th className="py-3 px-3 text-right">Landed Cost</th>
                  <th className="py-3 px-3 text-right">Grand Total</th>
                  <th className="py-3 px-3 text-right">Paid</th>
                  <th className="py-3 px-3 text-right">Due</th>
                  <th className="py-3 px-3 text-center">Status</th>
                  <th className="py-3 px-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredPurchases.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-12 text-center text-slate-400">
                      No purchase invoices found.
                    </td>
                  </tr>
                ) : (
                  filteredPurchases.map(p => (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-3 font-mono font-bold text-slate-900">
                        {p.invoiceNo}
                        <span className="block text-[10px] text-slate-400 font-normal">Bill: {p.supplierInvoiceNo}</span>
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap text-slate-500">
                        {formatDate(p.date)}
                      </td>
                      <td className="py-3 px-3">
                        <p className="font-semibold text-slate-900">{p.supplierName}</p>
                        <span className="text-[10px] text-slate-500">{p.branchName}</span>
                      </td>
                      <td className="py-3 px-3">
                        {p.items.map((it, i) => (
                          <div key={i} className="text-slate-800">
                            <span className="font-semibold">{it.quantity}x {it.productName}</span>
                            <span className="text-[10px] text-slate-500 block">
                              Eff. Cost: {formatBDT(it.effectiveUnitCost)} / unit
                            </span>
                          </div>
                        ))}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-blue-700">
                        {p.totalLandedCost > 0 ? `+${formatBDT(p.totalLandedCost)}` : '৳0'}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                        {formatBDT(p.grandTotal)}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-emerald-700">
                        {formatBDT(p.paidAmount)}
                      </td>
                      <td className="py-3 px-3 text-right font-mono">
                        {p.dueAmount > 0 ? (
                          <span className="font-bold text-amber-600">{formatBDT(p.dueAmount)}</span>
                        ) : (
                          <span className="text-slate-400">৳0</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-blue-100 text-blue-800 uppercase tracking-wider">
                          {p.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => setSelectedPurchase(p)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-700 transition"
                          title="View Bill Details / Goods Receipt"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Purchase Returns Table */
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-3">Return Note #</th>
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3">Original Bill</th>
                  <th className="py-3 px-3">Supplier / Party</th>
                  <th className="py-3 px-3">Items Returned</th>
                  <th className="py-3 px-3 text-right">Debit Note Total</th>
                  <th className="py-3 px-3">Reason & Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredReturns.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      No supplier returns recorded. Click &ldquo;Return to Supplier&rdquo; to process debit notes.
                    </td>
                  </tr>
                ) : (
                  filteredReturns.map(ret => (
                    <tr key={ret.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-3 font-mono font-bold text-amber-700">
                        {ret.returnNo}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap text-slate-500">
                        {formatDate(ret.date)}
                      </td>
                      <td className="py-3 px-3 font-mono font-semibold text-slate-800">
                        {ret.purchaseInvoiceNo}
                      </td>
                      <td className="py-3 px-3">
                        <p className="font-semibold text-slate-900">{ret.supplierName}</p>
                        <span className="text-[10px] text-slate-500">{ret.branchName}</span>
                      </td>
                      <td className="py-3 px-3">
                        {ret.items.map((it, i) => (
                          <div key={i} className="text-slate-800">
                            <span className="font-semibold">{it.quantity}x {it.productName}</span>
                            <span className="text-[10px] text-slate-500 block">
                              Rate: {formatBDT(it.returnRate)} • Reason: {it.reason}
                            </span>
                          </div>
                        ))}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-emerald-700 text-sm">
                        {formatBDT(ret.totalCredit)}
                      </td>
                      <td className="py-3 px-3 text-slate-600 max-w-xs truncate">
                        {ret.notes || '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Purchase Return Modal */}
      <PurchaseReturnModal
        isOpen={isReturnModalOpen}
        onClose={() => setIsReturnModalOpen(false)}
        onSuccess={() => {
          setIsReturnModalOpen(false);
          setActiveTab('returns');
        }}
      />

      {/* Purchase Bill Details Modal */}
      <PurchaseBillDetailsModal
        isOpen={!!selectedPurchase}
        purchase={selectedPurchase}
        onClose={() => setSelectedPurchase(null)}
        onVoidSuccess={() => {
          setSelectedPurchase(null);
        }}
      />
    </div>
  );
};
