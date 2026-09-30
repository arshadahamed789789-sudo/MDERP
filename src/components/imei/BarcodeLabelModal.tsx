import React, { useState } from 'react';
import { 
  X, Printer, Tag, Smartphone, Copy, Check, Eye, Scan, 
  Layers, CheckSquare, Square, RefreshCw, AlertCircle, Sparkles, Building2
} from 'lucide-react';
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
  const { imeis, products, businessConfig, language, currentBranchId } = useERP();

  // Mode: 'single' (one device with multiple copies) or 'batch' (multiple selected devices)
  const [generationMode, setGenerationMode] = useState<'single' | 'batch'>('single');
  const [selectedImeiCode, setSelectedImeiCode] = useState<string>(initialImei?.imei1 || imeis[0]?.imei1 || '');
  const [selectedBatchImeis, setSelectedBatchImeis] = useState<string[]>(
    initialImei ? [initialImei.imei1] : imeis.slice(0, 4).map(i => i.imei1)
  );

  // Label Formats
  const [labelSize, setLabelSize] = useState<'standard' | 'compact' | 'a4_sheet'>('standard');
  const [copiesPerItem, setCopiesPerItem] = useState(1);

  // Elements to include
  const [showShopHeader, setShowShopHeader] = useState(true);
  const [showPrice, setShowPrice] = useState(true);
  const [showWarranty, setShowWarranty] = useState(true);
  const [showImei2, setShowImei2] = useState(true);
  const [showSerial, setShowSerial] = useState(true);

  // Live Barcode Gun Scanner Simulator Test
  const [testScannerInput, setTestScannerInput] = useState('');
  const [testScanResult, setTestScanResult] = useState<{ match: boolean; message: string } | null>(null);

  if (!isOpen) return null;

  // Filter in-stock devices for current branch
  const availableImeis = imeis.filter(i => 
    currentBranchId === 'all' || i.branchId === currentBranchId
  );

  const currentSingleImei = imeis.find(i => i.imei1 === selectedImeiCode) || initialImei || imeis[0];

  // Resolve items to render
  const itemsToPrint: ProductIMEI[] = generationMode === 'single'
    ? (currentSingleImei ? Array(copiesPerItem).fill(currentSingleImei) : [])
    : selectedBatchImeis.flatMap(code => {
        const item = imeis.find(i => i.imei1 === code);
        return item ? Array(copiesPerItem).fill(item) : [];
      });

  const handlePrint = () => {
    window.print();
  };

  // Toggle batch item selection
  const handleToggleBatchImei = (code: string) => {
    setSelectedBatchImeis(prev => 
      prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]
    );
  };

  // Select all in-stock
  const handleSelectAllInStock = () => {
    const inStock = availableImeis.filter(i => i.status === 'IN_STOCK').map(i => i.imei1);
    setSelectedBatchImeis(inStock);
  };

  // Test scan handler
  const handleTestScanKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const scannedVal = testScannerInput.trim();
      if (!scannedVal) return;

      const found = imeis.find(i => i.imei1 === scannedVal || i.imei2 === scannedVal || i.serialNumber === scannedVal);
      if (found) {
        setTestScanResult({
          match: true,
          message: `✓ Scan Verified! Matched ${found.productName} (Status: ${found.status})`
        });
      } else {
        setTestScanResult({
          match: false,
          message: `✗ Scanned Code "${scannedVal}" not found in current IMEI database.`
        });
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/75 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl border border-slate-200 overflow-hidden my-auto max-h-[96vh] flex flex-col">
        {/* Modal Header (Hidden on Print) */}
        <div className="p-3.5 sm:p-4 bg-slate-900 text-white flex items-center justify-between print:hidden shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Tag className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold">
                  {language === 'bn' ? 'আইএমইআই বারকোড লেবেল স্টিকার প্রিন্টিং সিস্টেম' : 'IMEI Barcode Sticker & Label Generator'}
                </h2>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-mono font-bold px-1.5 py-0.5 rounded border border-emerald-500/30">
                  Code 128 Spec
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                {language === 'bn' 
                  ? 'থার্মাল বারকোড প্রিন্টার (50x30mm) এবং A4 স্টিকার শিটের জন্য প্রস্তুত' 
                  : 'Ready for 50x30mm thermal rolls and A4 multi-label sticker paper'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-emerald-950/40"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'প্রিন্ট করুন' : 'Print Stickers'}</span>
            </button>
            <button 
              type="button" 
              onClick={onClose} 
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-y-auto">
          {/* Settings Control Panel (Hidden on Print) */}
          <div className="lg:col-span-4 p-4 sm:p-5 bg-slate-50 border-r border-slate-200 space-y-4 print:hidden text-xs overflow-y-auto">
            
            {/* Mode Selector */}
            <div>
              <label className="font-bold text-slate-700 mb-1.5 block">Printing Mode</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setGenerationMode('single')}
                  className={`p-2 rounded-xl border text-center font-bold transition ${
                    generationMode === 'single'
                      ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Single Device
                </button>
                <button
                  type="button"
                  onClick={() => setGenerationMode('batch')}
                  className={`p-2 rounded-xl border text-center font-bold transition ${
                    generationMode === 'batch'
                      ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Batch Multi-Sticker
                </button>
              </div>
            </div>

            {/* Device Selection (Single Mode) */}
            {generationMode === 'single' ? (
              <div>
                <label className="font-semibold text-slate-700 mb-1 block">Select Device / IMEI</label>
                <select
                  value={selectedImeiCode}
                  onChange={(e) => setSelectedImeiCode(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-xl bg-white text-slate-900 focus:outline-none focus:border-emerald-500"
                >
                  {availableImeis.map(im => (
                    <option key={im.imei1} value={im.imei1}>
                      {im.productName} ({im.imei1}) - [{im.status}]
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              /* Batch Multi-Device Picker */
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-slate-700">
                    Select Devices ({selectedBatchImeis.length} selected)
                  </label>
                  <button
                    type="button"
                    onClick={handleSelectAllInStock}
                    className="text-[11px] text-emerald-600 font-bold hover:underline"
                  >
                    Select All In-Stock
                  </button>
                </div>
                <div className="max-h-36 overflow-y-auto border border-slate-200 rounded-xl bg-white p-2 divide-y divide-slate-100">
                  {availableImeis.map(im => {
                    const isChecked = selectedBatchImeis.includes(im.imei1);
                    return (
                      <label 
                        key={im.imei1} 
                        className="flex items-center gap-2 py-1.5 px-1 hover:bg-slate-50 cursor-pointer text-[11px]"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleBatchImei(im.imei1)}
                          className="rounded text-emerald-600"
                        />
                        <div className="min-w-0 flex-1">
                          <span className="font-bold text-slate-800 truncate block">{im.productName}</span>
                          <span className="font-mono text-slate-500 text-[10px]">{im.imei1} • {im.status}</span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Label Format / Paper Type */}
            <div>
              <label className="font-semibold text-slate-700 mb-1 block">Label / Paper Format</label>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => setLabelSize('standard')}
                  className={`p-2 border rounded-xl text-center text-[11px] font-semibold transition ${
                    labelSize === 'standard' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-700'
                  }`}
                >
                  <span className="block font-bold">Standard</span>
                  <span className="text-[9px] opacity-80">50x30mm Roll</span>
                </button>
                <button
                  type="button"
                  onClick={() => setLabelSize('compact')}
                  className={`p-2 border rounded-xl text-center text-[11px] font-semibold transition ${
                    labelSize === 'compact' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-700'
                  }`}
                >
                  <span className="block font-bold">Compact</span>
                  <span className="text-[9px] opacity-80">40x25mm Roll</span>
                </button>
                <button
                  type="button"
                  onClick={() => setLabelSize('a4_sheet')}
                  className={`p-2 border rounded-xl text-center text-[11px] font-semibold transition ${
                    labelSize === 'a4_sheet' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-700'
                  }`}
                >
                  <span className="block font-bold">A4 Sheet</span>
                  <span className="text-[9px] opacity-80">3x8 Sheet Grid</span>
                </button>
              </div>
            </div>

            {/* Content Options */}
            <div className="space-y-2 pt-2 border-t border-slate-200">
              <label className="font-bold text-slate-700 block text-[11px] uppercase tracking-wider">
                Sticker Elements to Print
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                <input
                  type="checkbox"
                  checked={showShopHeader}
                  onChange={(e) => setShowShopHeader(e.target.checked)}
                  className="rounded text-emerald-600"
                />
                <span>Shop Branding & Address Header</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                <input
                  type="checkbox"
                  checked={showPrice}
                  onChange={(e) => setShowPrice(e.target.checked)}
                  className="rounded text-emerald-600"
                />
                <span>Selling Price (MRP ৳)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                <input
                  type="checkbox"
                  checked={showWarranty}
                  onChange={(e) => setShowWarranty(e.target.checked)}
                  className="rounded text-emerald-600"
                />
                <span>Official Warranty Badge</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                <input
                  type="checkbox"
                  checked={showImei2}
                  onChange={(e) => setShowImei2(e.target.checked)}
                  className="rounded text-emerald-600"
                />
                <span>Dual-SIM (IMEI 2) Barcode</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                <input
                  type="checkbox"
                  checked={showSerial}
                  onChange={(e) => setShowSerial(e.target.checked)}
                  className="rounded text-emerald-600"
                />
                <span>Serial Number (S/N)</span>
              </label>
            </div>

            {/* Copies per Item */}
            <div>
              <label className="font-semibold text-slate-700 mb-1 block">
                {generationMode === 'single' ? 'Number of Sticker Copies' : 'Copies per Device'}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={copiesPerItem}
                  onChange={(e) => setCopiesPerItem(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-24 p-2 border border-slate-300 rounded-xl bg-white font-mono text-center font-bold"
                />
                <span className="text-[11px] text-slate-500">
                  Total stickers: <strong>{itemsToPrint.length}</strong>
                </span>
              </div>
            </div>

            {/* Barcode Scanner Gun Test Simulator */}
            <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-2">
              <label className="font-bold text-slate-800 flex items-center gap-1.5 text-[11px]">
                <Scan className="w-3.5 h-3.5 text-emerald-600" />
                <span>Test Barcode Gun Scanner</span>
              </label>
              <p className="text-[10px] text-slate-400">
                Scan the barcode on screen with your hardware scanner gun or type to test:
              </p>
              <input
                type="text"
                placeholder="Scan or type IMEI & hit Enter..."
                value={testScannerInput}
                onChange={(e) => setTestScannerInput(e.target.value)}
                onKeyDown={handleTestScanKeyDown}
                className="w-full p-2 text-xs font-mono border border-slate-300 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:border-emerald-500"
              />
              {testScanResult && (
                <p className={`text-[10px] font-bold ${testScanResult.match ? 'text-emerald-700' : 'text-rose-600'}`}>
                  {testScanResult.message}
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={handlePrint}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-md transition"
            >
              <Printer className="w-4 h-4" />
              <span>{language === 'bn' ? 'স্টিকার প্রিন্ট করুন' : 'Print Sticker Labels'}</span>
            </button>
          </div>

          {/* ================= PRINTABLE AREA & SCREEN PREVIEW ================= */}
          <div className="lg:col-span-8 p-4 sm:p-6 bg-slate-100 flex flex-col items-center justify-start overflow-y-auto">
            {/* Screen Banner Note */}
            <div className="w-full mb-3 p-2.5 bg-white rounded-xl border border-slate-200 text-xs text-slate-600 flex items-center justify-between print:hidden">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  <strong>{itemsToPrint.length}</strong> {labelSize === 'a4_sheet' ? 'labels on A4 Sheet layout' : 'labels ready for thermal printer'}
                </span>
              </div>
              <span className="text-[11px] font-mono text-slate-500 font-semibold">
                Paper: {labelSize === 'standard' ? '50x30mm' : labelSize === 'compact' ? '40x25mm' : 'A4 Grid'}
              </span>
            </div>

            {/* Container for Print & Screen with ID for print styles */}
            <div 
              id="printable-barcode" 
              className={`w-full flex ${
                labelSize === 'a4_sheet' 
                  ? 'flex-wrap gap-2.5 justify-start p-4 bg-white shadow-xs rounded-xl' 
                  : 'flex-wrap gap-3 justify-center'
              }`}
            >
              {itemsToPrint.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  No devices selected to print.
                </div>
              ) : (
                itemsToPrint.map((item, idx) => {
                  const prod = products.find(p => p.id === item.productId);
                  const variant = prod?.variants.find(v => v.id === item.variantId);
                  const retailPrice = variant?.retailPrice || 0;

                  return (
                    <div
                      key={idx}
                      className={`barcode-sticker-item bg-white border border-slate-300 print:border-black rounded-lg p-2.5 shadow-xs flex flex-col justify-between select-none ${
                        labelSize === 'standard'
                          ? 'w-60 min-h-40 thermal-page-break'
                          : labelSize === 'compact'
                          ? 'w-52 min-h-32 thermal-page-break'
                          : 'w-[31%] min-h-36'
                      }`}
                      style={{ 
                        pageBreakInside: 'avoid',
                        breakInside: 'avoid'
                      }}
                    >
                      {/* Shop Header */}
                      {showShopHeader && (
                        <div className="border-b border-slate-300 pb-0.5 text-center leading-tight">
                          <h3 className="font-black text-[11px] tracking-tight text-slate-900 uppercase truncate">
                            {businessConfig.name}
                          </h3>
                          <p className="text-[8px] text-slate-500 font-mono truncate">
                            {businessConfig.phone} • {businessConfig.address.slice(0, 28)}
                          </p>
                        </div>
                      )}

                      {/* Device & Variant */}
                      <div className="text-center py-0.5 leading-none">
                        <p className="font-extrabold text-[10.5px] text-slate-900 truncate">
                          {item.productName}
                        </p>
                        {variant && (
                          <p className="text-[9px] text-slate-600 font-semibold mt-0.5">
                            {variant.ram ? `${variant.ram}/` : ''}{variant.storage} • {variant.color}
                          </p>
                        )}
                      </div>

                      {/* IMEI 1 Barcode */}
                      <div className="py-0.5 flex flex-col items-center justify-center">
                        <BarcodeSVG
                          value={item.imei1}
                          width={labelSize === 'standard' ? 180 : labelSize === 'compact' ? 145 : 155}
                          height={labelSize === 'standard' ? 30 : 22}
                          showText={true}
                          textClassName="font-mono text-[9px] tracking-widest text-slate-950 font-black mt-0.5"
                        />
                      </div>

                      {/* Optional IMEI 2 Barcode */}
                      {showImei2 && item.imei2 && (
                        <div className="py-0.5 flex flex-col items-center justify-center border-t border-slate-100">
                          <div className="text-[8px] font-bold text-slate-500 uppercase tracking-tighter">SIM 2:</div>
                          <BarcodeSVG
                            value={item.imei2}
                            width={labelSize === 'standard' ? 170 : labelSize === 'compact' ? 135 : 145}
                            height={labelSize === 'standard' ? 22 : 16}
                            showText={true}
                            textClassName="font-mono text-[8.5px] tracking-wider text-slate-950 font-bold"
                          />
                        </div>
                      )}

                      {/* Footer Specs: Price, Serial, Warranty */}
                      <div className="border-t border-slate-200 pt-1 flex items-center justify-between text-[9px] leading-none">
                        {showPrice && (
                          <div className="font-bold text-slate-900">
                            MRP: <span className="font-mono font-black text-emerald-800 text-[10px]">{formatBDT(retailPrice)}</span>
                          </div>
                        )}

                        {showSerial && item.serialNumber && (
                          <div className="font-mono text-slate-500 text-[8px] truncate max-w-[80px]">
                            S/N: {item.serialNumber}
                          </div>
                        )}

                        {showWarranty && (
                          <div className="px-1 py-0.5 bg-emerald-100 text-emerald-900 rounded font-black text-[8px] uppercase">
                            1 Yr Warranty
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
