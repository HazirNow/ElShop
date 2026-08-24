import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  Filter, 
  Search, 
  ShieldCheck, 
  AlertTriangle, 
  Info, 
  CheckCircle2, 
  ShieldAlert,
  Clock
} from 'lucide-react';
import { Language } from '../../types';

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  target: string;
  severity: 'info' | 'warning' | 'critical' | 'success';
  details?: string;
}

interface AdminAuditLogsProps {
  logs: AuditLogEntry[];
  lang: Language;
  onShowToast: (msg: string) => void;
}

export const AdminAuditLogs: React.FC<AdminAuditLogsProps> = ({
  logs,
  lang,
  onShowToast,
}) => {
  const isRtl = lang === 'ar';

  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState<'all' | 'info' | 'warning' | 'critical' | 'success'>('all');

  // Filter logs
  const filteredLogs = logs.filter((log) => {
    const matchesSearch = 
      log.actor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.target.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.details && log.details.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;
    if (severityFilter !== 'all' && log.severity !== severityFilter) return false;
    return true;
  });

  // Export CSV Handler
  const handleExportCSV = () => {
    try {
      const headers = ['Log_ID', 'Timestamp', 'Actor', 'Action', 'Target', 'Severity', 'Details'];
      const csvRows = [
        headers.join(','),
        ...filteredLogs.map((log) => [
          `"${log.id}"`,
          `"${log.timestamp}"`,
          `"${log.actor.replace(/"/g, '""')}"`,
          `"${log.action.replace(/"/g, '""')}"`,
          `"${log.target.replace(/"/g, '""')}"`,
          `"${log.severity.toUpperCase()}"`,
          `"${(log.details || '').replace(/"/g, '""')}"`,
        ].join(',')),
      ];

      const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvRows.join('\n'));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', csvContent);
      downloadAnchor.setAttribute('download', `elshop_audit_log_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      document.body.removeChild(downloadAnchor);

      onShowToast(`Exported ${filteredLogs.length} audit log entries to CSV`);
    } catch (e) {
      onShowToast('Failed to export CSV');
    }
  };

  return (
    <div className="space-y-6" id="admin-audit-logs-module">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <FileText className="w-6 h-6 text-indigo-400" />
            <span>{isRtl ? 'سجل التدقيق والأمان المؤسسي' : 'Security Audit Trail & Compliance'}</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {isRtl
              ? 'سجل غير قابل للتعديل لجميع العمليات الإدارية والمالية وتغيير رموز المرور'
              : 'Immutable record of administrative, financial, PIN reset, and session revocation events.'}
          </p>
        </div>

        {/* CSV Export Button */}
        <button
          onClick={handleExportCSV}
          className="bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-md flex items-center justify-center gap-2 transition-all active:scale-95 shrink-0"
        >
          <Download className="w-4 h-4 text-emerald-400" />
          <span>{isRtl ? 'تصدير سجل التدقيق CSV' : 'Export Audit Trail (CSV)'}</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
        
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isRtl ? 'بحث في الأحداث، المنفذ، الهدف...' : 'Search logs, actor, target, details...'}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Severity Filter Chips */}
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          <span className="text-[11px] font-bold text-slate-400 hidden sm:inline mr-1">Severity:</span>
          {(['all', 'info', 'warning', 'critical', 'success'] as const).map((sev) => (
            <button
              key={sev}
              onClick={() => setSeverityFilter(sev)}
              className={`px-3 py-1 rounded-lg text-xs font-bold capitalize transition-all ${
                severityFilter === sev
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {/* Log Feed Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400">
              <tr>
                <th className="py-3.5 px-4 font-extrabold">{isRtl ? 'الوقت' : 'Timestamp'}</th>
                <th className="py-3.5 px-4 font-extrabold">{isRtl ? 'المنفذ' : 'Actor'}</th>
                <th className="py-3.5 px-4 font-extrabold">{isRtl ? 'الحدث' : 'Action'}</th>
                <th className="py-3.5 px-4 font-extrabold">{isRtl ? 'الهدف / المتجر' : 'Target'}</th>
                <th className="py-3.5 px-4 font-extrabold">{isRtl ? 'المستوى' : 'Severity'}</th>
                <th className="py-3.5 px-4 font-extrabold">{isRtl ? 'التفاصيل' : 'Details'}</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800/60 font-medium font-mono text-[11px]">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400 font-sans">
                    No log events found for this filter.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  return (
                    <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                      {/* Timestamp */}
                      <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3 h-3 text-slate-500" />
                          <span>{log.timestamp}</span>
                        </div>
                      </td>

                      {/* Actor */}
                      <td className="py-3 px-4 text-white font-bold whitespace-nowrap">
                        {log.actor}
                      </td>

                      {/* Action */}
                      <td className="py-3 px-4 text-indigo-300 font-bold whitespace-nowrap">
                        {log.action}
                      </td>

                      {/* Target */}
                      <td className="py-3 px-4 text-slate-300 whitespace-nowrap">
                        {log.target}
                      </td>

                      {/* Severity Badge */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        {log.severity === 'info' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black uppercase bg-sky-500/10 text-sky-400 border border-sky-500/20">
                            <Info className="w-3 h-3" />
                            <span>Info</span>
                          </span>
                        )}
                        {log.severity === 'warning' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            <AlertTriangle className="w-3 h-3" />
                            <span>Warning</span>
                          </span>
                        )}
                        {log.severity === 'critical' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black uppercase bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse">
                            <ShieldAlert className="w-3 h-3" />
                            <span>Critical</span>
                          </span>
                        )}
                        {log.severity === 'success' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Success</span>
                          </span>
                        )}
                      </td>

                      {/* Details */}
                      <td className="py-3 px-4 text-slate-400 font-sans text-xs max-w-xs truncate">
                        {log.details || '—'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
