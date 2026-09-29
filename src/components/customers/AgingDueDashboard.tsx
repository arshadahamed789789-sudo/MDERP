import React, { useState } from 'react';
import { 
  Clock, AlertTriangle, Send, Copy, Check, Users, 
  ArrowRight, ShieldAlert, Phone, Wallet
} from 'lucide-react';
import { useERP } from '../../services/erpStore';
import { formatBDT } from '../../utils/formatters';
import { Customer } from '../../types/erp';

interface AgingDueDashboardProps {
  onCollectDue: (customer: Customer) => void;
}

export const AgingDueDashboard: React.FC<AgingDueDashboardProps> = ({
  onCollectDue
}) => {
  const { customers, businessConfig, language } = useERP();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Categorize customers with due into aging buckets based on customer type / due amount
  const dueCustomers = customers.filter(c => c.currentDue > 0);

  // Group into aging tiers
  const tierCurrent = dueCustomers.filter(c => c.currentDue < 30000);
  const tier8to15 = dueCustomers.filter(c => c.currentDue >= 30000 && c.currentDue < 60000);
  const tier16to30 = dueCustomers.filter(c => c.currentDue >= 60000 && c.currentDue < 100000);
  const tierOver30 = dueCustomers.filter(c => c.currentDue >= 100000);

  const sumCurrent = tierCurrent.reduce((acc, c) => acc + c.currentDue, 0);
  const sum8to15 = tier8to15.reduce((acc, c) => acc + c.currentDue, 0);
  const sum16to30 = tier16to30.reduce((acc, c) => acc + c.currentDue, 0);
  const sumOver30 = tierOver30.reduce((acc, c) => acc + c.currentDue, 0);
  const grandTotalDue = sumCurrent + sum8to15 + sum16to30 + sumOver30;

  const handleCopySMS = (cust: Customer) => {
    const text = language === 'bn'
      ? `সম্মানিত ${cust.name}, ${businessConfig.name} থেকে জানানো যাচ্ছে যে আপনার বর্তমান বকেয়া ৳${cust.currentDue.toLocaleString()}। অনুগ্রহ করে দ্রুত পরিশোধের অনুরোধ জানাচ্ছি। যোগাযোগ: ${businessConfig.phone}`
      : `Dear ${cust.name}, gentle reminder from ${businessConfig.name}. Your outstanding due balance is BDT ${cust.currentDue.toLocaleString()}. Please arrange payment soon. Phone: ${businessConfig.phone}`;
    
    navigator.clipboard.writeText(text);
    setCopiedId(cust.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Clock className="w-5 h-5 text-rose-600" />
          <span>Customer & Dealer Due Aging Analysis (বাকি আদায় ড্যাশবোর্ড)</span>
        </h2>
        <p className="text-xs text-slate-500">
          Visual aging buckets and automated SMS/WhatsApp payment reminder texts for Bangladeshi dealers.
        </p>
      </div>

      {/* Aging Buckets Ribbon */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-white border border-slate-200">
          <div className="flex justify-between text-xs font-semibold text-slate-500">
            <span>Current (1–7 Days)</span>
            <span className="text-emerald-700 font-bold">{tierCurrent.length} parties</span>
          </div>
          <p className="text-lg font-black font-mono text-emerald-800 mt-1">{formatBDT(sumCurrent)}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Regular checkout credit</p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200">
          <div className="flex justify-between text-xs font-semibold text-slate-500">
            <span>8–15 Days Due</span>
            <span className="text-blue-700 font-bold">{tier8to15.length} parties</span>
          </div>
          <p className="text-lg font-black font-mono text-blue-800 mt-1">{formatBDT(sum8to15)}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Standard dealer credit cycle</p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200">
          <div className="flex justify-between text-xs font-semibold text-slate-500">
            <span>16–30 Days Due</span>
            <span className="text-amber-700 font-bold">{tier16to30.length} parties</span>
          </div>
          <p className="text-lg font-black font-mono text-amber-800 mt-1">{formatBDT(sum16to30)}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Follow-up reminder needed</p>
        </div>

        <div className="p-4 rounded-xl bg-rose-50/60 border border-rose-200">
          <div className="flex justify-between text-xs font-semibold text-rose-800">
            <span>30+ Days Overdue</span>
            <span className="text-rose-700 font-bold">{tierOver30.length} parties</span>
          </div>
          <p className="text-lg font-black font-mono text-rose-700 mt-1">{formatBDT(sumOver30)}</p>
          <p className="text-[10px] text-rose-600 mt-0.5">High credit risk parties</p>
        </div>
      </div>

      {/* Due Customer Table with Reminder Action */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center text-xs">
          <span className="font-bold text-slate-900">Outstanding Balance & Reminder Actions</span>
          <span className="font-mono font-bold text-rose-600">Total Outstanding: {formatBDT(grandTotalDue)}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-600 font-semibold border-b uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-3">Party Name</th>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3">Mobile Phone</th>
                <th className="py-2.5 px-3 text-right">Credit Limit</th>
                <th className="py-2.5 px-3 text-right">Current Due</th>
                <th className="py-2.5 px-3 text-center">SMS / WhatsApp</th>
                <th className="py-2.5 px-3 text-center">Collect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {dueCustomers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    All customer dues are fully cleared!
                  </td>
                </tr>
              ) : (
                dueCustomers.map(cust => (
                  <tr key={cust.id} className="hover:bg-slate-50">
                    <td className="py-3 px-3">
                      <p className="font-bold text-slate-900">{cust.businessName || cust.name}</p>
                      {cust.businessName && <p className="text-[11px] text-slate-500">{cust.name}</p>}
                    </td>
                    <td className="py-3 px-3">
                      <span className="text-[10px] px-2 py-0.5 rounded font-bold uppercase bg-slate-100 text-slate-700">
                        {cust.customerType}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-600">{cust.mobile}</td>
                    <td className="py-3 px-3 text-right font-mono text-slate-600">
                      {cust.creditLimit > 0 ? formatBDT(cust.creditLimit) : 'No Limit'}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-rose-600 text-sm">
                      {formatBDT(cust.currentDue)}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => handleCopySMS(cust)}
                        className={`px-2.5 py-1 rounded text-[11px] font-semibold flex items-center gap-1 mx-auto transition ${
                          copiedId === cust.id 
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                        }`}
                        title="Copy payment reminder message for WhatsApp or SMS"
                      >
                        {copiedId === cust.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span>Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3 text-slate-500" />
                            <span>Copy SMS</span>
                          </>
                        )}
                      </button>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => onCollectDue(cust)}
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold text-[11px] transition shadow-xs"
                      >
                        Receive Due
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
