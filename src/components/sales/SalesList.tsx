import React, { useState } from 'react';
import { 
  ShoppingBag, Search, Plus, Filter, Eye, Printer, RotateCcw, 
  Download, ArrowDownRight, User, Calendar, FileText, CheckCircle2, Trash2, Ban, Pencil, X
} from 'lucide-react';
import { useERP } from '../../services/erpStore';
import { formatBDT, formatDate } from '../../utils/formatters';
import { NewQuotationModal } from './NewQuotationModal';
import { SalesReturnModal } from './SalesReturnModal';
import { QuotationPrintModal } from './QuotationPrintModal';
import { exportToCSV } from '../../utils/exportToCsv';
import { Quotation, SaleInvoice } from '../../types/erp';
import { ShareExportButtons } from '../common/ShareExportButtons';

interface SalesListProps {
  onOpenNewSale: () => void;
  onViewInvoice: (invoiceNo: string) => void;
}

export const SalesList: React.FC<SalesListProps> = ({
  onOpenNewSale,
  onViewInvoice
}) => {
  const { 
    businessConfig, sales, quotations, salesReturns, convertQuotationToSale, 
    deleteQuotation, voidSaleInvoice, language, currentBranchId 
  } = useERP();

  const [activeTab, setActiveTab] = useState<'invoices' | 'quotations' | 'returns'>('invoices');
  const [searchTerm, setSearchTerm] = useState('');
  const [customerTypeFilter, setCustomerTypeFilter] = useState('ALL');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<'ALL' | 'PAID' | 'PENDING'>('ALL');

  // Modals
  const [isQuotationModalOpen, setIsQuotationModalOpen] = useState(false);
  const [editingQuotation, setEditingQuotation] = useState<Quotation | null>(null);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [printingQuotation, setPrintingQuotation] = useState<Quotation | null>(null);
  const [actionMessage, setActionMessage] = useState('');

  // Void Invoice Modal States (replaces prompt/alert)
  const [voidModalInvoice, setVoidModalInvoice] = useState<SaleInvoice | null>(null);
  const [voidReasonInput, setVoidReasonInput] = useState('');
  const [voidError, setVoidError] = useState('');

  const handleOpenVoidModal = (inv: SaleInvoice) => {
    setVoidModalInvoice(inv);
    setVoidReasonInput('');
    setVoidError('');
  };

  const handleExecuteVoidInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!voidModalInvoice) return;
    if (!voidReasonInput.trim()) {
      setVoidError('Please specify a cancellation reason.');
      return;
    }
    const res = voidSaleInvoice(voidModalInvoice.invoiceNo, voidReasonInput.trim());
    if (!res.success) {
      setVoidError(res.error || 'Failed to cancel invoice');
      return;
    }
    setActionMessage(`Invoice ${voidModalInvoice.invoiceNo} successfully cancelled. Stock restored.`);
    setTimeout(() => setActionMessage(''), 3500);
    setVoidModalInvoice(null);
  };

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
      const matchPayment = 
        paymentStatusFilter === 'ALL' ? true :
        paymentStatusFilter === 'PAID' ? s.dueAmount === 0 :
        s.dueAmount > 0;
      return matchSearch && matchType && matchPayment;
    });

  const totalSalesAmount = filteredSales.reduce((acc, s) => acc + s.grandTotal, 0);
  const totalPaidAmount = filteredSales.reduce((acc, s) => acc + s.paidAmount, 0);
  const totalDueAmount = filteredSales.reduce((acc, s) => acc + s.dueAmount, 0);

  const handleExportCSV = () => {
    if (activeTab === 'invoices') {
      const headers = ['Invoice No', 'Date', 'Customer Name', 'Mobile', 'Customer Type', 'Subtotal', 'Discount', 'Grand Total', 'Paid', 'Due', 'Payment Modes', 'Branch'];
      const rows = filteredSales.map(s => [
        s.invoiceNo,
        s.date,
        s.customerName,
        s.customerMobile,
        s.customerType,
        s.subtotal,
        s.discount,
        s.grandTotal,
        s.paidAmount,
        s.dueAmount,
        s.payments.map(p => `${p.method}: ${p.amount}`).join('; '),
        s.branchName
      ]);
      exportToCSV('sales_invoices', headers, rows);
    } else if (activeTab === 'quotations') {
      const headers = ['Quote No', 'Date', 'Customer Name', 'Mobile', 'Type', 'Subtotal', 'Discount', 'Grand Total', 'Valid Until', 'Status', 'Branch'];
      const rows = quotations.map(q => [
        q.quoteNo,
        q.date,
        q.customerName,
        q.customerMobile,
        q.customerType,
        q.subtotal,
        q.discount,
        q.grandTotal,
        q.validUntil,
        q.status,
        q.branchName
      ]);
      exportToCSV('quotations', headers, rows);
    } else {
      const headers = ['Return No', 'Date', 'Original Invoice', 'Customer Name', 'Refund Total', 'Method', 'Branch', 'Notes'];
      const rows = salesReturns.map(r => [
        r.returnNo,
        r.date,
        r.saleInvoiceNo,
        r.customerName,
        r.totalRefund,
        r.refundMethod,
        r.branchName,
        r.notes || ''
      ]);
      exportToCSV('sales_returns', headers, rows);
    }
  };

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
        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          <ShareExportButtons
            title={language === 'bn' ? 'বিক্রয় ও ইনভয়েস স্টেটমেন্ট' : 'Sales & Invoices Report'}
            subtitle={`Tab: ${activeTab.toUpperCase()}`}
            summaryMetrics={[
              { label: 'Total Invoices', value: `${filteredSales.length}` },
              { label: 'Total Sales', value: formatBDT(totalSalesAmount) },
              { label: 'Paid Collected', value: formatBDT(totalPaidAmount) },
              { label: 'Outstanding Due', value: formatBDT(totalDueAmount) }
            ]}
            shareText={`📄 *${language === 'bn' ? 'বিক্রয় ও মেমো স্টেটমেন্ট' : 'Sales & Invoices Report'}*\n🏛️ *${businessConfig?.name || 'DEALERFLOW ERP'}*\n📅 ${language === 'bn' ? 'তারিখ' : 'Date'}: ${new Date().toLocaleDateString('en-US', { dateStyle: 'medium' })}\n\n📊 *${activeTab.toUpperCase()} সংক্ষেপ:*\n• মোট ভাউচার: ${activeTab === 'invoices' ? filteredSales.length : activeTab === 'quotations' ? quotations.length : salesReturns.length} টি\n• সর্বমোট বিক্রয়: ${formatBDT(totalSalesAmount)}\n• নগদ আদায়: ${formatBDT(totalPaidAmount)}\n• বকেয়া বাকি: ${formatBDT(totalDueAmount)}\n\nGenerated via DEALERFLOW Hub.`}
            csvData={
              activeTab === 'invoices' ? {
                filename: 'sales_invoices',
                headers: ['Invoice No', 'Date', 'Customer Name', 'Mobile', 'Customer Type', 'Subtotal', 'Discount', 'Grand Total', 'Paid', 'Due', 'Payment Modes', 'Branch'],
                rows: filteredSales.map(s => [
                  s.invoiceNo, s.date, s.customerName, s.customerMobile, s.customerType,
                  s.subtotal, s.discount, s.grandTotal, s.paidAmount, s.dueAmount,
                  s.payments.map(p => `${p.method}: ${p.amount}`).join('; '), s.branchName
                ])
              } : activeTab === 'quotations' ? {
                filename: 'sales_quotations',
                headers: ['Quote No', 'Date', 'Customer Name', 'Mobile', 'Type', 'Subtotal', 'Discount', 'Grand Total', 'Valid Until', 'Status', 'Branch'],
                rows: quotations.map(q => [
                  q.quoteNo, q.date, q.customerName, q.customerMobile, q.customerType,
                  q.subtotal, q.discount, q.grandTotal, q.validUntil, q.status, q.branchName
                ])
              } : {
                filename: 'sales_returns',
                headers: ['Return No', 'Date', 'Original Invoice', 'Customer Name', 'Refund Total', 'Method', 'Branch', 'Notes'],
                rows: salesReturns.map(r => [
                  r.returnNo, r.date, r.saleInvoiceNo, r.customerName, r.totalRefund, r.refundMethod, r.branchName, r.notes || ''
                ])
              }
            }
          />
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
      <div className="flex border-b border-slate-200 gap-4 text-xs font-bold overflow-x-auto whitespace-nowrap pb-0.5">
        <button
          onClick={() => setActiveTab('invoices')}
          className={`pb-2.5 transition border-b-2 flex items-center gap-1.5 shrink-0 ${
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

          {/* Search and Filters Bar (Styled to match Image 6) */}
          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgba(15,23,42,0.04)] space-y-4">
            {/* Search Input with Filter Icon Button */}
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-4 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search order #, customer name, mobile, phone model, IMEI..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full text-xs pl-11 pr-4 py-2.5 border border-slate-200/90 rounded-2xl bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#1E60D5]/20 focus:border-[#1E60D5] transition"
                />
              </div>

              {/* Blue Filter Button */}
              <button
                type="button"
                className="w-10 h-10 rounded-2xl bg-[#1E60D5] text-white flex items-center justify-center shadow-md shadow-blue-500/20 hover:bg-blue-700 transition shrink-0 cursor-pointer"
                title="Filter Orders"
              >
                <Filter className="w-4 h-4" />
              </button>
            </div>

            {/* Filter Pills: All, Paid, Pending, Customer Types */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentStatusFilter('ALL')}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition cursor-pointer ${
                    paymentStatusFilter === 'ALL'
                      ? 'bg-[#1E60D5] text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  All Orders
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentStatusFilter('PAID')}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition cursor-pointer ${
                    paymentStatusFilter === 'PAID'
                      ? 'bg-[#00B074] text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Paid
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentStatusFilter('PENDING')}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition cursor-pointer ${
                    paymentStatusFilter === 'PENDING'
                      ? 'bg-[#F59E0B] text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Pending Due
                </button>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-bold">Party:</span>
                <select
                  value={customerTypeFilter}
                  onChange={(e) => setCustomerTypeFilter(e.target.value)}
                  className="text-xs font-bold px-3 py-1.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-700 focus:bg-white"
                >
                  <option value="ALL">All Accounts</option>
                  <option value="Retail Customer">Retail Customers</option>
                  <option value="Wholesale Dealer">Wholesale Dealers</option>
                  <option value="Sub Dealer">Sub Dealers</option>
                  <option value="VIP Customer">VIP Customers</option>
                </select>
              </div>
            </div>
          </div>

          {/* Mobile Card List (sm:hidden) */}
          <div className="block sm:hidden space-y-3">
            {filteredSales.length === 0 ? (
              <div className="bg-white p-8 text-center text-slate-400 rounded-2xl border border-slate-200">
                {language === 'bn' ? 'কোনো বিক্রয় রেকর্ড পাওয়া যায়নি' : 'No sales invoices found.'}
              </div>
            ) : (
              filteredSales.map(inv => (
                <div key={inv.id} className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-sm text-slate-900">{inv.invoiceNo}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                          inv.status === 'CANCELLED' ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {inv.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">{formatDate(inv.date)} • {inv.branchName}</p>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => onViewInvoice(inv.invoiceNo)}
                        className="p-2 rounded-xl bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 transition min-h-[38px] min-w-[38px] flex items-center justify-center cursor-pointer active:scale-95"
                        title="Print / View"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {inv.status !== 'CANCELLED' && (
                        <button
                          type="button"
                          onClick={() => handleOpenVoidModal(inv)}
                          className="p-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition min-h-[38px] min-w-[38px] flex items-center justify-center cursor-pointer active:scale-95"
                          title="Void / Cancel"
                        >
                          <Ban className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-900">{inv.customerName}</span>
                      <span className="text-[11px] font-mono text-slate-500">{inv.customerMobile}</span>
                    </div>
                    <div className="text-[11px] text-slate-600 truncate">
                      {inv.items.map(it => `${it.quantity}x ${it.productName}`).join(', ')}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 grid grid-cols-3 gap-2 text-center text-xs font-mono">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-sans">Total</span>
                      <span className="font-bold text-slate-900">{formatBDT(inv.grandTotal)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-sans">Paid</span>
                      <span className="font-bold text-emerald-700">{formatBDT(inv.paidAmount)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-sans">Due</span>
                      <span className={`font-bold ${inv.dueAmount > 0 ? 'text-rose-600' : 'text-slate-400'}`}>
                        {formatBDT(inv.dueAmount)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Desktop Table (hidden sm:block) */}
          <div className="hidden sm:block bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
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
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                          inv.status === 'CANCELLED' ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {inv.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => onViewInvoice(inv.invoiceNo)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 transition cursor-pointer"
                            title="Print / View Invoice"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          {inv.status !== 'CANCELLED' && (
                            <button
                              type="button"
                              onClick={() => handleOpenVoidModal(inv)}
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                              title="Void / Cancel Invoice (Restores IMEIs to stock)"
                            >
                              <Ban className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
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
              onClick={() => {
                setEditingQuotation(null);
                setIsQuotationModalOpen(true);
              }}
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
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => setPrintingQuotation(q)}
                        className="p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded transition"
                        title="Print / View Quotation"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>
                      {q.status !== 'CONVERTED' ? (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingQuotation(q);
                              setIsQuotationModalOpen(true);
                            }}
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded transition"
                            title="Edit Quotation"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleConvertQuote(q.id)}
                            className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-bold transition"
                          >
                            Convert
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete quotation ${q.quoteNo}?`)) {
                                deleteQuotation(q.id);
                                setActionMessage(`Quotation ${q.quoteNo} deleted.`);
                                setTimeout(() => setActionMessage(''), 2500);
                              }
                            }}
                            className="p-1 text-rose-500 hover:bg-rose-50 rounded transition"
                            title="Delete Quotation"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-semibold">Sold</span>
                      )}
                    </div>
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
        quotationToEdit={editingQuotation}
        onClose={() => {
          setIsQuotationModalOpen(false);
          setEditingQuotation(null);
        }}
        onSuccess={(quoteNo) => {
          setActionMessage(`Quotation ${quoteNo} saved successfully!`);
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

      {/* Quotation Print & View Modal */}
      <QuotationPrintModal
        quotation={printingQuotation}
        onClose={() => setPrintingQuotation(null)}
        onConvert={handleConvertQuote}
      />

      {/* In-app Void/Cancel Invoice Modal */}
      {voidModalInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 overflow-hidden animate-in fade-in-50">
            <div className="p-4 bg-rose-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Ban className="w-5 h-5" />
                <h3 className="font-bold text-sm">
                  {language === 'bn' ? 'চালান বাতিল ও পণ্য ফেরত' : 'Void / Cancel Invoice'}
                </h3>
              </div>
              <button 
                type="button" 
                onClick={() => setVoidModalInvoice(null)} 
                className="text-white/80 hover:text-white p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleExecuteVoidInvoice} className="p-5 space-y-4 text-xs">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 space-y-1">
                <p className="font-bold">চালান নং: {voidModalInvoice.invoiceNo}</p>
                <p className="text-[11px] text-amber-800">
                  গ্রাহক: {voidModalInvoice.customerName} • পরিমাণ: {formatBDT(voidModalInvoice.grandTotal)}
                </p>
                <p className="text-[10px] text-amber-700 font-semibold pt-1">
                  ⚠️ এই চালান বাতিল করলে সংশ্লিষ্ট সকল ফোনের আইএমইআই (IMEI) স্বয়ংক্রিয়ভাবে পুনরায় ইনভেন্টরি স্টকে ফেরত আসবে।
                </p>
              </div>

              {voidError && (
                <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-[11px]">
                  {voidError}
                </div>
              )}

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  {language === 'bn' ? 'বাতিলের কারণ লিখুন (আবশ্যক):' : 'Reason for Cancellation (Required):'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={language === 'bn' ? 'যেমন: ভুল এন্ট্রি, গ্রাহক ফেরত নিয়েছেন ইত্যাদি' : 'e.g. Mistake in bill, customer return...'}
                  value={voidReasonInput}
                  onChange={(e) => setVoidReasonInput(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setVoidModalInvoice(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition"
                >
                  {language === 'bn' ? 'বাতিল করুন না' : 'Close'}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl transition shadow-xs flex items-center gap-1.5"
                >
                  <Ban className="w-4 h-4" />
                  <span>{language === 'bn' ? 'চালান বাতিল নিশ্চিত করুন' : 'Confirm Void Invoice'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
