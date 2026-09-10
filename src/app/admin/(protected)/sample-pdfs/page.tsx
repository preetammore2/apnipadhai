'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  FileText,
  Loader2,
  RefreshCw,
  Save,
  Search,
  XCircle,
} from 'lucide-react';
import { Book } from '@/types';
import LogoutButton from '@/app/admin/components/LogoutButton';

interface BookRow {
  book: Book;
  pdfUrl: string;
}

export default function AdminSamplePdfsPage() {
  const [rows, setRows] = useState<BookRow[]>([]);
  const [search, setSearch] = useState('');
  const [onlyFilled, setOnlyFilled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [savingId, setSavingId] = useState<string | null>(null);
  const [result, setResult] = useState<{ id: string; ok: boolean; message: string } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/books');
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.message || 'Failed to load books');
      }
      const data = (await res.json()) as Book[];
      setRows(
        Array.isArray(data)
          ? data.map((book) => ({ book, pdfUrl: book.samplePdfUrl ?? '' }))
          : [],
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load books');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const update = (id: string, pdfUrl: string) => {
    setRows((prev) => prev.map((r) => (r.book.id === id ? { ...r, pdfUrl } : r)));
    setResult(null);
  };

  async function saveRow(row: BookRow) {
    setSavingId(row.book.id);
    setResult(null);
    try {
      const res = await fetch(`/api/books/${row.book.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          samplePdfUrl: row.pdfUrl.trim() === '' ? '' : row.pdfUrl.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setResult({ id: row.book.id, ok: false, message: data.message || 'Could not save' });
        return;
      }
      setRows((prev) =>
        prev.map((r) =>
          r.book.id === row.book.id
            ? { book: data.book ?? row.book, pdfUrl: data.book?.samplePdfUrl ?? row.pdfUrl }
            : r,
        ),
      );
      setResult({
        id: row.book.id,
        ok: true,
        message: row.pdfUrl.trim() === '' ? 'Sample PDF removed.' : 'Sample PDF saved.',
      });
    } catch {
      setResult({ id: row.book.id, ok: false, message: 'Could not save sample PDF' });
    } finally {
      setSavingId(null);
    }
  }

  const filtered = rows.filter((r) => {
    if (onlyFilled && !r.pdfUrl.trim()) return false;
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      (r.book.title ?? '').toLowerCase().includes(q) ||
      (r.book.sku ?? '').toLowerCase().includes(q)
    );
  });

  return (
    <main className="min-h-screen bg-slate-50 pb-16">
      <header className="bg-navy-900 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center transition-colors"
              aria-label="Back to dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-lg font-black font-heading leading-none">Sample PDFs</h1>
              <p className="text-xs text-white/60 mt-1">Free preview chapters on /book-sample-pdf</p>
            </div>
          </div>
          <LogoutButton />
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title or SKU…"
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500"
            />
          </div>
          <label className="flex items-center gap-2 text-xs font-bold text-navy-900 bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={onlyFilled}
              onChange={(e) => setOnlyFilled(e.target.checked)}
              className="accent-emerald-600"
            />
            Only books with a sample PDF
          </label>
          <button
            onClick={load}
            disabled={loading}
            className="p-2.5 border border-slate-200 bg-white text-slate-500 hover:text-navy-900 rounded-xl transition-colors disabled:opacity-60 self-start"
            aria-label="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <Link
            href="/book-sample-pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-navy-900 hover:bg-brand-600 text-white text-xs font-bold rounded-xl transition-colors"
          >
            <ExternalLink className="w-4 h-4" /> View page
          </Link>
        </div>

        {error && (
          <p className="text-sm font-semibold text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3 mb-4">
            {error}
          </p>
        )}

        {loading && filtered.length === 0 ? (
          <div className="flex items-center justify-center py-20 text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-10 text-center">
            <FileText className="w-8 h-8 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-bold text-navy-900">
              {search || onlyFilled ? 'No books match this filter.' : 'No books found.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((row) => (
              <div
                key={row.book.id}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center gap-4"
              >
                {row.book.coverImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={row.book.coverImage}
                    alt={row.book.title}
                    className="w-14 h-16 object-cover rounded-lg border border-slate-100 shrink-0"
                  />
                ) : (
                  <div className="w-14 h-16 bg-slate-100 rounded-lg shrink-0 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-slate-300" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold font-heading text-navy-900 truncate">
                      {row.book.title}
                    </h3>
                    {row.pdfUrl.trim() && (
                      <a
                        href={row.pdfUrl.trim()}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-black text-amber-700 bg-yellow-100 border border-yellow-300 rounded-full hover:bg-yellow-200 transition-colors shrink-0"
                      >
                        <FileText className="w-3 h-3" /> PDF
                      </a>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {row.book.sku ? `SKU: ${row.book.sku} · ` : ''}
                    {row.book.category || 'Uncategorized'}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <input
                      value={row.pdfUrl}
                      onChange={(e) => update(row.book.id, e.target.value)}
                      placeholder="Sample PDF URL (https://…). Leave blank to remove."
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-mono bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500"
                    />
                    <button
                      onClick={() => saveRow(row)}
                      disabled={savingId === row.book.id}
                      className="p-2.5 bg-yellow-400 hover:bg-yellow-500 text-navy-950 rounded-xl transition-colors disabled:opacity-60 shrink-0"
                      aria-label={`Save sample PDF for ${row.book.title}`}
                    >
                      {savingId === row.book.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {result && result.id === row.book.id && (
                    <p
                      className={`mt-2 flex items-start gap-1.5 text-[11px] font-semibold ${
                        result.ok ? 'text-emerald-600' : 'text-red-600'
                      }`}
                    >
                      {result.ok ? (
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5 shrink-0" />
                      )}
                      {result.message}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}