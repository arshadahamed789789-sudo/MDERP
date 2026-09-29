import React, { useState } from 'react';
import { X, Printer, Tag, Smartphone, Copy, Check, Eye } from 'lucide-react';
import { useERP } from '../../services/erpStore';
import { formatBDT } from '../../utils/formatters';
import { ProductIMEI } from '../../types/erp';
import { BarcodeSVG } from '../../utils/barcode';

interface BarcodeLabelModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialImei?: ProductIMEI | null;
}

export const BarcodeLabelModal: React.FC<BarcodeLabelModalProps> = ({
  isOpen,
  onClose,
  initialImei
}) => {
  const { imeis, products, businessConfig, language } = useERP();

  const [selectedImeiCode, setSelectedImeiCode] = useState<string>(initialImei?.imei1 || imeis[0]?.imei1 || '');
  const [labelSize, setLabelSize] = useState<'standard' | 'compact'>('standard');
  const [showPrice, setShowPrice] = useState(true);
  const [showWarranty, setShowWarranty] = useState(true);
  const [showImei2, setShowImei2] = useState(true);
  const [copyCount, setCopyCount] = useState(1);

  if (!isOpen) return null;

  const currentImei = imeis.find(i => i.imei1 === selectedImeiCode) || initialImei || imeis[0];
  const currentProduct = currentImei ? products.find(p => p.id === currentImei.productId) : null;
  const currentVariant = currentProduct?.variants.find(v => v.id === currentImei?.variantId);

  const retailPrice = currentVariant?.retailPrice || 0;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl border border-slate-200 overflow-hidden my-auto max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <Tag className="w-5 h-5 text-emerald-400" />
            <div>
              <h2 className="text-sm font-bold">
                {language === 'bn' ? 'আইএমইআই বারকোড লেবেল স্টিকার প্রিন্ট' : 'IMEI Barcode Sticker & Price Tag Generator'}
              </h2>
              <p className="text-[11px] text-slate-400">
                Generate printable barcode labels for phone packaging, boxes, and accessories
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 flex-1 overflow-y-auto">
          {/* Settings Panel (Hidden on Print) */}
          <div className="p-5 bg-slate-50 border-r border-slate-200 space-y-4 print:hidden text-xs">
            <div>
              <label className="font-semibold text-slate-700 mb-1 block">Select Device / IMEI</label>
              <select
                value={selectedImeiCode}
                onChange={(e) => setSelectedImeiCode(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg bg-white truncate"
              >
                {imeis.map(im => (
                  <option key={im.imei1} value={im.imei1}>
                    {im.productName} ({im.imei1}) - {im.status}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 mb-1 block">Label Format</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setLabelSize('standard')}
                  className={`p-2 border rounded-lg text-center font-medium ${
                    labelSize === 'standard' ? 'bg-emerald-600 text-white border-emerald-600 font-bold' : 'bg-white text-slate-700'
                  }`}
                >
                  Standard (50x30mm)
                </button>
                <button
                  type="button"
                  onClick={() => setLabelSize('compact')}
                  className={`p-2 border rounded-lg text-center font-medium ${
                    labelSize === 'compact' ? 'bg-emerald-600 text-white border-emerald-600 font-bold' : 'bg-white text-slate-700'
                  }`}
                >
                  Compact (40x25mm)
                </button>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-200">
              <label className="font-semibold text-slate-700 block">Sticker Elements</label>
              <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                <input
                  type="checkbox"
                  checked={showPrice}
                  onChange={(e) => setShowPrice(e.target.checked)}
                  className="rounded text-emerald-600"
                />
                <span>Include MRP / Selling Price</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                <input
                  type="checkbox"
                  checked={showWarranty}
                  onChange={(e) => setShowWarranty(e.target.checked)}
                  className="rounded text-emerald-600"
                />
                <span>Include Warranty Badge</span>
              </label>
              {currentImei?.imei2 && (
                <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                  <input
                    type="checkbox"
                    checked={showImei2}
                    onChange={(e) => setShowImei2(e.target.checked)}
                    className="rounded text-emerald-600"
                  />
                  <span>Include Dual-SIM (IMEI 2)</span>
                </label>
              )}
            </div>

            <div>
              <label className="font-semibold text-slate-700 mb-1 block">Print Copies</label>
              <input
                type="number"
                min="1"
                max="50"
                value={copyCount}
                onChange={(e) => setCopyCount(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full p-2 border border-slate-300 rounded-lg bg-white"
              />
            </div>

            <div className="pt-3">
              <button
                type="button"
                onClick={handlePrint}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-sm transition"
              >
                <Printer className="w-4 h-4" />
                <span>Print Sticker Labels</span>
              </button>
            </div>
          </div>

          {/* Label Preview (Visible on Screen & Print) */}
          <div className="p-6 md:col-span-2 bg-slate-100 flex flex-col items-center justify-center overflow-y-auto">
            <p className="text-xs text-slate-500 font-medium mb-3 print:hidden">
              Thermal Label Preview ({copyCount} {copyCount === 1 ? 'sticker' : 'stickers'} ready for barcode printer)
            </p>

            <div className="flex flex-wrap gap-4 items-center justify-center max-w-full">
              {Array.from({ length: copyCount }).map((_, idx) => (
                <div
                  key={idx}
                  className={`bg-white border-2 border-dashed border-slate-400 p-3 rounded-lg shadow-sm flex flex-col justify-between ${
                    labelSize === 'standard' ? 'w-64 min-h-44' : 'w-52 min-h-36'
                  }`}
                  style={{ pageBreakInside: 'avoid' }}
                >
                  {/* Shop Branding Header */}
                  <div className="border-b border-slate-300 pb-1 text-center">
                    <h3 className="font-black text-[12px] tracking-tight text-slate-900 uppercase">
                      {businessConfig.name}
                    </h3>
                    <p className="text-[9px] text-slate-500 font-medium">
                      {businessConfig.phone} | {businessConfig.address.slice(0, 26)}
                    </p>
                  </div>

                  {/* Device & Variant Title */}
                  <div className="text-center py-1">
                    <p className="font-bold text-[11px] text-slate-900 leading-tight">
                      {currentImei?.productName}
                    </p>
                    {currentVariant && (
                      <p className="text-[10px] text-slate-600 font-medium">
                        {currentVariant.ram && `${currentVariant.ram}/`}{currentVariant.storage} • {currentVariant.color}
                      </p>
                    )}
                  </div>

                  {/* IMEI 1 Barcode */}
                  <div className="py-1 text-center">
                    <BarcodeSVG
                      value={currentImei?.imei1 || '860192837465019'}
                      width={labelSize === 'standard' ? 190 : 150}
                      height={labelSize === 'standard' ? 32 : 24}
                    />
                  </div>

                  {/* Optional IMEI 2 */}
                  {showImei2 && currentImei?.imei2 && (
                    <div className="py-0.5 text-center">
                      <BarcodeSVG
                        value={currentImei.imei2}
                        width={labelSize === 'standard' ? 190 : 150}
                        height={labelSize === 'standard' ? 24 : 18}
                      />
                    </div>
                  )}

                  {/* Price & Warranty Footer */}
                  <div className="border-t border-slate-200 pt-1 flex items-center justify-between text-[10px]">
                    {showPrice && (
                      <div className="font-bold text-slate-900">
                        MRP: <span className="font-mono text-emerald-800 text-[11px]">{formatBDT(retailPrice)}</span>
                      </div>
                    )}
                    {showWarranty && (
                      <div className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold text-[9px]">
                        1 Yr Warranty
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
