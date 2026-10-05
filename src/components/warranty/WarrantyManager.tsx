import React, { useState } from 'react';
import { 
  ShieldAlert, Search, Plus, ShieldCheck, Clock, CheckCircle2, 
  X, AlertTriangle, Smartphone, User, ArrowRight, Pencil
} from 'lucide-react';
import { useERP } from '../../services/erpStore';
import { formatDate } from '../../utils/formatters';
import { WarrantyClaim } from '../../types/erp';
import { EditWarrantyModal } from './EditWarrantyModal';
import { ShareExportButtons } from '../common/ShareExportButtons';

export const WarrantyManager: React.FC = () => {
  const { 
    businessConfig, warrantyClaims, imeis, createWarrantyClaim, updateWarrantyStatus, language 
  } = useERP();

  const [searchImeiQuery, setSearchImeiQuery] = useState('');
  const [lookupResult, setLookupResult] = useState<any>(null);

  // New claim fields
  const [claimCustomerName, setClaimCustomerName] = useState('');
  const [claimPhone, setClaimPhone] = useState('');
  const [claimIssue, setClaimIssue] = useState('');
  const [claimMessage, setClaimMessage] = useState('');
  const [editingClaim, setEditingClaim] = useState<WarrantyClaim | null>(null);

  // Handle live IMEI lookup
  const handleLookup = () => {
    if (!searchImeiQuery.trim()) return;
    const match = imeis.find(i => i.imei1 === searchImeiQuery.trim() || i.imei2 === searchImeiQuery.trim());
    if (match) {
      setLookupResult(match);
      setClaimCustomerName(match.customerName || '');
    } else {
      setLookupResult('NOT_FOUND');
    }
  };

  const handleRegisterClaim = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lookupResult || lookupResult === 'NOT_FOUND' || !claimIssue.trim()) return;

    const res = createWarrantyClaim({
      imei: lookupResult.imei1,
      customerName: claimCustomerName,
      customerPhone: claimPhone,
      problemDescription: claimIssue
    });

    if (res.success) {
      setClaimMessage(`Claim #${res.claimNo} successfully generated! Device sent for authorized diagnostics.`);
      setClaimIssue('');
      setClaimPhone('');
      setLookupResult(null);
      setSearchImeiQuery('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Share & Export */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            {language === 'bn' ? 'ওয়ারেন্টি চেক ও সার্ভিস ক্লেইম' : 'IMEI Warranty Check & Service Claims'}
          </h1>
          <p className="text-xs text-slate-500">
            {language === 'bn' 
              ? 'আইএমইআই দিয়ে ওয়ারেন্টি যাচাই এবং রিপ্লেসমেন্ট ও সার্ভিসিং ট্র্যাকিং' 
              : 'Instant IMEI warranty validity verification, customer dispute resolution, and RMA service tracking.'}
          </p>
        </div>
        <div className="self-start sm:self-auto">
          <ShareExportButtons
            title={language === 'bn' ? 'ওয়ারেন্টি সার্ভিস ও RMA ক্লেইম খতিয়ান' : 'Warranty Claims & Service Report'}
            subtitle={`Total Claims: ${warrantyClaims.length}`}
            summaryMetrics={[
              { label: 'Total Claims', value: `${warrantyClaims.length}` },
              { label: 'Pending Diagnostics', value: `${warrantyClaims.filter(w => w.status === 'PENDING').length}` },
              { label: 'In Repair', value: `${warrantyClaims.filter(w => w.status === 'IN_REPAIR').length}` },
              { label: 'Delivered', value: `${warrantyClaims.filter(w => w.status === 'DELIVERED').length}` }
            ]}
            shareText={`🛡️ *${language === 'bn' ? 'ওয়ারেন্টি ও সার্ভিসিং ক্লেইম রিপোর্ট' : 'Warranty & RMA Service Report'}*\n🏛️ *${businessConfig?.name || 'DEALERFLOW ERP'}*\n📅 ${language === 'bn' ? 'তারিখ' : 'Date'}: ${new Date().toLocaleDateString('en-US', { dateStyle: 'medium' })}\n\n📱 *সার্ভিস স্ট্যাটাস:*\n• মোট ওয়ারেন্টি ক্লেইম: ${warrantyClaims.length} টি\n• অপেক্ষমান (Pending): ${warrantyClaims.filter(w => w.status === 'PENDING').length} টি\n• মেরামত চলছে (In Repair): ${warrantyClaims.filter(w => w.status === 'IN_REPAIR').length} টি\n• হস্তান্তর সম্পন্ন (Delivered): ${warrantyClaims.filter(w => w.status === 'DELIVERED').length} টি\n\nGenerated via DEALERFLOW Hub.`}
            csvData={{
              filename: 'warranty_rma_claims',
              headers: ['Claim No', 'Date', 'IMEI', 'Product Model', 'Customer Name', 'Phone', 'Problem Reported', 'Status', 'Resolution Notes'],
              rows: warrantyClaims.map(w => [
                w.claimNo, w.date, w.imei, w.productName, w.customerName,
                w.customerPhone, w.problemDescription, w.status, w.resolutionNotes || ''
              ])
            }}
          />
        </div>
      </div>

      {/* IMEI Warranty Lookup & Claim Generator Card */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <h2 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>IMEI Warranty Verification & New Claim Registration</span>
        </h2>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Enter 15-digit IMEI number (e.g. 864209061001242)..."
              value={searchImeiQuery}
              onChange={(e) => setSearchImeiQuery(e.target.value)}
              className="w-full text-xs font-mono pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-emerald-500"
            />
          </div>
          <button
            type="button"
            onClick={handleLookup}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Verify Warranty</span>
          </button>
        </div>

        {claimMessage && (
          <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{claimMessage}</span>
          </div>
        )}

        {/* Lookup Result Box */}
        {lookupResult === 'NOT_FOUND' ? (
          <div className="mt-4 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>This IMEI was not sold or procured through MOBILE D-ERP database records.</span>
          </div>
        ) : lookupResult && (
          <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Product Details</span>
                <p className="font-bold text-slate-900 mt-0.5">{lookupResult.productName}</p>
                <p className="text-[11px] text-slate-500">{lookupResult.variantName}</p>
              </div>

              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Sale Date & Customer</span>
                <p className="font-semibold text-slate-800 mt-0.5">{lookupResult.customerName || 'Retail Customer'}</p>
                <p className="text-[11px] text-slate-500 font-mono">Invoice: {lookupResult.saleInvoiceId || 'Showroom Stock'}</p>
              </div>

              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Warranty Expiry</span>
                <p className="font-mono font-bold text-emerald-700 mt-0.5">
                  {formatDate(lookupResult.warrantyExpiryDate) || '12 Months from sale'}
                </p>
                <span className="text-[10px] px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold uppercase">
                  Warranty Active
                </span>
              </div>
            </div>

            {/* Claim Entry Form */}
            <form onSubmit={handleRegisterClaim} className="pt-3 border-t border-slate-200 space-y-3">
              <span className="font-bold text-xs text-slate-800 block">Open RMA / Warranty Claim:</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  required
                  placeholder="Customer Phone Number *"
                  value={claimPhone}
                  onChange={(e) => setClaimPhone(e.target.value)}
                  className="p-2 border rounded-lg text-xs font-mono bg-white"
                />
                <input
                  type="text"
                  required
                  placeholder="Problem Description (e.g. touch unresponsive, battery drain) *"
                  value={claimIssue}
                  onChange={(e) => setClaimIssue(e.target.value)}
                  className="p-2 border rounded-lg text-xs bg-white"
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5"
                >
                  <span>Submit Warranty Claim</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Active Claims Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-3 bg-slate-50 border-b border-slate-200 flex justify-between items-center text-xs">
          <span className="font-bold text-slate-700">Ongoing Warranty Service Claims ({warrantyClaims.length})</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-3">Claim #</th>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">IMEI</th>
                <th className="py-2.5 px-3">Device & Customer</th>
                <th className="py-2.5 px-3">Problem Reported</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {warrantyClaims.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No active warranty claims.
                  </td>
                </tr>
              ) : (
                warrantyClaims.map(claim => (
                  <tr key={claim.id} className="hover:bg-slate-50/70">
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{claim.claimNo}</td>
                    <td className="py-2.5 px-3 text-slate-500 whitespace-nowrap">{formatDate(claim.date)}</td>
                    <td className="py-2.5 px-3 font-mono font-semibold text-slate-900">{claim.imei}</td>
                    <td className="py-2.5 px-3">
                      <p className="font-semibold text-slate-800">{claim.productName}</p>
                      <p className="text-[11px] text-slate-500">{claim.customerName} ({claim.customerPhone})</p>
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 max-w-xs">{claim.problemDescription}</td>
                    <td className="py-2.5 px-3">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                        claim.status === 'PENDING' ? 'bg-amber-100 text-amber-800' :
                        claim.status === 'IN_REPAIR' ? 'bg-blue-100 text-blue-800' :
                        claim.status === 'DELIVERED' ? 'bg-emerald-100 text-emerald-800' :
                        'bg-slate-200 text-slate-700'
                      }`}>
                        {claim.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setEditingClaim(claim)}
                          className="p-1 hover:bg-slate-100 text-slate-600 hover:text-slate-900 rounded transition"
                          title="Edit Claim & Status"
                        >
                          <Pencil className="w-3.5 h-3.5 text-blue-600" />
                        </button>
                        {claim.status !== 'DELIVERED' && (
                          <button
                            onClick={() => updateWarrantyStatus(claim.id, 'DELIVERED', 'Repaired and returned to customer in working condition')}
                            className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded font-semibold text-[11px]"
                          >
                            Mark Delivered
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit / Update Warranty Claim Modal */}
      <EditWarrantyModal
        isOpen={!!editingClaim}
        claim={editingClaim}
        onClose={() => setEditingClaim(null)}
      />
    </div>
  );
};
