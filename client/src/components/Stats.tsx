import { VerificationStats } from '../types';
import { CheckCircle2, AlertTriangle, XCircle, CopyX, Mail } from 'lucide-react';

interface StatsProps {
  stats: VerificationStats;
}

export function Stats({ stats }: StatsProps) {
  const validPercent = stats.unique > 0 ? Math.round((stats.VALID / stats.unique) * 100) : 0;
  const riskyPercent = stats.unique > 0 ? Math.round((stats.RISKY / stats.unique) * 100) : 0;
  const invalidPercent = stats.unique > 0 ? Math.round((stats.INVALID / stats.unique) * 100) : 0;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* Total Extracted */}
        <div className="glass-card p-4 rounded-xl relative overflow-hidden group transition-all duration-300 hover:scale-[1.01]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Found</span>
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Mail className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-white tracking-tight">{stats.total}</span>
            <span className="text-xs font-medium text-slate-400">{stats.unique} unique</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">Raw addresses extracted</div>
        </div>

        {/* Duplicates */}
        <div className="glass-card p-4 rounded-xl relative overflow-hidden group transition-all duration-300 hover:scale-[1.01]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Duplicates</span>
            <div className="p-2 rounded-lg bg-slate-500/10 text-slate-400 border border-slate-500/20">
              <CopyX className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-slate-300 tracking-tight">{stats.duplicates}</span>
            <span className="text-xs font-medium text-slate-500">Deduped</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">Removed from verification</div>
        </div>

        {/* VALID */}
        <div className="glass-card p-4 rounded-xl relative overflow-hidden group transition-all duration-300 hover:scale-[1.01] border-emerald-500/20 bg-emerald-950/10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">Valid</span>
            <div className="p-2 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-emerald-400 tracking-tight">{stats.VALID}</span>
            <span className="text-xs font-semibold text-emerald-400/90">{validPercent}%</span>
          </div>
          <div className="mt-2 text-[11px] text-emerald-500/70">Syntax & MX verified</div>
        </div>

        {/* RISKY */}
        <div className="glass-card p-4 rounded-xl relative overflow-hidden group transition-all duration-300 hover:scale-[1.01] border-amber-500/20 bg-amber-950/10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">Risky</span>
            <div className="p-2 rounded-lg bg-amber-500/15 text-amber-400 border border-amber-500/30">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-amber-400 tracking-tight">{stats.RISKY}</span>
            <span className="text-xs font-semibold text-amber-400/90">{riskyPercent}%</span>
          </div>
          <div className="mt-2 text-[11px] text-amber-500/70">Disposable / Role accounts</div>
        </div>

        {/* INVALID */}
        <div className="glass-card p-4 rounded-xl relative overflow-hidden group transition-all duration-300 hover:scale-[1.01] border-rose-500/20 bg-rose-950/10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-rose-400">Invalid</span>
            <div className="p-2 rounded-lg bg-rose-500/15 text-rose-400 border border-rose-500/30">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-rose-400 tracking-tight">{stats.INVALID}</span>
            <span className="text-xs font-semibold text-rose-400/90">{invalidPercent}%</span>
          </div>
          <div className="mt-2 text-[11px] text-rose-500/70">Syntax error or no MX</div>
        </div>
      </div>
    </div>
  );
}

export default Stats;
