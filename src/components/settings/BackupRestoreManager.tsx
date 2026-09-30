import React, { useState, useRef } from 'react';
import { 
  Download, Upload, RotateCcw, AlertTriangle, CheckCircle2, 
  FileText, ShieldCheck, Database, Trash2, ArrowRight, RefreshCw, AlertCircle
} from 'lucide-react';
import { useERP } from '../../services/erpStore';
import { formatBDT } from '../../utils/formatters';

export const BackupRestoreManager: React.FC = () => {
  const { 
    products, imeis, sales, customers, suppliers, branches, expenses,
    exportAllBusinessData, restoreFromBackup, resetToDemoData, resetToCleanSlate, language 
  } = useERP();

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Restore states
  const [backupFileContent, setBackupFileContent] = useState<string>('');
  const [backupFileName, setBackupFileName] = useState<string>('');
  const [parsedPreview, setParsedPreview] = useState<{
    exportDate?: string;
    schemaVersion?: number;
    summary?: {
      productsCount?: number;
      imeisCount?: number;
      salesCount?: number;
      customersCount?: number;
      suppliersCount?: number;
    };
  } | null>(null);

  const [restoreStatus, setRestoreStatus] = useState<{ success: boolean; message: string } | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);

  // Reset states
  const [resetModalMode, setResetModalMode] = useState<'NONE' | 'DEMO' | 'CLEAN'>('NONE');
  const [cleanConfirmText, setCleanConfirmText] = useState('');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Handle File Selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setBackupFileName(file.name);
    setRestoreStatus(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setBackupFileContent(content);
      try {
        const parsed = JSON.parse(content);
        setParsedPreview({
          exportDate: parsed.exportDate,
          schemaVersion: parsed.schemaVersion || 1,
          summary: parsed.summary || {
            productsCount: Array.isArray(parsed.products) ? parsed.products.length : 0,
            imeisCount: Array.isArray(parsed.imeis) ? parsed.imeis.length : 0,
            salesCount: Array.isArray(parsed.sales) ? parsed.sales.length : 0,
            customersCount: Array.isArray(parsed.customers) ? parsed.customers.length : 0,
            suppliersCount: Array.isArray(parsed.suppliers) ? parsed.suppliers.length : 0
          }
        });
      } catch (err) {
        setParsedPreview(null);
        setRestoreStatus({
          success: false,
          message: language === 'bn' ? 'ফাইলটি সঠিক JSON ফরম্যাটে নেই।' : 'Invalid JSON backup file.'
        });
      }
    };
    reader.readAsText(file);
  };

  // Execute Restore
  const handleExecuteRestore = () => {
    if (!backupFileContent) return;
    setIsRestoring(true);
    setRestoreStatus(null);

    setTimeout(() => {
      const res = restoreFromBackup(backupFileContent);
      setIsRestoring(false);
      if (res.success) {
        setRestoreStatus({
          success: true,
          message: language === 'bn' 
            ? `সফলভাবে ব্যাকআপ রিস্টোর সম্পন্ন হয়েছে! (${res.summary?.productsCount || 0} টি প্রোডাক্ট, ${res.summary?.imeisCount || 0} টি ডিভাইস, ${res.summary?.salesCount || 0} টি বিক্রয় চালান লোড হয়েছে)` 
            : `Database successfully restored from backup! (${res.summary?.productsCount || 0} products, ${res.summary?.imeisCount || 0} IMEIs, ${res.summary?.salesCount || 0} sales loaded)`
        });
        setParsedPreview(null);
        setBackupFileContent('');
        setBackupFileName('');
        if (fileInputRef.current) fileInputRef.current.value = '';
      } else {
        setRestoreStatus({
          success: false,
          message: res.error || (language === 'bn' ? 'রিস্টোর ব্যর্থ হয়েছে।' : 'Restore operation failed.')
        });
      }
    }, 400);
  };

  // Execute Demo Reset
  const handleExecuteDemoReset = () => {
    resetToDemoData();
    setResetModalMode('NONE');
    setActionNotice(language === 'bn' 
      ? 'সিস্টেম সফলভাবে ফ্যাক্টরি ডেমো ডেটায় রিসেট হয়েছে!' 
      : 'System reset to clean factory mobile demo data.');
    setTimeout(() => setActionNotice(null), 4000);
  };

  // Execute Clean Slate Reset
  const handleExecuteCleanReset = () => {
    if (cleanConfirmText.trim().toUpperCase() !== 'RESET') {
      alert(language === 'bn' ? 'নিশ্চিত করতে "RESET" টাইপ করুন' : 'Please type "RESET" to confirm.');
      return;
    }
    resetToCleanSlate();
    setResetModalMode('NONE');
    setCleanConfirmText('');
    setActionNotice(language === 'bn' 
      ? 'সিস্টেম সম্পূর্ণ ফ্রেশ ও খালি করা হয়েছে! আপনার দোকানের আসল ডেটা এন্ট্রি শুরু করুন।' 
      : 'System completely wiped to blank slate for fresh business production startup.');
    setTimeout(() => setActionNotice(null), 4000);
  };

  return (
    <div className="space-y-6">
      {actionNotice && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-2xl flex items-center gap-3 text-xs font-semibold shadow-xs animate-in fade-in-50">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* 1. BACKUP SECTION */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Database className="w-5 h-5 text-blue-600" />
              <span>{language === 'bn' ? 'সম্পূর্ণ ডাটাবেজ ব্যাকআপ (Download Backup)' : 'Database Backup & JSON Export'}</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {language === 'bn'
                ? 'আপনার দোকানের সকল পণ্য, আইএমইআই, বিক্রয় ও ক্রয় চালান, কাস্টমার ও মহাজন খতিয়ান এক ফাইলে সেভ করুন।'
                : 'Download a full standalone JSON snapshot of your products, IMEIs, sales invoices, ledger balances, and audit history.'}
            </p>
          </div>
          <button
            type="button"
            onClick={exportAllBusinessData}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm self-start sm:self-auto shrink-0"
          >
            <Download className="w-4 h-4" />
            <span>{language === 'bn' ? 'ব্যাকআপ ডাউনলোড করুন (JSON)' : 'Download Backup File'}</span>
          </button>
        </div>

        {/* Current Database Summary Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2.5 pt-2">
          <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Products</span>
            <span className="text-sm font-black font-mono text-slate-800">{products.length}</span>
          </div>
          <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">IMEI Devices</span>
            <span className="text-sm font-black font-mono text-slate-800">{imeis.length}</span>
          </div>
          <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Sales Invoices</span>
            <span className="text-sm font-black font-mono text-slate-800">{sales.length}</span>
          </div>
          <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Customers</span>
            <span className="text-sm font-black font-mono text-slate-800">{customers.length}</span>
          </div>
          <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Suppliers</span>
            <span className="text-sm font-black font-mono text-slate-800">{suppliers.length}</span>
          </div>
          <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Expenses</span>
            <span className="text-sm font-black font-mono text-slate-800">{expenses.length}</span>
          </div>
        </div>
      </div>

      {/* 2. RESTORE SECTION */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Upload className="w-5 h-5 text-emerald-600" />
            <span>{language === 'bn' ? 'ব্যাকআপ থেকে ডাটা রিস্টোর (Restore Backup)' : 'Restore Database from JSON Backup'}</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {language === 'bn'
              ? 'পূর্বে ডাউনলোড করা .json ব্যাকআপ ফাইল আপলোড করে সম্পূর্ণ ডাটাবেজ পুনঃস্থাপন করুন।'
              : 'Upload a previously exported MOBILE_DERP_BACKUP_*.json file to restore all store records and balances.'}
          </p>
        </div>

        {/* Restore Result Message */}
        {restoreStatus && (
          <div className={`p-4 rounded-xl text-xs flex items-center gap-3 border ${
            restoreStatus.success 
              ? 'bg-emerald-50 text-emerald-900 border-emerald-200 font-semibold' 
              : 'bg-rose-50 text-rose-900 border-rose-200'
          }`}>
            {restoreStatus.success ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            )}
            <span>{restoreStatus.message}</span>
          </div>
        )}

        {/* Upload Box */}
        <div className="p-5 border-2 border-dashed border-slate-200 hover:border-emerald-500 rounded-2xl bg-slate-50/60 transition text-center space-y-3">
          <input
            type="file"
            ref={fileInputRef}
            accept=".json,application/json"
            onChange={handleFileChange}
            className="hidden"
            id="backup-file-upload"
          />
          <label 
            htmlFor="backup-file-upload" 
            className="cursor-pointer inline-flex flex-col items-center justify-center"
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-2 shadow-xs">
              <Upload className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-slate-800">
              {backupFileName ? backupFileName : (language === 'bn' ? 'ব্যাকআপ ফাইল সিলেক্ট করুন (.json)' : 'Click to Browse Backup File (.json)')}
            </span>
            <span className="text-[11px] text-slate-400 mt-0.5">
              Supports MOBILE D-ERP JSON database format
            </span>
          </label>
        </div>

        {/* Backup Content Preview & Confirmation */}
        {parsedPreview && (
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 animate-in fade-in-50 text-xs">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <div>
                <span className="font-bold text-slate-900 block">Backup Preview Verified:</span>
                <span className="text-[11px] text-slate-500">
                  Export Date: <strong>{parsedPreview.exportDate ? new Date(parsedPreview.exportDate).toLocaleString() : 'Recent'}</strong>
                </span>
              </div>
              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded text-[10px] uppercase">
                Valid Backup
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center">
              <div className="p-2 bg-white rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Products</span>
                <span className="font-mono font-bold text-slate-800">{parsedPreview.summary?.productsCount ?? '-'}</span>
              </div>
              <div className="p-2 bg-white rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">IMEIs</span>
                <span className="font-mono font-bold text-slate-800">{parsedPreview.summary?.imeisCount ?? '-'}</span>
              </div>
              <div className="p-2 bg-white rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Invoices</span>
                <span className="font-mono font-bold text-slate-800">{parsedPreview.summary?.salesCount ?? '-'}</span>
              </div>
              <div className="p-2 bg-white rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Customers</span>
                <span className="font-mono font-bold text-slate-800">{parsedPreview.summary?.customersCount ?? '-'}</span>
              </div>
              <div className="p-2 bg-white rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Suppliers</span>
                <span className="font-mono font-bold text-slate-800">{parsedPreview.summary?.suppliersCount ?? '-'}</span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setParsedPreview(null);
                  setBackupFileContent('');
                  setBackupFileName('');
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
                className="px-3.5 py-1.5 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-100 font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isRestoring}
                onClick={handleExecuteRestore}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white rounded-lg font-bold shadow-xs flex items-center gap-1.5 transition"
              >
                {isRestoring ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Restoring...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{language === 'bn' ? 'ডাটাবেজে রিস্টোর করুন' : 'Confirm & Apply Restore'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 3. RESET SECTION */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <RotateCcw className="w-5 h-5 text-rose-600" />
            <span>{language === 'bn' ? 'সিস্টেম রিসেট অপশন (System Reset Options)' : 'System Database Reset & Wipe'}</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {language === 'bn'
              ? 'প্রয়োজন অনুযায়ী ডেমো ডেটা রিস্টোর করুন অথবা আসল শোরুম চালুর জন্য সমস্ত ডেটা সম্পূর্ণ মুছে ফ্রেশ করুন।'
              : 'Choose between restoring clean factory mobile demo records or wiping the system to a completely blank slate for real production.'}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          {/* Option A: Reset to Factory Demo */}
          <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/60 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                <RotateCcw className="w-4 h-4 text-amber-600" />
                <span>{language === 'bn' ? 'ফ্যাক্টরি ডেমো ডেটায় রিসেট' : 'Reset to Factory Demo Data'}</span>
              </div>
              <p className="text-[11px] text-amber-800 mt-1">
                {language === 'bn'
                  ? 'সবকিছু রিসেট করে বাংলাদেশের মোবাইল বাজারের বাস্তবিক ডেমো প্রোডাক্ট (Samsung, iPhone, Xiaomi), আইএমইআই, পাইকারি ডিলার ও ক্যাশ ব্যালেন্স রিস্টোর করবে।'
                  : 'Restores realistic mobile showroom demo stock, Samsung/Apple/Xiaomi models, IMEI inventory, dealer ledgers, and cash balances.'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setResetModalMode('DEMO')}
              className="w-full py-2 px-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'ডেমো ডেটা রিস্টোর করুন' : 'Reset to Demo Data'}</span>
            </button>
          </div>

          {/* Option B: Clean Slate Production Wipe */}
          <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/60 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center gap-2 text-rose-900 font-bold text-xs">
                <Trash2 className="w-4 h-4 text-rose-600" />
                <span>{language === 'bn' ? 'সম্পূর্ণ ফাঁকা / ফ্রেশ শুরু (Clean Slate)' : 'Complete Production Blank Wipe'}</span>
              </div>
              <p className="text-[11px] text-rose-800 mt-1">
                {language === 'bn'
                  ? 'সকল ডেমো বিক্রয়, ক্রয়, প্রোডাক্ট, আইএমইআই ও বাকি খাতা চিরতরে মুছে সম্পূর্ণ ফাঁকা করবে, যাতে আপনার দোকানের আসল ব্যবসা শুরু করা যায়।'
                  : 'Wipes all sample invoices, products, IMEIs, ledgers, and balances to 0 so you can start entering your shop\'s live production records.'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setCleanConfirmText('');
                setResetModalMode('CLEAN');
              }}
              className="w-full py-2 px-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center justify-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'সম্পূর্ণ ডেটা মুছে ফাঁকা করুন' : 'Wipe to Blank Slate'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* MODAL: Confirm Demo Reset */}
      {resetModalMode === 'DEMO' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in-50">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden p-5 space-y-4 text-xs">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto shadow-xs">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-sm font-bold text-slate-900">
                {language === 'bn' ? 'ফ্যাক্টরি ডেমো ডেটায় রিসেট করবেন?' : 'Confirm Factory Demo Reset'}
              </h3>
              <p className="text-slate-500 text-[11px]">
                {language === 'bn'
                  ? 'আপনার বর্তমান এন্ট্রি করা পরিবর্তনসমূহ মুছে যাবে এবং সিস্টেমটি প্রাথমিক ডেমো ডেটা সেটে ফিরে যাবে।'
                  : 'Your current custom records will be overwritten with the clean factory demo dataset.'}
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setResetModalMode('NONE')}
                className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteDemoReset}
                className="flex-1 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold transition shadow-xs"
              >
                Yes, Restore Demo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Confirm Clean Slate Wipe */}
      {resetModalMode === 'CLEAN' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in-50">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden p-5 space-y-4 text-xs">
            <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center mx-auto shadow-xs">
              <Trash2 className="w-5 h-5" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-sm font-bold text-rose-900">
                {language === 'bn' ? 'সতর্কতা: সম্পূর্ণ ডাটাবেজ মুছে ফেলা হবে' : 'Warning: Complete Production Wipe'}
              </h3>
              <p className="text-slate-500 text-[11px]">
                {language === 'bn'
                  ? 'ইনভেন্টরি, আইএমইআই, বিক্রয় মেমো, গ্রাহক ও মহাজন লেজার শূন্য হবে। এই অপারেশনটি অপরিবর্তনীয়।'
                  : 'All products, IMEIs, sales, customer ledgers, and balances will be completely cleared. This action cannot be undone.'}
              </p>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">
                {language === 'bn' ? 'নিশ্চিত করতে নিচে "RESET" শব্দটি টাইপ করুন:' : 'Type "RESET" to confirm permanent wipe:'}
              </label>
              <input
                type="text"
                placeholder="RESET"
                value={cleanConfirmText}
                onChange={e => setCleanConfirmText(e.target.value)}
                className="w-full p-2.5 text-center font-mono font-bold tracking-widest border border-rose-300 rounded-xl bg-rose-50/50 uppercase text-rose-900 focus:bg-white"
              />
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setResetModalMode('NONE');
                  setCleanConfirmText('');
                }}
                className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={cleanConfirmText.trim().toUpperCase() !== 'RESET'}
                onClick={handleExecuteCleanReset}
                className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 disabled:bg-slate-300 text-white rounded-xl font-bold transition shadow-xs"
              >
                Confirm Wipe
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
