import React, { useState } from 'react';
import { 
  ShoppingBag, Search, Plus, Filter, Eye, Printer, RotateCcw, 
  Download, ArrowDownRight, User, Calendar, FileText, CheckCircle2
} from 'lucide-react';
import { useERP } from '../../services/erpStore';
import { formatBDT, formatDate } from '../../utils/formatters';
import { NewQuotationModal } from './NewQuotationModal';
import { SalesReturnModal } from './SalesReturnModal';

interface SalesListProps {
  onOpenNewSale: () => void;
  onViewInvoice: (invoiceNo: string) => void;
}

export const SalesList: React.FC<SalesListProps> = ({
  onOpenNewSale,
  onViewInvoice
}) => {
  const { sales, quotations, salesReturns, convertQuotationToSale, language, currentBranchId } = useERP();

  const [activeTab, setActiveTab] = useState<'invoices' | 'quotations' | 'returns'>('invoices');
  const [searchTerm, setSearchTerm] = useState('');
  const [customerTypeFilter, setCustomerTypeFilter] = useState('ALL');

  // Modals
  const [isQuotationModalOpen, setIsQuotationModalOpen] = useState(false);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [actionMessage, setActionMessage] = useState('');

  const filteredSales = sales
    .filter(s => currentBranchId === 'all' || s.branchId === currentBranchId)
    .filter(s => {
      const q = searchTerm.toLowerCase();
      const matchSearch = 
        s.invoiceNo.toLowerCase().includes(q) ||
        s.customerName.toLowerCase().includes(q) ||
        s.customerMobile.includes(q) ||
        s.items.some(it => it.productName.toLowerCase().includes(q) || it.imeiList.some(im => im.includes(q)));
      
      const matchType = customerTypeFilter === 'ALL' || s.customerType === customerTypeFilter;
      return matchSearch && matchType;
    });

  const totalSalesAmount = filteredSales.reduce((acc, s) => acc + s.grandTotal, 0);
  const totalPaidAmount = filteredSales.reduce((acc, s) => acc + s.paidAmount, 0);
  const totalDueAmount = filteredSales.reduce((acc, s) => acc + s.dueAmount, 0);

  const handleConvertQuote = (quoteId: string) => {
    const res = convertQuotationToSale(quoteId);
    if (res.success && res.invoice) {
      setActionMessage(`Quotation converted to Invoice ${res.invoice.invoiceNo}!`);
      setTimeout(() => setActionMessage(''), 3000);
      onViewInvoice(res.invoice.invoiceNo);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            {language === 'bn' ? 'বিক্রয় ও চালান ব্যবস্থাপনা' : 'Sales, Quotations & Returns'}
          </h1>
          <p className="text-xs text-slate-500">
            {language === 'bn' 
              ? 'সকল খুচরা ও পাইকারি মেমো, আইএমইআই, দরপ্রস্তাব এবং সেলস রিটার্ন' 
              : 'POS invoices, wholesale quotations, and sales return restock tracking.'}
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {activeTab === 'invoices' && (
            <button
              onClick={onOpenNewSale}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>{language === 'bn' ? '+ নতুন মেমো (POS)' : '+ New POS Sale'}</span>
            </button>
          )}
          {activeTab === 'quotations' && (
            <button
              onClick={() => setIsQuotationModalOpen(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>{language === 'bn' ? '+ নতুন দরপ্রস্তাব' : '+ New Quotation'}</span>
            </button>
          )}
          {activeTab === 'returns' && (
            <button
              onClick={() => setIsReturnModalOpen(true)}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
            >
              <RotateCcw className="w-4 h-4" />
              <span>{language === 'bn' ? '+ সেলস রিটার্ন গ্রহণ' : '+ Process Return'}</span>
            </button>
          )}
        </div>
      </div>

      {actionMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-4 text-xs font-bold">
        <button
          onClick={() => setActiveTab('invoices')}
          className={`pb-2.5 transition border-b-2 flex items-center gap-1.5 ${
            activeTab === 'invoices' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Sales Invoices ({sales.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('quotations')}
          className={`pb-2.5 transition border-b-2 flex items-center gap-1.5 ${
            activeTab === 'quotations' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Quotations & Estimates ({quotations.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('returns')}
          className={`pb-2.5 transition border-b-2 flex items-center gap-1.5 ${
            activeTab === 'returns' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <RotateCcw className="w-4 h-4" />
          <span>Sales Returns & Restock ({salesReturns.length})</span>
        </button>
      </div>

      {/* TAB 1: INVOICES */}
      {activeTab === 'invoices' && (
        <div className="space-y-4">
          {/* Summary KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200">
              <p className="text-xs font-semibold text-slate-500 uppercase">Filtered Total Sales</p>
              <p className="text-xl font-black text-slate-900 font-mono mt-1">{formatBDT(totalSalesAmount)}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">{filteredSales.length} Invoices recorded</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200">
              <p className="text-xs font-semibold text-emerald-600 uppercase">Total Cash/Bank Received</p>
              <p className="text-xl font-black text-emerald-700 font-mono mt-1">{formatBDT(totalPaidAmount)}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Settled at counter/online</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200">
              <p className="text-xs font-semibold text-rose-600 uppercase">Customer Due Balance</p>
              <p className="text-xl font-black text-rose-600 font-mono mt-1">{formatBDT(totalDueAmount)}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Uncollected receivables</p>
            </div>
          </div>

          {/* Search and Filters Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search invoice #, customer, mobile, IMEI..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full text-xs pl-9 pr-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs text-slate-500 font-medium">Customer Type:</span>
              <select
                value={customerTypeFilter}
                onChange={(e) => setCustomerTypeFilter(e.target.value)}
                className="text-xs font-medium p-2 border border-slate-200 rounded-lg bg-slate-50"
              >
                <option value="ALL">All Customers</option>
                <option value="Retail Customer">Retail Customers</option>
                <option value="Wholesale Dealer">Wholesale Dealers</option>
                <option value="Sub Dealer">Sub Dealers</option>
                <option value="VIP Customer">VIP Customers</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-3">Invoice #</th>
                    <th className="py-3 px-3">Date</th>
                    <th className="py-3 px-3">Customer / Party</th>
                    <th className="py-3 px-3">Items & IMEI</th>
                    <th className="py-3 px-3 text-right">Grand Total</th>
                    <th className="py-3 px-3 text-right">Paid</th>
                    <th className="py-3 px-3 text-right">Due</th>
                    <th className="py-3 px-3 text-center">Status</th>
                    <th className="py-3 px-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {filteredSales.map(inv => (
                    <tr key={inv.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-3 font-mono font-bold text-slate-900">
                        {inv.invoiceNo}
                        <span className="block text-[10px] text-slate-400 font-normal">{inv.branchName}</span>
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap text-slate-500">{formatDate(inv.date)}</td>
                      <td className="py-3 px-3">
                        <p className="font-semibold text-slate-900">{inv.customerName}</p>
                        <p className="text-[11px] text-slate-500">{inv.customerMobile}</p>
                      </td>
                      <td className="py-3 px-3 max-w-xs">
                        {inv.items.map((it, i) => (
                          <div key={i} className="truncate">
                            <span className="font-semibold text-slate-800">{it.quantity}x {it.productName}</span>
                            {it.imeiList.length > 0 && (
                              <span className="text-[10px] font-mono text-slate-500 block truncate">
                                IMEI: {it.imeiList.join(', ')}
                              </span>
                            )}
                          </div>
                        ))}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">{formatBDT(inv.grandTotal)}</td>
                      <td className="py-3 px-3 text-right font-mono text-emerald-700">{formatBDT(inv.paidAmount)}</td>
                      <td className="py-3 px-3 text-right font-mono">
                        {inv.dueAmount > 0 ? (
                          <span className="font-bold text-rose-600">{formatBDT(inv.dueAmount)}</span>
                        ) : (
                          <span className="text-slate-400">৳0</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800 uppercase tracking-wider">
                          {inv.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => onViewInvoice(inv.invoiceNo)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 transition"
                          title="Print / View Invoice"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: QUOTATIONS */}
      {activeTab === 'quotations' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center text-xs">
            <span className="font-bold text-slate-900">Dealer Quotations & Price Estimates</span>
            <button
              onClick={() => setIsQuotationModalOpen(true)}
              className="text-xs font-bold text-emerald-600 hover:text-emerald-700"
            >
              + Create Quotation
            </button>
          </div>
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-600 font-semibold border-b uppercase tracking-wider">
              <tr>
                <th className="py-3 px-3">Quote #</th>
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3">Customer / Party</th>
                <th className="py-3 px-3">Items Quoted</th>
                <th className="py-3 px-3 text-right">Quoted Total</th>
                <th className="py-3 px-3 text-center">Valid Until</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {quotations.map(q => (
                <tr key={q.id} className="hover:bg-slate-50">
                  <td className="py-3 px-3 font-mono font-bold text-slate-900">{q.quoteNo}</td>
                  <td className="py-3 px-3 whitespace-nowrap text-slate-500">{formatDate(q.date)}</td>
                  <td className="py-3 px-3 font-semibold text-slate-900">{q.customerName}</td>
                  <td className="py-3 px-3">
                    {q.items.map((it, idx) => (
                      <span key={idx} className="block">{it.quantity}x {it.productName}</span>
                    ))}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">{formatBDT(q.grandTotal)}</td>
                  <td className="py-3 px-3 text-center text-slate-500">{formatDate(q.validUntil)}</td>
                  <td className="py-3 px-3 text-center">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                      q.status === 'CONVERTED' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {q.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    {q.status !== 'CONVERTED' ? (
                      <button
                        onClick={() => handleConvertQuote(q.id)}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-bold transition"
                      >
                        Convert to Sale
                      </button>
                    ) : (
                      <span className="text-[11px] text-slate-400">Sold</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 3: SALES RETURNS */}
      {activeTab === 'returns' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center text-xs">
            <span className="font-bold text-slate-900">Sales Return Log (Reversed Stock & Restocked IMEIs)</span>
            <button
              onClick={() => setIsReturnModalOpen(true)}
              className="text-xs font-bold text-rose-600 hover:text-rose-700"
            >
              + Process Sales Return
            </button>
          </div>
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-600 font-semibold border-b uppercase tracking-wider">
              <tr>
                <th className="py-3 px-3">Return #</th>
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3">Original Invoice</th>
                <th className="py-3 px-3">Customer</th>
                <th className="py-3 px-3">Returned Items & IMEIs</th>
                <th className="py-3 px-3 text-right">Refund Amount</th>
                <th className="py-3 px-3">Settlement</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {salesReturns.map(ret => (
                <tr key={ret.id} className="hover:bg-slate-50">
                  <td className="py-3 px-3 font-mono font-bold text-rose-700">{ret.returnNo}</td>
                  <td className="py-3 px-3 whitespace-nowrap text-slate-500">{formatDate(ret.date)}</td>
                  <td className="py-3 px-3 font-mono text-slate-800">{ret.saleInvoiceNo}</td>
                  <td className="py-3 px-3 font-semibold text-slate-900">{ret.customerName}</td>
                  <td className="py-3 px-3">
                    {ret.items.map((it, idx) => (
                      <div key={idx}>
                        <span>{it.quantity}x {it.productName}</span>
                        {it.imeiList.length > 0 && (
                          <span className="block font-mono text-[10px] text-emerald-700">
                            IMEI Restocked: {it.imeiList.join(', ')}
                          </span>
                        )}
                      </div>
                    ))}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-rose-600">{formatBDT(ret.totalRefund)}</td>
                  <td className="py-3 px-3">
                    <span className="text-[10px] px-2 py-0.5 rounded font-bold uppercase bg-slate-100 text-slate-700">
                      {ret.refundMethod}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modals */}
      <NewQuotationModal
        isOpen={isQuotationModalOpen}
        onClose={() => setIsQuotationModalOpen(false)}
        onSuccess={(quoteNo) => {
          setActionMessage(`Quotation ${quoteNo} generated successfully!`);
          setTimeout(() => setActionMessage(''), 3000);
        }}
      />

      <SalesReturnModal
        isOpen={isReturnModalOpen}
        onClose={() => setIsReturnModalOpen(false)}
        onSuccess={(returnNo) => {
          setActionMessage(`Sales Return ${returnNo} processed! IMEI restocked and ledger updated.`);
          setTimeout(() => setActionMessage(''), 3000);
        }}
      />
    </div>
  );
};
