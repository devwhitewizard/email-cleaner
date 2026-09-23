import { useState } from 'react';
import Stats from './components/Stats';
import ResultsTable from './components/ResultsTable';
import { VerifyResult, VerificationStats } from './types';
import { Sparkles, Trash2, ShieldCheck, Mail, AlertCircle, Loader2, Play } from 'lucide-react';

const SAMPLE_TEXT = `John Doe <john.doe@gmail.com> (WhatsApp contact)
support@company.com - Support Desk
mailto:sales@company.com?subject=Inquiry
info@mailinator.com (throwaway)
invalid-email-syntax@domain..com
alex.smith@yahoo.com; mary.jane@outlook.com
john.doe@gmail.com (duplicate address)
zero-width-test\u200b@gmail.com
nonexistent-domain-test-98765.com`;

export function App() {
  const [text, setText] = useState('');
  const [results, setResults] = useState<VerifyResult[]>([]);
  const [stats, setStats] = useState<VerificationStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleVerify = async () => {
    if (!text.trim()) {
      setError('Please paste or type email addresses before verifying.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      /**
       * Step 1: POST /api/verify to backend Express server
       */
      const response = await fetch('/api/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server responded with status ${response.status}`);
      }

      const data = await response.json();
      setResults(data.results);
      setStats(data.stats);
    } catch (err: any) {
      console.error('Verification error:', err);
      setError(err.message || 'Failed to connect to verification server.');
    } finally {
      setLoading(false);
    }
  };

  const handleLoadSample = () => {
    setText(SAMPLE_TEXT);
    setError(null);
  };

  const handleClear = () => {
    setText('');
    setResults([]);
    setStats(null);
    setError(null);
  };

  return (
    <div className="min-h-screen text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white pb-16">
      {/* Top Navigation */}
      <header className="border-b border-slate-800/80 bg-slate-950/40 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white shadow-lg shadow-indigo-500/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400">
                Email Cleaner & Verifier
              </span>
              <span className="ml-2 text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                PRO
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-400">
            <span className="hidden sm:inline-flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              DNS Worker Pool Active
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 flex-1 w-full space-y-8">
        {/* Hero Banner */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Clean, Deduplicate & Verify Emails in Seconds
          </h1>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            Extract email addresses from dirty text, strip WhatsApp artifacts, deduplicate list, check syntax validity, perform live DNS MX lookups, and flag disposable accounts.
          </p>
        </div>

        {/* Input Box Glass Panel */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 shadow-2xl relative">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Mail className="w-4 h-4 text-indigo-400" />
              Paste Email List or Raw Text Blob
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleLoadSample}
                className="px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-indigo-300 text-xs font-medium border border-indigo-500/20 transition-all flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Load Sample Data
              </button>
              {text && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-slate-400 hover:text-slate-200 text-xs font-medium transition-all flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Clear
                </button>
              )}
            </div>
          </div>

          <div className="relative">
            <textarea
              rows={6}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste raw text containing emails, WhatsApp messages, CSV data, or mailto links here..."
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-4 font-mono text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/40 transition-all resize-y"
            />
          </div>

          {error && (
            <div className="mt-3 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Action Bar */}
          <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <span className="text-xs text-slate-500">
              {text ? `${text.length.toLocaleString()} characters` : 'Supports up to 5 MB of raw text'}
            </span>

            <button
              onClick={handleVerify}
              disabled={loading || !text.trim()}
              className={`w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-xl ${
                loading || !text.trim()
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                  : 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.02]'
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Processing Verification...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>Clean & Verify List</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Dashboard Stats */}
        {stats && <Stats stats={stats} />}

        {/* Results Data Table */}
        {results.length > 0 && <ResultsTable records={results} />}
      </main>

      {/* Footer */}
      <footer className="mt-auto pt-12 border-t border-slate-800/60 text-center text-xs text-slate-600">
        <p>Email Cleaner & Verifier — High-throughput express & DNS worker architecture</p>
      </footer>
    </div>
  );
}

export default App;
