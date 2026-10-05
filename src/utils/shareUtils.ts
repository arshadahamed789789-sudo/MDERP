/**
 * Enterprise Share and Print Utilities for Mobile & Desktop ERP
 */

export interface ReportPrintData {
  title: string;
  subtitle?: string;
  companyName?: string;
  date?: string;
  branchName?: string;
  metrics?: { label: string; value: string; color?: string }[];
  headers: string[];
  rows: (string | number | undefined | null)[][];
}

/**
 * Copies text to clipboard safely with fallback
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch (err) {
    // Fallback for older browsers
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      const successful = document.execCommand('copy');
      document.body.removeChild(textarea);
      return successful;
    } catch (e) {
      document.body.removeChild(textarea);
      return false;
    }
  }
  return false;
}

/**
 * Share via WhatsApp Web / App (optionally to specific phone number)
 */
export function shareViaWhatsApp(text: string, phone?: string) {
  const cleanPhone = phone ? phone.replace(/[^0-9]/g, '') : '';
  const url = cleanPhone 
    ? `https://wa.me/${cleanPhone.startsWith('880') ? cleanPhone : cleanPhone.startsWith('0') ? '88' + cleanPhone : cleanPhone}?text=${encodeURIComponent(text)}`
    : `https://wa.me/?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank');
}

/**
 * Share via native device OS sheet (if supported) or fallback to clipboard
 */
export async function shareViaNative(data: { title: string; text: string; url?: string }): Promise<'shared' | 'copied' | 'failed'> {
  if (navigator?.share && navigator?.canShare && navigator.canShare(data)) {
    try {
      await navigator.share(data);
      return 'shared';
    } catch (err) {
      // If user cancelled, don't fallback to error
      if ((err as Error).name === 'AbortError') return 'shared';
    }
  }
  
  // Fallback to clipboard
  const copied = await copyToClipboard(data.text);
  return copied ? 'copied' : 'failed';
}

export const shareViaNavigator = shareViaNative;

/**
 * Print formatted statement / report layout
 */
export function printReportDocument(data: ReportPrintData) {
  const printWindow = window.open('', '_blank', 'width=900,height=700');
  if (!printWindow) {
    window.print();
    return;
  }

  const currentDate = data.date || new Date().toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short'
  });

  const metricsHtml = data.metrics && data.metrics.length > 0 ? `
    <div style="display: flex; gap: 12px; margin-bottom: 20px; flex-wrap: wrap;">
      ${data.metrics.map(m => `
        <div style="flex: 1; min-width: 140px; padding: 10px 14px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px;">
          <div style="font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 700;">${m.label}</div>
          <div style="font-size: 16px; font-weight: 800; color: #0f172a; margin-top: 4px;">${m.value}</div>
        </div>
      `).join('')}
    </div>
  ` : '';

  const tableHeaderHtml = data.headers.map(h => `
    <th style="padding: 8px 10px; background: #f1f5f9; text-align: left; font-size: 11px; font-weight: 700; color: #334155; border-bottom: 2px solid #cbd5e1; text-transform: uppercase;">
      ${h}
    </th>
  `).join('');

  const tableRowsHtml = data.rows.map((row, idx) => `
    <tr style="background: ${idx % 2 === 0 ? '#ffffff' : '#f8fafc'}; border-bottom: 1px solid #e2e8f0; font-size: 11px;">
      ${row.map(cell => `
        <td style="padding: 8px 10px; color: #1e293b;">
          ${cell !== null && cell !== undefined ? String(cell) : '-'}
        </td>
      `).join('')}
    </tr>
  `).join('');

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${data.title} - ${data.companyName || 'DEALERFLOW ERP'}</title>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #0f172a; margin: 30px; }
          .header { border-bottom: 2px solid #00B074; padding-bottom: 15px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: flex-start; }
          .title { font-size: 20px; font-weight: 900; margin: 0; color: #0f172a; }
          .subtitle { font-size: 12px; color: #64748b; margin-top: 4px; }
          .company { font-size: 14px; font-weight: 800; color: #00B074; text-align: right; }
          .meta { font-size: 11px; color: #64748b; text-align: right; margin-top: 2px; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          .footer { margin-top: 30px; padding-top: 15px; border-top: 1px solid #e2e8f0; font-size: 10px; color: #94a3b8; display: flex; justify-content: space-between; }
          @media print {
            body { margin: 15px; }
            button { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <h1 class="title">${data.title}</h1>
            ${data.subtitle ? `<div class="subtitle">${data.subtitle}</div>` : ''}
          </div>
          <div>
            <div class="company">${data.companyName || 'DEALERFLOW ERP'}</div>
            <div class="meta">Printed: ${currentDate}</div>
            ${data.branchName ? `<div class="meta">Branch: ${data.branchName}</div>` : ''}
          </div>
        </div>

        ${metricsHtml}

        <table>
          <thead><tr>${tableHeaderHtml}</tr></thead>
          <tbody>${tableRowsHtml}</tbody>
        </table>

        <div class="footer">
          <span>Generated automatically from DEALERFLOW Mobile Business Hub</span>
          <span>Confidential • Internal Business Record</span>
        </div>

        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
}
