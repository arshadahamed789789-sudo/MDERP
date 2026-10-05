import React, { useState } from 'react';
import { X, Printer, Download, CheckCircle, Share2, ShieldCheck, Receipt, FileText, MessageSquare, Copy, Check } from 'lucide-react';
import { useERP } from '../../services/erpStore';
import { formatBDT, formatDate } from '../../utils/formatters';
import { shareViaWhatsApp, copyToClipboard, shareViaNavigator } from '../../utils/shareUtils';

interface InvoicePrintModalProps {
  invoiceNo: string | null;
  onClose: () => void;
}

export const InvoicePrintModal: React.FC<InvoicePrintModalProps> = ({
  invoiceNo,
  onClose
}) => {
  const { sales, businessConfig } = useERP();
  const [printLayout, setPrintLayout] = useState<'a4' | 'thermal'>('a4');
  const [copied, setCopied] = useState(false);

  if (!invoiceNo) return null;

  const invoice = sales.find(s => s.invoiceNo === invoiceNo);
  if (!invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  const invoiceShareText = `🧾 *${businessConfig?.name || 'DEALERFLOW HUB'} - বিক্রয় মেমো*
📄 ইনভয়েস নং: *${invoice.invoiceNo}*
📅 তারিখ: ${formatDate(invoice.date)}
👤 ক্রেতা: *${invoice.customerName}* ${invoice.customerMobile ? `(${invoice.customerMobile})` : ''}

🛍️ *পণ্যের বিবরণ:*
${invoice.items.map((it, idx) => `${idx + 1}. ${it.productName} (${it.variantName}) x ${it.quantity} = ${formatBDT(it.total)}${it.imeiList?.length ? `\n   IMEI: ${it.imeiList.join(', ')}` : ''}`).join('\n')}

💵 সর্বমোট মূল্য: ${formatBDT(invoice.grandTotal)}
✅ পরিশোধিত: ${formatBDT(invoice.paidAmount)}
${invoice.dueAmount > 0 ? `⚠️ *বকেয়া পাওনা: ${formatBDT(invoice.dueAmount)}*` : '🎉 *পরিশোধ সম্পন্ন (Full Paid)*'}

ধন্যবাদ আমাদের সাথে থাকার জন্য!`;

  const handleCopyText = async () => {
    const success = await copyToClipboard(invoiceShareText);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
      <div className={`bg-white rounded-2xl shadow-2xl w-full ${printLayout === 'thermal' ? 'max-w-md' : 'max-w-3xl'} border border-slate-200 overflow-hidden my-auto max-h-[95vh] flex flex-col transition-all duration-200`}>
        {/* Controls Header */}
        <div className="p-3 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 print:hidden shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono font-bold text-emerald-400">{invoice.invoiceNo}</span>
            {/* Format Switcher */}
            <div className="flex bg-slate-800 p-0.5 rounded-lg border border-slate-700 text-xs">
              <button
                onClick={() => setPrintLayout('a4')}
                className={`px-2.5 py-1 rounded font-medium flex items-center gap-1 ${printLayout === 'a4' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>A4 Tax Invoice</span>
              </button>
              <button
                onClick={() => setPrintLayout('thermal')}
                className={`px-2.5 py-1 rounded font-medium flex items-center gap-1 ${printLayout === 'thermal' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
              >
                <Receipt className="w-3.5 h-3.5" />
                <span>80mm POS Thermal</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => shareViaWhatsApp(invoiceShareText, invoice.customerMobile)}
              className="px-2.5 py-1.5 bg-[#25D366] hover:bg-[#20ba59] text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
              title="WhatsApp এ ইনভয়েস শেয়ার করুন"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">WhatsApp</span>
            </button>
            <button
              type="button"
              onClick={handleCopyText}
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              title="ইনভয়েস টেক্সট কপি করুন"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{copied ? 'কপি হয়েছে' : 'কপি'}</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
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
        <div id="printable-invoice" className="overflow-y-auto flex-1 bg-white text-slate-800">
          {printLayout === 'a4' ? (
            /* 1. STANDARD A4 BANGLADESH TAX INVOICE */
            <div className="p-8 text-xs font-sans">
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
                    <span className="inline-block px-3 py-1 bg-slate-900 text-white text-xs font-bold uppercase tracking-wider rounded-md">
                      Sales Invoice / মেমো
                    </span>
                    <p className="font-mono text-base font-bold text-slate-900 mt-2">{invoice.invoiceNo}</p>
                    <p className="text-xs text-slate-600">Date: {formatDate(invoice.date)}</p>
                    <p className="text-[11px] text-slate-500 mt-1">Branch: {invoice.branchName}</p>
                  </div>
                </div>
              </div>

              {/* Customer Info */}
              <div className="py-4 border-b border-slate-200 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Bill To (ক্রেতার তথ্য):</p>
                  <p className="text-sm font-bold text-slate-900 mt-0.5">{invoice.customerName}</p>
                  <p className="text-xs text-slate-700 font-medium">Mobile: {invoice.customerMobile}</p>
                  <span className="inline-block text-[10px] px-1.5 py-0.2 bg-slate-100 text-slate-700 rounded font-semibold mt-1">
                    {invoice.customerType}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sales Representative:</p>
                  <p className="text-xs font-semibold text-slate-900 mt-0.5">{invoice.salesmanName}</p>
                  <p className="text-[11px] text-slate-500">Status: <strong className="text-emerald-700">{invoice.status}</strong></p>
                </div>
              </div>

              {/* Items Table */}
              <div className="py-4">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b-2 border-slate-800 text-[11px] font-bold text-slate-700 uppercase">
                      <th className="py-2 px-1 w-10 text-center">SL</th>
                      <th className="py-2 px-2">Description of Goods</th>
                      <th className="py-2 px-2">IMEI / Serial</th>
                      <th className="py-2 px-2 text-center w-14">Qty</th>
                      <th className="py-2 px-2 text-right w-24">Rate</th>
                      <th className="py-2 px-2 text-right w-28">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-xs">
                    {invoice.items.map((it, idx) => (
                      <tr key={idx}>
                        <td className="py-2.5 px-1 text-center font-mono text-slate-500">{idx + 1}</td>
                        <td className="py-2.5 px-2">
                          <p className="font-bold text-slate-900">{it.productName}</p>
                          <p className="text-[11px] text-slate-500">{it.variantName}</p>
                        </td>
                        <td className="py-2.5 px-2">
                          {it.imeiList && it.imeiList.length > 0 ? (
                            <div className="space-y-0.5">
                              {it.imeiList.map(im => (
                                <span key={im} className="block font-mono text-[10px] font-bold text-slate-700">
                                  IMEI: {im}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-[11px] text-slate-400 italic">Non-IMEI Item</span>
                          )}
                        </td>
                        <td className="py-2.5 px-2 text-center font-mono font-semibold">{it.quantity}</td>
                        <td className="py-2.5 px-2 text-right font-mono">{formatBDT(it.unitPrice)}</td>
                        <td className="py-2.5 px-2 text-right font-mono font-bold text-slate-900">
                          {formatBDT(it.total)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div className="pt-2 border-t border-slate-200 grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Payment Breakdown (পরিশোধের বিবরণ):</p>
                  {invoice.payments.length > 0 ? (
                    <div className="space-y-1">
                      {invoice.payments.map((p, idx) => (
                        <div key={idx} className="flex justify-between text-[11px] bg-slate-50 p-1.5 rounded border border-slate-200">
                          <span>{p.method} ({p.accountName}) {p.trxId && `Trx: ${p.trxId}`}</span>
                          <strong className="font-mono text-slate-900">{formatBDT(p.amount)}</strong>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">Full credit sale</p>
                  )}

                  {invoice.notes && (
                    <div className="text-[11px] text-slate-600 bg-amber-50/70 p-2 rounded border border-amber-200 mt-2">
                      <strong>Notes:</strong> {invoice.notes}
                    </div>
                  )}
                </div>

                <div className="space-y-1.5 text-xs text-right">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal:</span>
                    <span className="font-mono">{formatBDT(invoice.subtotal)}</span>
                  </div>
                  {invoice.discount > 0 && (
                    <div className="flex justify-between text-emerald-700">
                      <span>Discount:</span>
                      <span className="font-mono">-{formatBDT(invoice.discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-sm text-slate-900 pt-1 border-t border-slate-300">
                    <span>Net Payable:</span>
                    <span className="font-mono text-base">{formatBDT(invoice.grandTotal)}</span>
                  </div>
                  <div className="flex justify-between text-emerald-800 font-semibold">
                    <span>Paid Amount:</span>
                    <span className="font-mono">{formatBDT(invoice.paidAmount)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-xs pt-1 border-t border-slate-200">
                    <span className="text-slate-800">Balance Due (বাকি):</span>
                    <span className={`font-mono ${invoice.dueAmount > 0 ? 'text-rose-600 text-sm' : 'text-slate-500'}`}>
                      {formatBDT(invoice.dueAmount)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Terms */}
              <div className="mt-8 pt-4 border-t border-slate-200 bg-slate-50 p-3 rounded-xl">
                <div className="flex items-center gap-1.5 text-slate-800 font-bold text-[11px] mb-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>ওয়ারেন্টি ও বিক্রয় নীতিমালা (Terms & Warranty Conditions):</span>
                </div>
                <p className="text-[10px] text-slate-600 leading-relaxed">
                  {businessConfig.warrantyTerms} {businessConfig.invoiceFooterNote}
                </p>
              </div>

              {/* Signatures */}
              <div className="mt-12 pt-6 grid grid-cols-2 gap-8 text-center text-xs text-slate-600">
                <div>
                  <div className="border-t border-slate-400 w-40 mx-auto"></div>
                  <p className="mt-1 font-semibold">Customer Signature</p>
                </div>
                <div>
                  <div className="border-t border-slate-400 w-40 mx-auto"></div>
                  <p className="mt-1 font-semibold">Authorized Signatory</p>
                  <p className="text-[10px] text-slate-400">For {businessConfig.name}</p>
                </div>
              </div>
            </div>
          ) : (
            /* 2. 80MM POS THERMAL MINI RECEIPT */
            <div className="p-6 text-slate-900 font-mono text-[11px] leading-relaxed max-w-[320px] mx-auto">
              <div className="text-center pb-2 border-b border-dashed border-slate-400">
                <h2 className="text-base font-black tracking-tight uppercase">{businessConfig.name}</h2>
                <p className="text-[10px] mt-0.5">{businessConfig.address.split(',')[0]}</p>
                <p className="text-[10px]">Tel: {businessConfig.phone}</p>
                <p className="text-[10px] mt-1 font-bold">*** CASH MEMO ***</p>
              </div>

              <div className="py-2 border-b border-dashed border-slate-400 space-y-0.5 text-[10px]">
                <div className="flex justify-between">
                  <span>INV: {invoice.invoiceNo}</span>
                  <span>{formatDate(invoice.date)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Cust: {invoice.customerName.split(' ')[0]}</span>
                  <span>{invoice.customerMobile}</span>
                </div>
                <div>Rep: {invoice.salesmanName}</div>
              </div>

              {/* Itemized */}
              <div className="py-2 border-b border-dashed border-slate-400 space-y-2">
                {invoice.items.map((it, i) => (
                  <div key={i}>
                    <div className="flex justify-between font-bold">
                      <span className="truncate max-w-[190px]">{it.quantity}x {it.productName}</span>
                      <span>{formatBDT(it.total)}</span>
                    </div>
                    {it.imeiList.map(im => (
                      <div key={im} className="text-[9px] text-slate-600 pl-2">
                        &gt; IMEI: {im}
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="py-2 border-b border-dashed border-slate-400 space-y-1">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{formatBDT(invoice.subtotal)}</span>
                </div>
                {invoice.discount > 0 && (
                  <div className="flex justify-between">
                    <span>Discount:</span>
                    <span>-{formatBDT(invoice.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between font-black text-xs pt-1 border-t border-slate-300">
                  <span>NET TOTAL:</span>
                  <span>{formatBDT(invoice.grandTotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>PAID:</span>
                  <span>{formatBDT(invoice.paidAmount)}</span>
                </div>
                {invoice.dueAmount > 0 && (
                  <div className="flex justify-between font-bold text-rose-600">
                    <span>DUE:</span>
                    <span>{formatBDT(invoice.dueAmount)}</span>
                  </div>
                )}
              </div>

              {/* Barcode graphic & footer */}
              <div className="pt-3 text-center space-y-1.5">
                <div className="font-mono tracking-widest font-black text-xs py-1 border border-slate-300 rounded bg-slate-50">
                  ||||| | |||| ||| ||||||| |||
                </div>
                <p className="text-[9px] leading-tight text-slate-600">
                  ৭ দিনের রিপ্লেসমেন্ট ও ১ বছরের ব্র্যান্ড সার্ভিস ওয়ারেন্টি।
                </p>
                <p className="text-[10px] font-bold">ধন্যবাদ, আবার আসবেন!</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
