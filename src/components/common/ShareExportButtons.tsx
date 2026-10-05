import React, { useState } from 'react';
import { Share2, Download, Printer, Check } from 'lucide-react';
import { ShareExportModal, ShareExportModalProps } from './ShareExportModal';
import { exportToCSV } from '../../utils/exportToCsv';
import { useERP } from '../../services/erpStore';

export interface ShareExportButtonsProps {
  title: string;
  subtitle?: string;
  summaryMetrics?: { label: string; value: string; color?: string }[];
  shareText: string;
  csvData?: {
    filename: string;
    headers: string[];
    rows: (string | number | undefined | null)[][];
  };
  compact?: boolean;
}

export const ShareExportButtons: React.FC<ShareExportButtonsProps> = ({
  title,
  subtitle,
  summaryMetrics,
  shareText,
  csvData,
  compact = false
}) => {
  const { language } = useERP();
  const [isOpen, setIsOpen] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  const handleDirectDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (csvData) {
      exportToCSV(csvData.filename, csvData.headers, csvData.rows);
      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 2000);
    }
  };

  return (
    <>
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Quick CSV Download */}
        {csvData && (
          <button
            type="button"
            onClick={handleDirectDownload}
            className={`px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border border-slate-200/80 shadow-xs cursor-pointer active:scale-95 ${
              compact ? 'px-2 py-1 text-[11px]' : ''
            }`}
            title="Download CSV / Excel File"
          >
            {downloaded ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="hidden sm:inline text-emerald-700">Downloaded</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden sm:inline">CSV</span>
              </>
            )}
          </button>
        )}

        {/* Share & Export Hub Button */}
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className={`px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm shadow-slate-900/10 cursor-pointer active:scale-95 ${
            compact ? 'px-2.5 py-1 text-[11px]' : ''
          }`}
          title="Share Report to Owner/Admin (WhatsApp, Copy, Print)"
        >
          <Share2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>{language === 'bn' ? 'শেয়ার / এক্সপোর্ট' : 'Share & Export'}</span>
        </button>
      </div>

      <ShareExportModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={title}
        subtitle={subtitle}
        summaryMetrics={summaryMetrics}
        shareText={shareText}
        csvData={csvData}
      />
    </>
  );
};
