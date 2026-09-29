import React, { useState } from 'react';
import { Search, X, Smartphone, User, FileText, Package, ArrowRight, ShieldCheck } from 'lucide-react';
import { useERP } from '../../services/erpStore';
import { formatBDT, formatDate } from '../../utils/formatters';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectImei?: (imei: string) => void;
  onSelectCustomer?: (customerId: string) => void;
  onSelectInvoice?: (invoiceNo: string) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectImei,
  onSelectCustomer,
  onSelectInvoice
}) => {
  const { globalSearch, language } = useERP();
  const [query, setQuery] = useState('');

  if (!isOpen) return null;

  const results = globalSearch(query);
  const hasResults = 
    results.imeis.length > 0 || 
    results.customers.length > 0 || 
    results.invoices.length > 0 || 
    results.products.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden border border-slate-200">
        {/* Search Input Bar */}
        <div className="p-4 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50">
          <Search className="w-5 h-5 text-emerald-600 shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder={language === 'bn' 
              ? 'আইএমইআই (IMEI), কাস্টমার মোবাইল/নাম, ইনভয়েস নম্বর বা মডেল খুঁজুন...' 
              : 'Search by IMEI (15 digits), Customer Mobile/Name, Invoice #, Model...'}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-base text-slate-800 placeholder-slate-400 focus:outline-none font-medium"
          />
          {query && (
            <button 
              onClick={() => setQuery('')}
              className="text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button 
            onClick={onClose}
            className="px-2.5 py-1 text-xs font-semibold bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg transition-colors"
          >
            ESC
          </button>
        </div>

        {/* Results Area */}
        <div className="max-h-[65vh] overflow-y-auto p-4 space-y-6">
          {!query.trim() ? (
            <div className="text-center py-10 text-slate-400">
              <Smartphone className="w-12 h-12 mx-auto mb-2 text-slate-300 stroke-1" />
              <p className="text-sm font-medium">Type any IMEI, customer name, mobile number, or invoice number</p>
              <p className="text-xs text-slate-400 mt-1">Try: &quot;864209&quot;, &quot;Tanvir&quot;, &quot;01711&quot;, or &quot;INV-2026&quot;</p>
            </div>
          ) : !hasResults ? (
            <div className="text-center py-10 text-slate-500">
              <p className="text-sm font-medium">No records found for &quot;{query}&quot;</p>
              <p className="text-xs text-slate-400 mt-1">Check spelling or search by 15-digit IMEI</p>
            </div>
          ) : (
            <>
              {/* IMEI Matches */}
              {results.imeis.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2 text-xs font-bold uppercase tracking-wider text-emerald-800">
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>IMEI Devices ({results.imeis.length})</span>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {results.imeis.map(im => (
                      <div 
                        key={im.imei1}
                        onClick={() => {
                          if (onSelectImei) onSelectImei(im.imei1);
                          onClose();
                        }}
                        className="p-3 bg-slate-50 hover:bg-emerald-50/70 border border-slate-200 hover:border-emerald-300 rounded-xl cursor-pointer transition flex items-center justify-between group"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-sm font-bold text-slate-900 tracking-wide">{im.imei1}</span>
                            {im.imei2 && <span className="text-xs font-mono text-slate-500">/ {im.imei2}</span>}
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                              im.status === 'IN_STOCK' ? 'bg-emerald-100 text-emerald-800' :
                              im.status === 'SOLD' ? 'bg-blue-100 text-blue-800' :
                              im.status === 'WARRANTY' ? 'bg-amber-100 text-amber-800' :
                              'bg-slate-200 text-slate-700'
                            }`}>
                              {im.status}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 mt-0.5 font-medium">{im.productName} • {im.variantName}</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            Branch: {im.branchName} • Cost: {formatBDT(im.purchaseCost)}
                            {im.customerName && ` • Sold to: ${im.customerName}`}
                          </p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Invoices Matches */}
              {results.invoices.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2 text-xs font-bold uppercase tracking-wider text-blue-800">
                    <FileText className="w-3.5 h-3.5" />
                    <span>Sales Invoices ({results.invoices.length})</span>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {results.invoices.map(inv => (
                      <div 
                        key={inv.id}
                        onClick={() => {
                          if (onSelectInvoice) onSelectInvoice(inv.invoiceNo);
                          onClose();
                        }}
                        className="p-3 bg-slate-50 hover:bg-blue-50/70 border border-slate-200 hover:border-blue-300 rounded-xl cursor-pointer transition flex items-center justify-between group"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm text-slate-900">{inv.invoiceNo}</span>
                            <span className="text-xs text-slate-500">{formatDate(inv.date)}</span>
                            <span className="text-xs font-medium px-2 py-0.5 bg-slate-200 rounded text-slate-700">
                              {inv.customerType}
                            </span>
                          </div>
                          <p className="text-xs text-slate-700 font-medium mt-0.5">
                            {inv.customerName} ({inv.customerMobile})
                          </p>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Total: <strong className="text-slate-800">{formatBDT(inv.grandTotal)}</strong> • Paid: {formatBDT(inv.paidAmount)} • Due: <span className={inv.dueAmount > 0 ? 'text-red-600 font-bold' : 'text-emerald-600 font-medium'}>{formatBDT(inv.dueAmount)}</span>
                          </p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Customer Matches */}
              {results.customers.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2 text-xs font-bold uppercase tracking-wider text-violet-800">
                    <User className="w-3.5 h-3.5" />
                    <span>Customers & Dealers ({results.customers.length})</span>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {results.customers.map(c => (
                      <div 
                        key={c.id}
                        onClick={() => {
                          if (onSelectCustomer) onSelectCustomer(c.id);
                          onClose();
                        }}
                        className="p-3 bg-slate-50 hover:bg-violet-50/70 border border-slate-200 hover:border-violet-300 rounded-xl cursor-pointer transition flex items-center justify-between group"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm text-slate-900">
                              {c.businessName || c.name}
                            </span>
                            {c.businessName && <span className="text-xs text-slate-500">({c.name})</span>}
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-violet-100 text-violet-800 uppercase">
                              {c.customerType}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 font-medium mt-0.5">
                            Mobile: {c.mobile} • Price: {c.priceLevel}
                          </p>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Current Due: <strong className={c.currentDue > 0 ? 'text-rose-600 font-bold' : 'text-slate-700'}>{formatBDT(c.currentDue)}</strong>
                            {c.creditLimit > 0 && ` • Credit Limit: ${formatBDT(c.creditLimit)}`}
                          </p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-violet-600 transition" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Product Matches */}
              {results.products.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2 text-xs font-bold uppercase tracking-wider text-amber-800">
                    <Package className="w-3.5 h-3.5" />
                    <span>Products ({results.products.length})</span>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {results.products.map(p => (
                      <div 
                        key={p.id}
                        className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between"
                      >
                        <div>
                          <span className="font-semibold text-sm text-slate-900">{p.brandName} {p.model}</span>
                          <span className="text-xs text-slate-500 ml-2">({p.category})</span>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {p.variants.map(v => (
                              <span key={v.id} className="text-xs px-2 py-0.5 bg-white border border-slate-200 rounded-md text-slate-700">
                                {v.storage ? `${v.storage} - ${v.color}` : v.color} : {formatBDT(v.retailPrice)} (Stock: {v.currentStock})
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 bg-slate-100 border-t border-slate-200 text-xs text-slate-500 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>MOBILE D-ERP Unified Global Search</span>
          </div>
          <span className="font-mono text-[11px]">Bangladeshi Mobile Retail & Wholesale Hub</span>
        </div>
      </div>
    </div>
  );
};
