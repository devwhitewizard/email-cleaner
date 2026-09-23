import { useState, useMemo } from 'react';
import { VerifyResult, VerificationStatus } from '../types';
import { Download, Search, Check, Copy, Filter, Server, ShieldCheck, ShieldAlert, ShieldX } from 'lucide-react';

interface ResultsTableProps {
  records: VerifyResult[];
}

export function ResultsTable({ records }: ResultsTableProps) {
  const [activeTab, setActiveTab] = useState<'ALL' | VerificationStatus>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Filter records based on active tab and search query
  const filteredRecords = useMemo(() => {
    return records.filter((rec) => {
      const matchesTab = activeTab === 'ALL' || rec.status === activeTab;
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !q ||
        rec.email.toLowerCase().includes(q) ||
        rec.domain.toLowerCase().includes(q) ||
        rec.reason.toLowerCase().includes(q) ||
        (rec.mxHost && rec.mxHost.toLowerCase().includes(q));

      return matchesTab && matchesQuery;
    });
  }, [records, activeTab, searchQuery]);

  const handleCopyEmail = (email: string, id: string) => {
    navigator.clipboard.writeText(email);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  /**
   * Step 5: Client-side CSV generation via Blob in memory without server round-trip
   */
  const handleDownloadCSV = (onlyValid = false) => {
    const targetRecords = onlyValid
      ? records.filter((r) => r.status === 'VALID')
      : filteredRecords;

    if (targetRecords.length === 0) return;

    const headers = ['Email', 'Status', 'Reason', 'MX Server', 'Domain'];
    const rows = targetRecords.map((r) => [
      `"${r.email.replace(/"/g, '""')}"`,
      `"${r.status}"`,
      `"${r.reason.replace(/"/g, '""')}"`,
      `"${(r.mxHost || '').replace(/"/g, '""')}"`,
      `"${r.domain.replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    const fileName = onlyValid
      ? `cleaned_valid_emails_${Date.now()}.csv`
      : `email_verification_results_${Date.now()}.csv`;

    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getStatusBadge = (status: VerificationStatus) => {
    switch (status) {
      case 'VALID':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <ShieldCheck className="w-3.5 h-3.5" />
            VALID
          </span>
        );
      case 'RISKY':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <ShieldAlert className="w-3.5 h-3.5" />
            RISKY
          </span>
        );
      case 'INVALID':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <ShieldX className="w-3.5 h-3.5" />
            INVALID
          </span>
        );
    }
  };

  if (records.length === 0) {
    return null;
  }

  const tabCounts = {
    ALL: records.length,
    VALID: records.filter((r) => r.status === 'VALID').length,
    RISKY: records.filter((r) => r.status === 'RISKY').length,
    INVALID: records.filter((r) => r.status === 'INVALID').length,
  };

  return (
    <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
      {/* Header Controls Bar */}
      <div className="p-4 md:p-6 border-b border-slate-800/80 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-900/80 p-1.5 rounded-xl border border-slate-800/80 overflow-x-auto">
          {(['ALL', 'VALID', 'RISKY', 'INVALID'] as const).map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 flex items-center gap-2 whitespace-nowrap ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <span>{tab}</span>
                <span
                  className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${
                    isActive ? 'bg-indigo-500/40 text-white' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {tabCounts[tab]}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search & Export Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search Box */}
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search address or domain..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-900/90 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 transition-all"
            />
          </div>

          {/* Export Valid Only */}
          <button
            onClick={() => handleDownloadCSV(true)}
            title="Download verified valid emails only"
            className="px-3.5 py-2 rounded-xl bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold hover:bg-emerald-600/30 transition-all flex items-center justify-center gap-2"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Valid ({tabCounts.VALID})</span>
          </button>

          {/* Download CSV */}
          <button
            onClick={() => handleDownloadCSV(false)}
            className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold shadow-lg shadow-indigo-500/20 hover:bg-indigo-500 transition-all flex items-center justify-center gap-2"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download CSV ({filteredRecords.length})</span>
          </button>
        </div>
      </div>

      {/* Results Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-900/60 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800 text-[11px]">
              <th className="py-3.5 px-4 md:px-6">Email Address</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4">Mail Server (MX)</th>
              <th className="py-3.5 px-4 md:px-6">Verification Reason</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filteredRecords.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Filter className="w-8 h-8 text-slate-600" />
                    <p className="text-sm font-medium text-slate-300">No matching emails found</p>
                    <p className="text-xs text-slate-500">Try adjusting your filter tabs or search query.</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredRecords.map((record) => (
                <tr
                  key={record.id}
                  className="hover:bg-slate-800/30 transition-colors duration-150 group"
                >
                  {/* Email */}
                  <td className="py-3.5 px-4 md:px-6 font-mono font-medium text-slate-200">
                    <div className="flex items-center gap-2">
                      <span>{record.email}</span>
                    </div>
                  </td>

                  {/* Status Badge */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {getStatusBadge(record.status)}
                  </td>

                  {/* MX Server */}
                  <td className="py-3.5 px-4 font-mono text-slate-400 text-[11px] whitespace-nowrap">
                    {record.mxHost ? (
                      <span className="inline-flex items-center gap-1.5 text-indigo-300/90 bg-indigo-500/5 px-2 py-0.5 rounded border border-indigo-500/10">
                        <Server className="w-3 h-3 text-indigo-400" />
                        {record.mxHost}
                      </span>
                    ) : (
                      <span className="text-slate-600">-</span>
                    )}
                  </td>

                  {/* Verification Reason */}
                  <td className="py-3.5 px-4 md:px-6 text-slate-400">
                    {record.reason}
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => handleCopyEmail(record.email, record.id)}
                      title="Copy email to clipboard"
                      className="p-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-all border border-slate-700/50"
                    >
                      {copiedId === record.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer Info */}
      <div className="p-4 bg-slate-900/40 border-t border-slate-800 text-[11px] text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
        <span>Showing {filteredRecords.length} of {records.length} unique items</span>
        <span>MX queries cached locally for maximum speed</span>
      </div>
    </div>
  );
}

export default ResultsTable;
