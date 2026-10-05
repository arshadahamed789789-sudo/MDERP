import React, { useState } from 'react';
import { 
  X, Share2, Download, Printer, Copy, Check, 
  MessageSquare, Smartphone, FileSpreadsheet, Send, FileText, CheckCircle2
} from 'lucide-react';
import { 
  shareViaWhatsApp, copyToClipboard, shareViaNative, 
  printReportDocument, ReportPrintData 
} from '../../utils/shareUtils';
import { exportToCSV } from '../../utils/exportToCsv';
import { useERP } from '../../services/erpStore';

export interface ShareExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  summaryMetrics?: { label: string; value: string; color?: string }[];
  shareText: string;
  csvData?: {
    filename: string;
    headers: string[];
    rows: (string | number | undefined | null)[][];
  };
  printData?: ReportPrintData;
}

export const ShareExportModal: React.FC<ShareExportModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  summaryMetrics = [],
  shareText,
  csvData,
  printData
}) => {
  const { businessConfig, currentBranchName, language } = useERP();
  const [copied, setCopied] = useState(false);
  const [customNote, setCustomNote] = useState('');
  const [activeTab, setActiveTab] = useState<'share' | 'preview'>('share');

  if (!isOpen) return null;

  const fullShareText = customNote.trim() 
    ? `${shareText}\n\n📝 নোট / মন্তব্য:\n${customNote.trim()}`
    : shareText;

  const handleCopy = async () => {
    const ok = await copyToClipboard(fullShareText);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleWhatsApp = () => {
    shareViaWhatsApp(fullShareText);
  };

  const handleNativeShare = async () => {
    const res = await shareViaNative({
      title,
      text: fullShareText
    });
    if (res === 'copied') {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleDownloadCsv = () => {
    if (csvData) {
      exportToCSV(csvData.filename, csvData.headers, csvData.rows);
    }
  };

  const handlePrint = () => {
    if (printData) {
      printReportDocument({
        ...printData,
        companyName: businessConfig.name,
        branchName: currentBranchName
      });
    } else if (csvData) {
      printReportDocument({
        title,
        subtitle,
        companyName: businessConfig.name,
        branchName: currentBranchName,
        metrics: summaryMetrics,
        headers: csvData.headers,
        rows: csvData.rows
      });
    } else {
      window.print();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in-50">
      <div 
        className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black tracking-tight flex items-center gap-2">
                <span>{language === 'bn' ? 'ডাটা এক্সপোর্ট ও শেয়ার' : 'Export & Share Center'}</span>
                <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  Owner/Admin
                </span>
              </h2>
              <p className="text-xs text-slate-400 truncate max-w-xs sm:max-w-md">
                {title} {subtitle ? `• ${subtitle}` : ''}
              </p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 text-xs">
          {/* Summary Metric Chips */}
          {summaryMetrics.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {summaryMetrics.map((m, idx) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    {m.label}
                  </span>
                  <span className="text-base font-black font-mono text-slate-900 mt-0.5 block">
                    {m.value}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Action Grid: 4 Core Capabilities */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* 1. WhatsApp Share */}
            <button
              type="button"
              onClick={handleWhatsApp}
              className="p-3.5 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 transition-all duration-200 active:scale-95 flex flex-col items-center text-center gap-2 cursor-pointer shadow-xs group"
            >
              <div className="w-10 h-10 rounded-2xl bg-[#25D366] text-white flex items-center justify-center shadow-md shadow-emerald-500/20 group-hover:scale-110 transition-transform">
                <Send className="w-5 h-5 -rotate-45 ml-0.5" />
              </div>
              <div>
                <span className="font-black text-xs block text-slate-900">
                  {language === 'bn' ? 'হোয়াটসঅ্যাপ' : 'WhatsApp'}
                </span>
                <span className="text-[10px] text-slate-500 font-medium">
                  {language === 'bn' ? 'এক ক্লিকে মেসেজ' : 'Direct Message'}
                </span>
              </div>
            </button>

            {/* 2. Copy Text Briefing */}
            <button
              type="button"
              onClick={handleCopy}
              className="p-3.5 rounded-2xl bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 transition-all duration-200 active:scale-95 flex flex-col items-center text-center gap-2 cursor-pointer shadow-xs group"
            >
              <div className="w-10 h-10 rounded-2xl bg-[#1E60D5] text-white flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-110 transition-transform">
                {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              </div>
              <div>
                <span className="font-black text-xs block text-slate-900">
                  {copied ? (language === 'bn' ? 'কপি হয়েছে!' : 'Copied!') : (language === 'bn' ? 'টেক্সট কপি' : 'Copy Text')}
                </span>
                <span className="text-[10px] text-slate-500 font-medium">
                  {language === 'bn' ? 'ক্লিপবোর্ডে কপি' : 'To Clipboard'}
                </span>
              </div>
            </button>

            {/* 3. Export CSV / Excel */}
            <button
              type="button"
              onClick={handleDownloadCsv}
              disabled={!csvData}
              className={`p-3.5 rounded-2xl border transition-all duration-200 active:scale-95 flex flex-col items-center text-center gap-2 shadow-xs group ${
                csvData 
                  ? 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-200 cursor-pointer' 
                  : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
              }`}
            >
              <div className="w-10 h-10 rounded-2xl bg-[#F59E0B] text-white flex items-center justify-center shadow-md shadow-amber-500/20 group-hover:scale-110 transition-transform">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <span className="font-black text-xs block text-slate-900">
                  {language === 'bn' ? 'এক্সেল / CSV' : 'Export CSV'}
                </span>
                <span className="text-[10px] text-slate-500 font-medium">
                  {language === 'bn' ? 'ফাইল ডাউনলোড' : 'Excel Ready'}
                </span>
              </div>
            </button>

            {/* 4. Print / PDF Document */}
            <button
              type="button"
              onClick={handlePrint}
              className="p-3.5 rounded-2xl bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 transition-all duration-200 active:scale-95 flex flex-col items-center text-center gap-2 cursor-pointer shadow-xs group"
            >
              <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-md shadow-purple-500/20 group-hover:scale-110 transition-transform">
                <Printer className="w-5 h-5" />
              </div>
              <div>
                <span className="font-black text-xs block text-slate-900">
                  {language === 'bn' ? 'প্রিন্ট / PDF' : 'Print / PDF'}
                </span>
                <span className="text-[10px] text-slate-500 font-medium">
                  {language === 'bn' ? 'কাগজে প্রিন্ট' : 'Formatted Paper'}
                </span>
              </div>
            </button>
          </div>

          {/* Optional: Add custom note to report before sending */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 flex items-center justify-between text-[11px]">
              <span>{language === 'bn' ? 'মালিক / অ্যাডমিনের জন্য বিশেষ নোট যোগ করুন (ঐচ্ছিক):' : 'Add Executive Note for Owner/Admin (Optional):'}</span>
              <span className="text-slate-400 font-normal">Appends to message</span>
            </label>
            <input
              type="text"
              placeholder={language === 'bn' ? 'যেমন: আজকের ক্যাশ কাউন্টার ঠিক সময়ে ক্লোজ করা হয়েছে...' : 'e.g. Today evening collection completed...'}
              value={customNote}
              onChange={e => setCustomNote(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:border-[#00B074] outline-none"
            />
          </div>

          {/* Formatted Message Preview */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-700 text-[11px]">
                {language === 'bn' ? 'শেয়ার মেসেজের লাইভ প্রিভিউ (Message Preview):' : 'Live Report Text Preview:'}
              </span>
              <button
                type="button"
                onClick={handleNativeShare}
                className="text-xs font-bold text-[#1E60D5] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>{language === 'bn' ? 'ডিভাইস শেয়ার মেনু' : 'Device Share Sheet'}</span>
              </button>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-900 text-slate-100 font-mono text-[11px] leading-relaxed max-h-56 overflow-y-auto whitespace-pre-wrap select-all border border-slate-800 shadow-inner">
              {fullShareText}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-slate-500 font-medium">
            {language === 'bn' ? '✓ দ্রুত মালিক ও পার্টনারদের সাথে ব্যবসায়িক তথ্য বিনিময়' : '✓ Instant business data sharing for Owners & Admins'}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-200 font-bold text-xs transition cursor-pointer"
            >
              {language === 'bn' ? 'বন্ধ করুন' : 'Close'}
            </button>
            <button
              type="button"
              onClick={handleWhatsApp}
              className="px-4 py-2 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs transition flex items-center gap-1.5 shadow-sm shadow-emerald-600/20 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5 -rotate-45" />
              <span>{language === 'bn' ? 'হোয়াটসঅ্যাপে পাঠান' : 'Send via WhatsApp'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
