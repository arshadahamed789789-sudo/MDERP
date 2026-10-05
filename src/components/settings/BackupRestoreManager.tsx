import React, { useState, useRef } from 'react';
import { 
  Download, Upload, RotateCcw, AlertTriangle, CheckCircle2, 
  FileText, ShieldCheck, Database, Trash2, ArrowRight, RefreshCw, 
  AlertCircle, Clock, Calendar, Archive, FileSpreadsheet, HardDrive,
  Settings2, Play, Sparkles, Check, ChevronRight, Layers, Smartphone
} from 'lucide-react';
import { useERP } from '../../services/erpStore';
import { formatBDT } from '../../utils/formatters';
import { 
  buildProductsCsv, buildImeisCsv, buildSalesCsv, 
  buildCustomersCsv, buildSuppliersCsv, buildExpensesCsv, 
  buildCashBankCsv, downloadSingleCsv 
} from '../../utils/backupExportHelpers';

export const BackupRestoreManager: React.FC = () => {
  const { 
    products, imeis, sales, customers, suppliers, branches, expenses,
    cashAccounts, bankAccounts, businessConfig, language,
    exportAllBusinessDataJSON, exportAllBusinessDataCSVZip, exportConsolidatedCSV,
    backupScheduleConfig, updateBackupScheduleConfig,
    backupSnapshots, createBackupSnapshot, deleteBackupSnapshot, restoreFromSnapshot,
    restoreFromBackup, resetToDemoData, resetToCleanSlate 
  } = useERP();

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Notice & notification state
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [isExportingCsvZip, setIsExportingCsvZip] = useState(false);
  const [isTakingSnapshot, setIsTakingSnapshot] = useState(false);

  // Schedule form state (local clone for editing)
  const [schedEnabled, setSchedEnabled] = useState(backupScheduleConfig.enabled);
  const [schedFrequency, setSchedFrequency] = useState<'daily' | 'every_3_days' | 'weekly'>(backupScheduleConfig.frequency);
  const [schedFormat, setSchedFormat] = useState<'JSON' | 'CSV' | 'BOTH'>(backupScheduleConfig.format);
  const [schedAutoDownload, setSchedAutoDownload] = useState(backupScheduleConfig.autoDownload);
  const [schedSavedNotice, setSchedSavedNotice] = useState(false);

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

  // Snapshot Restore Modal
  const [snapshotToRestore, setSnapshotToRestore] = useState<string | null>(null);

  // Reset states
  const [resetModalMode, setResetModalMode] = useState<'NONE' | 'DEMO' | 'CLEAN'>('NONE');
  const [cleanConfirmText, setCleanConfirmText] = useState('');

  const triggerNotice = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 4000);
  };

  // Handle saving schedule configuration
  const handleSaveScheduleConfig = () => {
    updateBackupScheduleConfig({
      enabled: schedEnabled,
      frequency: schedFrequency,
      format: schedFormat,
      autoDownload: schedAutoDownload
    });
    setSchedSavedNotice(true);
    setTimeout(() => setSchedSavedNotice(false), 3000);
    triggerNotice(
      language === 'bn' 
        ? 'ব্যাকআপ সিডিউল সেটিংস সফলভাবে সংরক্ষিত হয়েছে!' 
        : 'Automated backup schedule configuration saved successfully!'
    );
  };

  // Immediate manual snapshot
  const handleTakeInstantSnapshot = () => {
    setIsTakingSnapshot(true);
    setTimeout(() => {
      const res = createBackupSnapshot('MANUAL', schedFormat, false);
      setIsTakingSnapshot(false);
      if (res.success) {
        triggerNotice(
          language === 'bn'
            ? 'ডাটাবেজের তাত্ক্ষণিক স্ন্যাপশট সফলভাবে সংরক্ষিত হয়েছে!'
            : 'Instant database snapshot captured and stored safely in local memory!'
        );
      } else {
        triggerNotice(res.error || 'Failed to capture snapshot');
      }
    }, 300);
  };

  // Handle Export CSV ZIP with feedback
  const handleExportCsvZip = async () => {
    setIsExportingCsvZip(true);
    try {
      await exportAllBusinessDataCSVZip();
      triggerNotice(
        language === 'bn'
          ? 'সকল টেবিল সমন্বিত CSV ZIP আর্কাইভ সফলভাবে ডাউনলোড হয়েছে!'
          : 'Complete multi-table CSV ZIP archive downloaded successfully!'
      );
    } catch (e: any) {
      triggerNotice('CSV Export error: ' + (e?.message || 'Unknown error'));
    } finally {
      setIsExportingCsvZip(false);
    }
  };

  // Handle File Selection for Restore
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

  // Execute Restore from uploaded file
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

  // Execute Restore from saved snapshot
  const handleExecuteSnapshotRestore = () => {
    if (!snapshotToRestore) return;
    const res = restoreFromSnapshot(snapshotToRestore);
    setSnapshotToRestore(null);
    if (res.success) {
      triggerNotice(
        language === 'bn'
          ? `স্ন্যাপশট থেকে ডাটাবেজ সফলভাবে রিস্টোর হয়েছে!`
          : `Database successfully restored from selected snapshot!`
      );
    } else {
      triggerNotice(res.error || 'Failed to restore snapshot');
    }
  };

  // Execute Demo Reset
  const handleExecuteDemoReset = () => {
    resetToDemoData();
    setResetModalMode('NONE');
    triggerNotice(
      language === 'bn' 
        ? 'সিস্টেম সফলভাবে ফ্যাক্টরি ডেমো ডেটায় রিসেট হয়েছে!' 
        : 'System reset to clean factory mobile demo data.'
    );
  };

  // Execute Clean Slate Reset
  const handleExecuteCleanReset = () => {
    if (cleanConfirmText.trim().toUpperCase() !== 'RESET') return;
    resetToCleanSlate();
    setResetModalMode('NONE');
    setCleanConfirmText('');
    triggerNotice(
      language === 'bn' 
        ? 'সিস্টেম সম্পূর্ণ ফ্রেশ ও খালি করা হয়েছে! আপনার দোকানের আসল ডেটা এন্ট্রি শুরু করুন।' 
        : 'System completely wiped to blank slate for fresh business production startup.'
    );
  };

  // Quick download helper for single table
  const handleDownloadTableCsv = (tableType: 'products' | 'imeis' | 'sales' | 'customers' | 'suppliers' | 'expenses' | 'accounts') => {
    if (tableType === 'products') {
      downloadSingleCsv(buildProductsCsv(products), 'MOBILE_DERP_Products_Catalog');
    } else if (tableType === 'imeis') {
      downloadSingleCsv(buildImeisCsv(imeis), 'MOBILE_DERP_IMEI_Inventory');
    } else if (tableType === 'sales') {
      downloadSingleCsv(buildSalesCsv(sales), 'MOBILE_DERP_Sales_Invoices');
    } else if (tableType === 'customers') {
      downloadSingleCsv(buildCustomersCsv(customers), 'MOBILE_DERP_Customers_Ledger');
    } else if (tableType === 'suppliers') {
      downloadSingleCsv(buildSuppliersCsv(suppliers), 'MOBILE_DERP_Suppliers_Payables');
    } else if (tableType === 'expenses') {
      downloadSingleCsv(buildExpensesCsv(expenses), 'MOBILE_DERP_Expenses_Registry');
    } else if (tableType === 'accounts') {
      downloadSingleCsv(buildCashBankCsv(cashAccounts, bankAccounts), 'MOBILE_DERP_Cash_Bank_Accounts');
    }
    triggerNotice(language === 'bn' ? 'CSV ফাইল ডাউনলোড সম্পন্ন হয়েছে' : 'Table CSV exported successfully');
  };

  return (
    <div className="space-y-6">
      {actionNotice && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-2xl flex items-center gap-3 text-xs font-semibold shadow-xs animate-in fade-in-50">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* SCHEDULE STATUS HERO BANNER */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-5 sm:p-7 shadow-lg border border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 rounded-full text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Enterprise Local Safety</span>
              </span>
              {backupScheduleConfig.enabled ? (
                <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 rounded-full text-[11px] font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>
                    {language === 'bn' ? 'অটোমেটিক ব্যাকআপ সক্রিয়' : 'Auto-Backup ACTIVE'} ({backupScheduleConfig.frequency})
                  </span>
                </span>
              ) : (
                <span className="px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-400/30 rounded-full text-[11px] font-bold">
                  {language === 'bn' ? 'অটোমেটিক ব্যাকআপ বন্ধ' : 'Auto-Backup Disabled'}
                </span>
              )}
            </div>

            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
              <Database className="w-6 h-6 text-indigo-400" />
              <span>{language === 'bn' ? 'ডাটাবেজ ব্যাকআপ ও সিডিউল সিস্টেম' : 'Database Backup & Scheduled Export'}</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              {language === 'bn'
                ? 'আপনার শোরুমের সমস্ত ইনভেন্টরি, আইএমইআই, বিক্রয় চালান, কাস্টমার ও মহাজন খতিয়ান সম্পূর্ণ সুরক্ষিত রাখতে JSON অথবা এক্সেল-বান্ধব CSV ফাইলে সংরক্ষণ করুন।'
                : 'Safeguard your mobile store records with instant JSON snapshots, Excel-compatible multi-table CSV archives, and automated background backups.'}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-indigo-400" />
                <span>
                  {language === 'bn' ? 'সর্বশেষ ব্যাকআপ:' : 'Last Backup:'}{' '}
                  <strong className="text-slate-200">
                    {backupScheduleConfig.lastBackupDate 
                      ? new Date(backupScheduleConfig.lastBackupDate).toLocaleString() 
                      : 'Never'}
                  </strong>
                </span>
              </div>
              {backupScheduleConfig.enabled && (
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-emerald-400" />
                  <span>
                    {language === 'bn' ? 'পরবর্তী ব্যাকআপ:' : 'Next Auto-Backup:'}{' '}
                    <strong className="text-slate-200">
                      {backupScheduleConfig.nextBackupDate 
                        ? new Date(backupScheduleConfig.nextBackupDate).toLocaleString() 
                        : 'Scheduled soon'}
                    </strong>
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <button
              type="button"
              disabled={isTakingSnapshot}
              onClick={handleTakeInstantSnapshot}
              className="px-4 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-900/60 text-white rounded-2xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-md hover:shadow-indigo-500/25 cursor-pointer"
            >
              {isTakingSnapshot ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Capturing...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  <span>{language === 'bn' ? 'এখনই ব্যাকআপ নিন (Snapshot)' : 'Capture Snapshot Now'}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Real-time stats count bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 pt-6 mt-6 border-t border-slate-800/80">
          <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Products</span>
            <span className="text-sm font-black font-mono text-white">{products.length}</span>
          </div>
          <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">IMEI Stock</span>
            <span className="text-sm font-black font-mono text-white">{imeis.length}</span>
          </div>
          <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Invoices</span>
            <span className="text-sm font-black font-mono text-white">{sales.length}</span>
          </div>
          <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Customers</span>
            <span className="text-sm font-black font-mono text-white">{customers.length}</span>
          </div>
          <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Suppliers</span>
            <span className="text-sm font-black font-mono text-white">{suppliers.length}</span>
          </div>
          <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Accounts</span>
            <span className="text-sm font-black font-mono text-white">{cashAccounts.length + bankAccounts.length}</span>
          </div>
          <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Expenses</span>
            <span className="text-sm font-black font-mono text-white">{expenses.length}</span>
          </div>
        </div>
      </div>

      {/* SECTION 1: MANUAL EXPORT HUBS (JSON & CSV) */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs space-y-6">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Download className="w-5 h-5 text-indigo-600" />
            <span>{language === 'bn' ? 'ম্যানুয়াল ডাটা এক্সপোর্ট (Manual Database Exports)' : 'Manual Database Export (JSON & CSV)'}</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {language === 'bn'
              ? 'আপনার সুবিধাজনক ফরম্যাটে ডাটাবেজের সম্পূর্ণ ফাইল ডাউনলোড করে আপনার পেনড্রাইভ, কম্পিউটার বা ক্লাউড স্টোরেজে সেভ রাখুন।'
              : 'Download full database copies in JSON for system restoration or CSV for MS Excel, Google Sheets, and offline financial reporting.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: Full System JSON */}
          <div className="p-5 rounded-2xl border border-blue-200 bg-blue-50/40 hover:bg-blue-50/70 transition flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                <Database className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                {language === 'bn' ? 'সম্পূর্ণ ডাটাবেজ JSON ফাইল' : 'Complete Database (JSON)'}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {language === 'bn'
                  ? 'সিস্টেমের সমস্ত টেবিল, ব্যালেন্স, কনফিগারেশন ও আইএমইআই সহ ১টি একক ফাইল। এই ফাইলটি ব্যবহার করে পরবর্তীতে শতভাগ ডাটা রিস্টোর করা যাবে।'
                  : 'Full system snapshot with all relational records, balances, and configurations. Use this for 100% loss-free system restoration.'}
              </p>
            </div>
            <button
              type="button"
              onClick={exportAllBusinessDataJSON}
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-xs cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>{language === 'bn' ? 'ডাউনলোড JSON ব্যাকআপ' : 'Download JSON Snapshot'}</span>
            </button>
          </div>

          {/* Card 2: Full Multi-table CSV ZIP */}
          <div className="p-5 rounded-2xl border border-emerald-200 bg-emerald-50/40 hover:bg-emerald-50/70 transition flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <Archive className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                {language === 'bn' ? 'সকল টেবিলের CSV আর্কাইভ (ZIP)' : 'All Tables CSV Archive (.zip)'}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {language === 'bn'
                  ? 'প্রোডাক্ট, আইএমইআই, বিক্রয় চালান, কাস্টমার ও মহাজন খতিয়ান আলাদা আলাদা ৮টি পরিষ্কার CSV ফাইল একটি ZIP বান্ডলে জিপ করা।'
                  : 'Bundles 8 individual clean CSV spreadsheets (Products, IMEIs, Sales, Customers, Suppliers, Expenses, Accounts, Audit Logs) into one ZIP.'}
              </p>
            </div>
            <button
              type="button"
              disabled={isExportingCsvZip}
              onClick={handleExportCsvZip}
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-xs cursor-pointer"
            >
              {isExportingCsvZip ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Zipping CSVs...</span>
                </>
              ) : (
                <>
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>{language === 'bn' ? 'ডাউনলোড CSV জিপ (.zip)' : 'Download All CSVs (.zip)'}</span>
                </>
              )}
            </button>
          </div>

          {/* Card 3: Consolidated Single CSV */}
          <div className="p-5 rounded-2xl border border-indigo-200 bg-indigo-50/40 hover:bg-indigo-50/70 transition flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                {language === 'bn' ? 'একীভূত ডাটাবেজ CSV ফাইল' : 'Consolidated Single CSV'}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {language === 'bn'
                  ? 'দোকানের সমস্ত ডেটা ও টেবিল একটামাত্র সমন্বিত CSV স্প্রেডশিটে সেকশন অনুযায়ী একত্রিত। দ্রুত প্রিন্ট বা স্প্রেডশিটে দেখার জন্য উপযুক্ত।'
                  : 'Single unified CSV spreadsheet containing all business tables separated by clear section blocks. Convenient for quick offline inspection.'}
              </p>
            </div>
            <button
              type="button"
              onClick={exportConsolidatedCSV}
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-xs cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>{language === 'bn' ? 'ডাউনলোড একীভূত CSV' : 'Download Unified CSV'}</span>
            </button>
          </div>
        </div>

        {/* Individual Quick CSV Table Exports */}
        <div className="pt-4 border-t border-slate-100">
          <span className="text-xs font-bold text-slate-700 block mb-2.5">
            {language === 'bn' ? 'দ্রুত নির্দিষ্ট টেবিল এক্সপোর্ট (Quick Single Table CSV):' : 'Export Specific Individual Table as CSV:'}
          </span>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => handleDownloadTableCsv('products')}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <Download className="w-3.5 h-3.5 text-blue-600" />
              <span>Products CSV ({products.length})</span>
            </button>
            <button
              type="button"
              onClick={() => handleDownloadTableCsv('imeis')}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <Smartphone className="w-3.5 h-3.5 text-purple-600" />
              <span>IMEI Devices CSV ({imeis.length})</span>
            </button>
            <button
              type="button"
              onClick={() => handleDownloadTableCsv('sales')}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>Sales Invoices CSV ({sales.length})</span>
            </button>
            <button
              type="button"
              onClick={() => handleDownloadTableCsv('customers')}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <Download className="w-3.5 h-3.5 text-indigo-600" />
              <span>Customers & Dues CSV ({customers.length})</span>
            </button>
            <button
              type="button"
              onClick={() => handleDownloadTableCsv('suppliers')}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <Download className="w-3.5 h-3.5 text-amber-600" />
              <span>Suppliers & Payables CSV ({suppliers.length})</span>
            </button>
            <button
              type="button"
              onClick={() => handleDownloadTableCsv('expenses')}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <Download className="w-3.5 h-3.5 text-rose-600" />
              <span>Expenses CSV ({expenses.length})</span>
            </button>
            <button
              type="button"
              onClick={() => handleDownloadTableCsv('accounts')}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <Download className="w-3.5 h-3.5 text-cyan-600" />
              <span>Cash & Bank CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 2: SCHEDULED AUTOMATIC BACKUP CONFIGURATION */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-600" />
              <span>{language === 'bn' ? 'অটোমেটিক ব্যাকআপ সিডিউল (Scheduled Backup System)' : 'Automated Scheduled Backup System'}</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {language === 'bn'
                ? 'নিয়মিত ব্যবধানে সিস্টেম নিজে থেকেই অটো ব্যাকআপ স্ন্যাপশট গ্রহণ করবে এবং লোকাল মেমোরিতে নিরাপদে সেভ রাখবে।'
                : 'Configure background periodic database snapshots so your sales and inventory are safeguarded automatically without manual intervention.'}
            </p>
          </div>

          <button
            type="button"
            onClick={handleSaveScheduleConfig}
            className="px-5 py-2.5 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-xs shrink-0 self-start sm:self-auto cursor-pointer"
          >
            {schedSavedNotice ? <Check className="w-4 h-4 text-emerald-400" /> : <Settings2 className="w-4 h-4" />}
            <span>{schedSavedNotice ? (language === 'bn' ? 'সংরক্ষিত হয়েছে' : 'Saved!') : (language === 'bn' ? 'সিডিউল সেটিংস সেভ করুন' : 'Save Schedule Settings')}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          {/* Toggle 1: Enable / Disable */}
          <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800">
                {language === 'bn' ? 'অটো ব্যাকআপ চালু করুন' : 'Enable Scheduled Auto-Backup'}
              </span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={schedEnabled}
                  onChange={e => setSchedEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>
            <p className="text-[11px] text-slate-500">
              {language === 'bn'
                ? 'চালু রাখলে নির্দিষ্ট সময় পর পর ব্রাউজারে ব্যাকআপ স্ন্যাপশট সংরক্ষিত হবে।'
                : 'When active, the ERP automatically takes periodic snapshots in the background.'}
            </p>
          </div>

          {/* Toggle 2: Frequency */}
          <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-2">
            <label className="text-xs font-bold text-slate-800 block">
              {language === 'bn' ? 'ব্যাকআপের ফ্রিকোয়েন্সি (সময় ব্যবধান)' : 'Backup Frequency'}
            </label>
            <select
              value={schedFrequency}
              onChange={e => setSchedFrequency(e.target.value as any)}
              className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="daily">{language === 'bn' ? 'প্রতিদিন একবার (Daily / 24 Hours)' : 'Daily (Every 24 Hours)'}</option>
              <option value="every_3_days">{language === 'bn' ? 'প্রতি ৩ দিন পর পর (Every 3 Days)' : 'Every 3 Days'}</option>
              <option value="weekly">{language === 'bn' ? 'সাপ্তাহিক একবার (Weekly / 7 Days)' : 'Weekly (Every 7 Days)'}</option>
            </select>
            <span className="text-[11px] text-slate-500 block">
              {language === 'bn' ? 'শোরুমের কাজের চাপের ওপর ভিত্তি করে পছন্দ করুন।' : 'Choose interval according to store transaction volume.'}
            </span>
          </div>

          {/* Toggle 3: Preferred Format & Auto-Download */}
          <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-3">
            <div>
              <label className="text-xs font-bold text-slate-800 block mb-1">
                {language === 'bn' ? 'পছন্দের ব্যাকআপ ফরম্যাট' : 'Snapshot File Format'}
              </label>
              <select
                value={schedFormat}
                onChange={e => setSchedFormat(e.target.value as any)}
                className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="BOTH">JSON Database + CSV Tables (Recommended)</option>
                <option value="JSON">JSON Snapshot File (.json)</option>
                <option value="CSV">CSV Tables ZIP Archive (.zip)</option>
              </select>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-slate-200">
              <span className="text-[11px] font-semibold text-slate-700">
                {language === 'bn' ? 'অটো-ডাউনলোড পপআপ' : 'Auto-Download to Disk'}
              </span>
              <input
                type="checkbox"
                checked={schedAutoDownload}
                onChange={e => setSchedAutoDownload(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded border-slate-300"
              />
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 3: LOCAL BACKUP SNAPSHOTS HISTORY */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <HardDrive className="w-5 h-5 text-indigo-600" />
              <span>{language === 'bn' ? 'সংরক্ষিত ব্যাকআপ স্ন্যাপশট সমূহ' : 'Local Backup Snapshots & History'}</span>
              <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs font-mono font-bold rounded-full">
                {backupSnapshots.length}
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {language === 'bn'
                ? 'সিডিউল ও ম্যানুয়ালি তৈরিকৃত সর্বশেষ ১০টি স্ন্যাপশট লোকাল স্টোরেজে সংরক্ষিত থাকে। যে কোনো সময় এক ক্লিকে ডাউনলোড বা রিস্টোর করা যাবে।'
                : 'Latest snapshots kept safe in local memory. You can download or roll back to any past state with 1-click.'}
            </p>
          </div>

          <button
            type="button"
            disabled={isTakingSnapshot}
            onClick={handleTakeInstantSnapshot}
            className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
          >
            <Play className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? '+ নতুন স্ন্যাপশট তুলুন' : '+ New Snapshot'}</span>
          </button>
        </div>

        {backupSnapshots.length === 0 ? (
          <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50 space-y-2">
            <Database className="w-8 h-8 text-slate-400 mx-auto" />
            <span className="text-xs font-bold text-slate-700 block">
              {language === 'bn' ? 'কোনো ব্যাকআপ স্ন্যাপশট এখনও সংরক্ষিত নেই' : 'No snapshots in history yet'}
            </span>
            <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
              {language === 'bn'
                ? 'উপরের "এখনই ব্যাকআপ নিন" বাটনে ক্লিক করে প্রথম স্ন্যাপশটটি সংরক্ষণ করুন অথবা সিডিউল অন রাখুন।'
                : 'Click "Capture Snapshot Now" to create your first stored database checkpoint.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto border border-slate-200 rounded-2xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                <tr>
                  <th className="p-3">Snapshot Time</th>
                  <th className="p-3">Trigger Type</th>
                  <th className="p-3">Data Records</th>
                  <th className="p-3">Size</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {backupSnapshots.map(snap => (
                  <tr key={snap.id} className="hover:bg-slate-50/60 transition">
                    <td className="p-3 font-medium text-slate-800">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                        <span>{new Date(snap.timestamp).toLocaleString()}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        snap.trigger === 'SCHEDULED' 
                          ? 'bg-purple-100 text-purple-800 border border-purple-200' 
                          : 'bg-blue-100 text-blue-800 border border-blue-200'
                      }`}>
                        {snap.trigger === 'SCHEDULED' ? 'Auto Scheduled' : 'Manual Snapshot'}
                      </span>
                    </td>
                    <td className="p-3 text-slate-600">
                      <span className="font-mono text-[11px]">
                        {snap.summary.productsCount} prods • {snap.summary.imeisCount} devices • {snap.summary.salesCount} sales
                      </span>
                    </td>
                    <td className="p-3 font-mono text-slate-500">
                      {snap.sizeKb} KB
                    </td>
                    <td className="p-3 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            const blob = new Blob([snap.jsonData], { type: 'application/json' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `SNAPSHOT_${snap.id}_${snap.timestamp.split('T')[0]}.json`;
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                            URL.revokeObjectURL(url);
                          }}
                          title="Download Snapshot JSON"
                          className="p-1.5 bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 rounded-lg transition"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setSnapshotToRestore(snap.id)}
                          title="Restore Database to this snapshot"
                          className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-[11px] font-bold transition flex items-center gap-1"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Restore</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteBackupSnapshot(snap.id)}
                          title="Delete snapshot"
                          className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* SECTION 4: RESTORE FROM EXTERNAL FILE */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Upload className="w-5 h-5 text-emerald-600" />
            <span>{language === 'bn' ? 'ফাইল থেকে ডাটা রিস্টোর (Restore from External JSON)' : 'Restore Database from External JSON File'}</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {language === 'bn'
              ? 'পূর্বে এক্সপোর্ট করা কোনো .json ব্যাকআপ ফাইল আপলোড করে সম্পূর্ণ শোরুম ডাটাবেজ পুনঃস্থাপন করুন।'
              : 'Upload any previously exported MOBILE_DERP_BACKUP_*.json file to restore store records, products, and customer dues.'}
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
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 animate-in fade-in-50 text-xs">
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

      {/* SECTION 5: FACTORY DEMO & CLEAN SLATE WIPE */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
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
          <div className="p-4 rounded-2xl border border-amber-200 bg-amber-50/60 flex flex-col justify-between space-y-3">
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
          <div className="p-4 rounded-2xl border border-rose-200 bg-rose-50/60 flex flex-col justify-between space-y-3">
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

      {/* MODAL: Confirm Snapshot Restore */}
      {snapshotToRestore && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in-50">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden p-5 space-y-4 text-xs">
            <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center mx-auto shadow-xs">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-sm font-bold text-slate-900">
                {language === 'bn' ? 'স্ন্যাপশট থেকে ডাটাবেজ রিস্টোর করবেন?' : 'Rollback Database to Selected Snapshot?'}
              </h3>
              <p className="text-slate-500 text-[11px]">
                {language === 'bn'
                  ? 'বর্তমান পরিবর্তনের জায়গায় নির্বাচিত স্ন্যাপশটটির সমস্ত পণ্য, আইএমইআই এবং ব্যালেন্স রিস্টোর করা হবে।'
                  : 'Current records will be reverted to the state preserved in this snapshot.'}
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSnapshotToRestore(null)}
                className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteSnapshotRestore}
                className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition shadow-xs"
              >
                Yes, Restore Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Confirm Demo Reset */}
      {resetModalMode === 'DEMO' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in-50">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden p-5 space-y-4 text-xs">
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
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden p-5 space-y-4 text-xs">
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
