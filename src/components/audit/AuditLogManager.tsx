import React, { useState } from 'react';
import { History, Search, ShieldCheck, Filter } from 'lucide-react';
import { useERP } from '../../services/erpStore';

export const AuditLogManager: React.FC = () => {
  const { auditLogs, language } = useERP();
  const [searchTerm, setSearchTerm] = useState('');
  const [moduleFilter, setModuleFilter] = useState('ALL');

  const filteredLogs = auditLogs.filter(log => {
    const q = searchTerm.toLowerCase();
    const matchSearch = 
      log.action.toLowerCase().includes(q) ||
      log.details.toLowerCase().includes(q) ||
      log.userName.toLowerCase().includes(q) ||
      log.recordId.toLowerCase().includes(q);
    const matchModule = moduleFilter === 'ALL' || log.module === moduleFilter;
    return matchSearch && matchModule;
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">
          {language === 'bn' ? 'অডিট লগ ও সিস্টেম ট্র্যাকিং' : 'System Audit Logs & Compliance'}
        </h1>
        <p className="text-xs text-slate-500">
          {language === 'bn' 
            ? 'প্রতিটি লেনদেন, বিক্রয়, ডিসকাউন্ট ও ব্যালেন্স পরিবর্তনের অপরিবর্তনীয় রেকর্ড' 
            : 'Immutable timestamped audit trail of financial transactions, sales, and user authorizations.'}
        </p>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search action, user, record ID, details..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 border border-slate-200 rounded-lg bg-slate-50"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-slate-500 font-medium">Module:</span>
          <select
            value={moduleFilter}
            onChange={(e) => setModuleFilter(e.target.value)}
            className="text-xs font-medium p-2 border border-slate-200 rounded-lg bg-slate-50"
          >
            <option value="ALL">All Modules</option>
            <option value="Sales">Sales</option>
            <option value="Purchase">Purchase</option>
            <option value="Customers">Customers</option>
            <option value="Suppliers">Suppliers</option>
            <option value="Accounting">Accounting</option>
            <option value="Warranty">Warranty</option>
            <option value="Cash">Cash</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">User & Role</th>
                <th className="py-2.5 px-3">Module</th>
                <th className="py-2.5 px-3">Action Event</th>
                <th className="py-2.5 px-3">Record ID</th>
                <th className="py-2.5 px-3">Transaction Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredLogs.map(log => (
                <tr key={log.id} className="hover:bg-slate-50/70">
                  <td className="py-2.5 px-3 font-mono text-slate-500 whitespace-nowrap">{log.timestamp}</td>
                  <td className="py-2.5 px-3">
                    <span className="font-semibold text-slate-900">{log.userName}</span>
                    <span className="text-[10px] text-slate-400 block">{log.userRole}</span>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="text-[10px] px-2 py-0.5 rounded font-bold uppercase bg-slate-100 text-slate-700">
                      {log.module}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-800">{log.action}</td>
                  <td className="py-2.5 px-3 font-mono text-emerald-700 font-bold">{log.recordId}</td>
                  <td className="py-2.5 px-3 text-slate-600 max-w-md">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
