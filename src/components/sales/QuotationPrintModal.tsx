import React, { useState } from 'react';
import { X, Printer, FileText, CheckCircle2, MessageSquare, Copy, Check } from 'lucide-react';
import { useERP } from '../../services/erpStore';
import { formatBDT, formatDate } from '../../utils/formatters';
import { Quotation } from '../../types/erp';
import { shareViaWhatsApp, copyToClipboard } from '../../utils/shareUtils';

interface QuotationPrintModalProps {
  quotation: Quotation | null;
  onClose: () => void;
  onConvert?: (quoteId: string) => void;
}

export const QuotationPrintModal: React.FC<QuotationPrintModalProps> = ({
  quotation,
  onClose,
  onConvert
}) => {
  const { businessConfig, language } = useERP();
  const [copied, setCopied] = useState(false);

  if (!quotation) return null;

  const handlePrint = () => {
    window.print();
  };

  const quoteShareText = `📋 *${businessConfig?.shopName || 'DEALERFLOW HUB'} - দরপ্রস্তাব / Price Quotation*
📄 কোটেশন নং: *${quotation.quoteNo}*
📅 তারিখ: ${formatDate(quotation.date)}
👤 গ্রাহক: *${quotation.customerName}* ${quotation.customerPhone ? `(${quotation.customerPhone})` : ''}

📦 *প্রস্তাবিত আইটেম তালিকা:*
${quotation.items.map((it, idx) => `${idx + 1}. ${it.productModel} (${it.variantName}) x ${it.quantity} = ${formatBDT(it.total)}`).join('\n')}

💰 সর্বমোট অফার মূল্য: *${formatBDT(quotation.grandTotal)}*
⏳ মেয়াদ: ৭ কার্যদিবস প্রযোজ্য`;

  const handleCopyText = async () => {
    const success = await copyToClipboard(quoteShareText);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl border border-slate-200 overflow-hidden my-auto max-h-[95vh] flex flex-col">
        {/* Controls Header */}
        <div className="p-3 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 print:hidden shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono font-bold text-amber-400">{quotation.quoteNo}</span>
            <span className="text-xs text-slate-300 font-semibold">Price Quotation / দরপ্রস্তাব পত্র</span>
            {quotation.status === 'CONVERTED' ? (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Converted to Invoice
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                Active Quotation
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => shareViaWhatsApp(quoteShareText, quotation.customerPhone)}
              className="px-2.5 py-1.5 bg-[#25D366] hover:bg-[#20ba59] text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
              title="WhatsApp এ কোটেশন শেয়ার করুন"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">WhatsApp</span>
            </button>
            <button
              type="button"
              onClick={handleCopyText}
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              title="কোটেশন টেক্সট কপি করুন"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{copied ? 'কপি হয়েছে' : 'কপি'}</span>
            </button>
            {quotation.status !== 'CONVERTED' && onConvert && (
              <button
                onClick={() => {
                  onConvert(quotation.id);
                  onClose();
                }}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Convert to Invoice</span>
              </button>
            )}
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 border border-slate-700 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Quotation</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Body */}
        <div className="overflow-y-auto flex-1 bg-white text-slate-800 p-8 text-xs font-sans">
          {/* Header */}
          <div className="border-b-2 border-slate-800 pb-5">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-black tracking-tight text-slate-900">
                  {businessConfig.name}
                </h1>
                <p className="text-xs font-semibold text-emerald-700 mt-0.5">
                  {businessConfig.tagline}
                </p>
                <p className="text-[11px] text-slate-600 mt-1 max-w-sm">
                  {businessConfig.address}
                </p>
                <div className="flex flex-wrap gap-x-4 text-[11px] text-slate-600 mt-1">
                  <span>Phone: <strong>{businessConfig.phone}</strong></span>
                  <span>Trade Lic: <strong>{businessConfig.tradeLicense}</strong></span>
                  <span>BIN: <strong>{businessConfig.taxNumber}</strong></span>
                </div>
              </div>

              <div className="text-right">
                <span className="inline-block px-3 py-1 bg-amber-600 text-white text-xs font-bold uppercase tracking-wider rounded-md">
                  PRICE QUOTATION / দরপ্রস্তাব
                </span>
                <p className="font-mono text-base font-bold text-slate-900 mt-2">{quotation.quoteNo}</p>
                <p className="text-xs text-slate-600">Date: {formatDate(quotation.date)}</p>
                <p className="text-xs text-amber-700 font-bold">Valid Until: {formatDate(quotation.validUntil)}</p>
              </div>
            </div>
          </div>

          {/* Party Details */}
          <div className="my-5 p-3.5 bg-slate-50 border border-slate-200 rounded-xl grid grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Quotation Prepared For:</p>
              <h3 className="font-bold text-slate-900 text-sm mt-0.5">{quotation.customerName}</h3>
              <p className="text-slate-600 font-mono mt-0.5">Mobile: {quotation.customerMobile}</p>
              <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded font-bold bg-slate-200 text-slate-700">
                Category: {quotation.customerType}
              </span>
            </div>

            <div className="text-right">
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Issuing Branch:</p>
              <p className="font-bold text-slate-900 mt-0.5">{quotation.branchName}</p>
              <p className="text-slate-500 text-[11px] mt-1">Status: {quotation.status}</p>
            </div>
          </div>

          {/* Items Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden mb-5">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-3 w-8 text-center">#</th>
                  <th className="py-2.5 px-3">Item Description</th>
                  <th className="py-2.5 px-3">Variant / Color</th>
                  <th className="py-2.5 px-3 text-center">Qty</th>
                  <th className="py-2.5 px-3 text-right">Quoted Rate</th>
                  <th className="py-2.5 px-3 text-right">Total (৳)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {quotation.items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="py-2.5 px-3 text-center text-slate-400">{idx + 1}</td>
                    <td className="py-2.5 px-3 font-bold text-slate-900">{item.productName}</td>
                    <td className="py-2.5 px-3 text-slate-600">{item.variantName}</td>
                    <td className="py-2.5 px-3 text-center font-mono font-bold">{item.quantity}</td>
                    <td className="py-2.5 px-3 text-right font-mono">{formatBDT(item.unitPrice)}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                      {formatBDT(item.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Financial Calculation */}
          <div className="flex justify-end mb-6">
            <div className="w-72 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span className="font-mono font-semibold">{formatBDT(quotation.subtotal)}</span>
              </div>
              {quotation.discount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Special Discount:</span>
                  <span className="font-mono font-semibold">-{formatBDT(quotation.discount)}</span>
                </div>
              )}
              <div className="flex justify-between font-black text-sm pt-2 border-t-2 border-slate-800 text-slate-900">
                <span>Grand Total:</span>
                <span className="font-mono text-emerald-800">{formatBDT(quotation.grandTotal)}</span>
              </div>
            </div>
          </div>

          {/* Quotation Terms */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl mb-12 text-[11px] text-slate-600 space-y-1">
            <p className="font-bold text-slate-800 uppercase tracking-wider mb-1">Terms & Conditions (শর্তাবলী):</p>
            <p>1. This quotation is valid until <strong>{formatDate(quotation.validUntil)}</strong>. Prices may fluctuate afterwards.</p>
            <p>2. Stock allocation will be reserved only upon issuance of official confirmed purchase invoice.</p>
            <p>3. Brand warranty is provided directly by authorized manufacturer service centers in Bangladesh.</p>
            {quotation.notes && <p className="italic text-slate-700">Notes: {quotation.notes}</p>}
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-2 gap-8 pt-8 border-t border-slate-200">
            <div className="text-center">
              <div className="border-t border-dashed border-slate-400 w-44 mx-auto pt-1 text-slate-500 font-semibold">
                Customer Acceptance
              </div>
            </div>
            <div className="text-center">
              <div className="border-t border-dashed border-slate-400 w-44 mx-auto pt-1 text-slate-800 font-bold">
                Authorized Signatory ({businessConfig.name})
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
