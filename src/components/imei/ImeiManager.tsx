import React, { useState } from 'react';
import { 
  Smartphone, Search, Filter, ShieldCheck, CheckCircle2, 
  ArrowRight, Clock, User, Building, Truck, AlertCircle, Tag
} from 'lucide-react';
import { useERP } from '../../services/erpStore';
import { formatBDT, formatDate } from '../../utils/formatters';
import { ImeiStatus, ProductIMEI } from '../../types/erp';
import { BarcodeLabelModal } from './BarcodeLabelModal';

export const ImeiManager: React.FC = () => {
  const { imeis, language, currentBranchId } = useERP();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | ImeiStatus>('ALL');
  const [selectedImei, setSelectedImei] = useState<ProductIMEI | null>(null);
  const [showBarcodeModal, setShowBarcodeModal] = useState(false);
  const [barcodeTargetImei, setBarcodeTargetImei] = useState<ProductIMEI | null>(null);

  const filteredImeis = imeis
    .filter(i => currentBranchId === 'all' || i.branchId === currentBranchId)
    .filter(i => {
      const q = searchQuery.toLowerCase();
      const matchSearch = 
        i.imei1.includes(q) ||
        (i.imei2 && i.imei2.includes(q)) ||
        (i.serialNumber && i.serialNumber.toLowerCase().includes(q)) ||
        i.productName.toLowerCase().includes(q) ||
        (i.customerName && i.customerName.toLowerCase().includes(q));
      
      const matchStatus = statusFilter === 'ALL' || i.status === statusFilter;
      return matchSearch && matchStatus;
    });

  // Calculate status counts
  const totalCount = imeis.length;
  const inStockCount = imeis.filter(i => i.status === 'IN_STOCK').length;
  const soldCount = imeis.filter(i => i.status === 'SOLD').length;
  const warrantyCount = imeis.filter(i => i.status === 'WARRANTY').length;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            {language === 'bn' ? 'আইএমইআই (IMEI) লাইফসাইকেল ট্র্যাকার' : 'IMEI Device Lifecycle Tracker'}
          </h1>
          <p className="text-xs text-slate-500">
            {language === 'bn' 
              ? 'প্রতিটি ফোনের আলাদা আইএমইআই, ক্রয়ের উৎস, বর্তমান লোকেশন ও বিক্রয় ইতিহাস' 
              : 'Track individual mobile devices from supplier purchase to customer sale and warranty claims.'}
          </p>
        </div>
        <button
          onClick={() => {
            setBarcodeTargetImei(selectedImei || imeis[0]);
            setShowBarcodeModal(true);
          }}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 self-start sm:self-auto shadow-sm"
        >
          <Tag className="w-4 h-4 text-emerald-400" />
          <span>{language === 'bn' ? 'বারকোড লেবেল স্টিকার প্রিন্ট' : 'Generate Barcode Labels'}</span>
        </button>
      </div>

      {/* KPI Status Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={() => setStatusFilter('ALL')}
          className={`p-3 rounded-xl border text-left transition ${statusFilter === 'ALL' ? 'bg-slate-900 text-white border-slate-900 shadow-sm' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'}`}
        >
          <p className="text-[10px] font-bold uppercase tracking-wider opacity-75">All Devices</p>
          <p className="text-xl font-black font-mono mt-0.5">{totalCount}</p>
        </button>

        <button
          onClick={() => setStatusFilter('IN_STOCK')}
          className={`p-3 rounded-xl border text-left transition ${statusFilter === 'IN_STOCK' ? 'bg-emerald-700 text-white border-emerald-700 shadow-sm' : 'bg-white text-emerald-800 border-slate-200 hover:bg-emerald-50'}`}
        >
          <p className="text-[10px] font-bold uppercase tracking-wider opacity-75">In Stock (দোকানে আছে)</p>
          <p className="text-xl font-black font-mono mt-0.5">{inStockCount}</p>
        </button>

        <button
          onClick={() => setStatusFilter('SOLD')}
          className={`p-3 rounded-xl border text-left transition ${statusFilter === 'SOLD' ? 'bg-blue-700 text-white border-blue-700 shadow-sm' : 'bg-white text-blue-800 border-slate-200 hover:bg-blue-50'}`}
        >
          <p className="text-[10px] font-bold uppercase tracking-wider opacity-75">Sold (বিক্রি হয়েছে)</p>
          <p className="text-xl font-black font-mono mt-0.5">{soldCount}</p>
        </button>

        <button
          onClick={() => setStatusFilter('WARRANTY')}
          className={`p-3 rounded-xl border text-left transition ${statusFilter === 'WARRANTY' ? 'bg-amber-600 text-white border-amber-600 shadow-sm' : 'bg-white text-amber-800 border-slate-200 hover:bg-amber-50'}`}
        >
          <p className="text-[10px] font-bold uppercase tracking-wider opacity-75">Under Warranty / Repair</p>
          <p className="text-xl font-black font-mono mt-0.5">{warrantyCount}</p>
        </button>
      </div>

      {/* Main Content Layout: Grid of IMEIs + Detailed History Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: IMEI Search & Table */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white p-3 rounded-xl border border-slate-200 flex items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search IMEI 1, IMEI 2, Serial, or Model..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs pl-9 pr-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="text-xs font-semibold p-2 border border-slate-200 rounded-lg bg-slate-50"
            >
              <option value="ALL">All Status</option>
              <option value="IN_STOCK">IN_STOCK</option>
              <option value="SOLD">SOLD</option>
              <option value="WARRANTY">WARRANTY</option>
              <option value="RETURNED">RETURNED</option>
            </select>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto max-h-[60vh]">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider sticky top-0 z-10">
                  <tr>
                    <th className="py-2.5 px-3">IMEI 1 / Serial</th>
                    <th className="py-2.5 px-3">Product Model</th>
                    <th className="py-2.5 px-3">Branch Location</th>
                    <th className="py-2.5 px-3 text-right">Cost (৳)</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                    <th className="py-2.5 px-3 text-center">Audit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {filteredImeis.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        No IMEI records found matching query.
                      </td>
                    </tr>
                  ) : (
                    filteredImeis.map(im => (
                      <tr 
                        key={im.imei1} 
                        onClick={() => setSelectedImei(im)}
                        className={`hover:bg-slate-50 cursor-pointer transition ${selectedImei?.imei1 === im.imei1 ? 'bg-emerald-50/70 border-l-4 border-l-emerald-600' : ''}`}
                      >
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                          {im.imei1}
                          {im.imei2 && <span className="block text-[10px] text-slate-400">IMEI 2: {im.imei2}</span>}
                          {im.serialNumber && <span className="block text-[10px] text-slate-400">S/N: {im.serialNumber}</span>}
                        </td>
                        <td className="py-2.5 px-3">
                          <p className="font-semibold text-slate-900">{im.productName}</p>
                          <p className="text-[11px] text-slate-500">{im.variantName}</p>
                        </td>
                        <td className="py-2.5 px-3 text-slate-600">
                          {im.branchName}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-semibold text-slate-900">
                          {formatBDT(im.purchaseCost)}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                            im.status === 'IN_STOCK' ? 'bg-emerald-100 text-emerald-800' :
                            im.status === 'SOLD' ? 'bg-blue-100 text-blue-800' :
                            im.status === 'WARRANTY' ? 'bg-amber-100 text-amber-800' :
                            'bg-slate-200 text-slate-700'
                          }`}>
                            {im.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedImei(im);
                            }}
                            className="px-2 py-1 bg-slate-100 hover:bg-emerald-100 text-slate-700 hover:text-emerald-800 rounded font-semibold text-[11px]"
                          >
                            Trace
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

        {/* Right 1 Col: Complete Device Lifecycle Timeline */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
          <div className="border-b border-slate-100 pb-3 mb-4 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-emerald-600" />
              <span>Device Lifecycle Timeline</span>
            </h2>
            {selectedImei && (
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                selectedImei.status === 'IN_STOCK' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
              }`}>
                {selectedImei.status}
              </span>
            )}
          </div>

          {!selectedImei ? (
            <div className="py-16 text-center text-slate-400">
              <Smartphone className="w-12 h-12 mx-auto mb-2 text-slate-300 stroke-1" />
              <p className="text-xs font-semibold">Select an IMEI from the list to view its complete genealogy.</p>
              <p className="text-[11px] text-slate-400 mt-1">Purchase → Inventory → Sale → Warranty claim history</p>
            </div>
          ) : (
            <div className="space-y-4 text-xs">
              {/* Device Header */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <p className="font-mono text-sm font-bold text-slate-900 tracking-wider">
                  IMEI: {selectedImei.imei1}
                </p>
                {selectedImei.imei2 && (
                  <p className="font-mono text-xs text-slate-500">IMEI 2: {selectedImei.imei2}</p>
                )}
                <p className="font-semibold text-slate-800 mt-1">
                  {selectedImei.productName} ({selectedImei.variantName})
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Current Branch: <strong>{selectedImei.branchName}</strong>
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setBarcodeTargetImei(selectedImei);
                    setShowBarcodeModal(true);
                  }}
                  className="w-full mt-2 py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition"
                >
                  <Tag className="w-3.5 h-3.5" />
                  <span>Print Barcode Sticker for this Phone</span>
                </button>
              </div>

              {/* Lifecycle Steps */}
              <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                {/* Step 1: Procurement / Purchase */}
                <div className="relative">
                  <div className="absolute -left-6 top-0 w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold">
                    1
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 block">Purchased & Received</span>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Date: {formatDate(selectedImei.purchaseDate)} • Bill: {selectedImei.purchaseInvoiceId}
                    </p>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      Supplier: <strong>{selectedImei.supplierName}</strong>
                    </p>
                    <p className="text-[11px] text-slate-600 mt-0.5 font-mono">
                      Unit Landed Cost: <strong>{formatBDT(selectedImei.purchaseCost)}</strong>
                    </p>
                  </div>
                </div>

                {/* Step 2: Inventory Status */}
                <div className="relative">
                  <div className={`absolute -left-6 top-0 w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold text-white ${
                    selectedImei.status === 'IN_STOCK' ? 'bg-emerald-600' : 'bg-slate-400'
                  }`}>
                    2
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 block">Inventory Stocking</span>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Stocked in: {selectedImei.branchName}
                    </p>
                    <p className="text-[11px] text-emerald-700 font-semibold mt-0.5">
                      {selectedImei.status === 'IN_STOCK' ? 'Currently Available for Retail / Wholesale Sale' : 'Dispatched from active stock'}
                    </p>
                  </div>
                </div>

                {/* Step 3: Sales (if sold) */}
                <div className="relative">
                  <div className={`absolute -left-6 top-0 w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold text-white ${
                    selectedImei.saleInvoiceId ? 'bg-emerald-600' : 'bg-slate-300'
                  }`}>
                    3
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 block">Sold & Invoiced</span>
                    {selectedImei.saleInvoiceId ? (
                      <div className="space-y-0.5 mt-0.5">
                        <p className="text-[11px] text-slate-500">
                          Date: {formatDate(selectedImei.saleDate)} • Invoice: <strong className="text-slate-800 font-mono">{selectedImei.saleInvoiceId}</strong>
                        </p>
                        <p className="text-[11px] text-slate-700">
                          Sold To: <strong>{selectedImei.customerName}</strong>
                        </p>
                        {selectedImei.salePrice && (
                          <p className="text-[11px] text-emerald-700 font-mono font-semibold">
                            Sale Price: {formatBDT(selectedImei.salePrice)}
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-[11px] text-slate-400 italic mt-0.5">Not yet sold (In showroom/warehouse stock)</p>
                    )}
                  </div>
                </div>

                {/* Step 4: Warranty Status */}
                <div className="relative">
                  <div className={`absolute -left-6 top-0 w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold text-white ${
                    selectedImei.warrantyExpiryDate ? 'bg-teal-600' : 'bg-slate-300'
                  }`}>
                    4
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 block">Warranty Period</span>
                    {selectedImei.warrantyExpiryDate ? (
                      <p className="text-[11px] text-slate-600 mt-0.5">
                        Valid until: <strong>{formatDate(selectedImei.warrantyExpiryDate)}</strong> (Official Warranty)
                      </p>
                    ) : (
                      <p className="text-[11px] text-slate-400 italic mt-0.5">Warranty activates upon customer invoice creation</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Barcode & Label Print Modal */}
      <BarcodeLabelModal
        isOpen={showBarcodeModal}
        onClose={() => setShowBarcodeModal(false)}
        initialImei={barcodeTargetImei}
      />
    </div>
  );
};
