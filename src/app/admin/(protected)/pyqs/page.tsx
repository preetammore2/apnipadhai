'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  CheckCircle2,
  FileText,
  Loader2,
  Plus,
  RefreshCw,
  Save,
  Trash2,
  XCircle,
} from 'lucide-react';
import LogoutButton from '@/app/admin/components/LogoutButton';

interface PyqItem {
  title: string;
  examName: string;
  category: string;
  year: number;
  state: string;
  subject: string;
  questionsCount?: number;
  pdfSize?: string;
  downloadUrl: string;
  hasSolution: boolean;
}

const CATEGORIES = ['RAS', 'Sub Inspector', 'CET', 'LDC', 'SSC GD', 'Rajasthan GK', 'Teacher Exams'];
const STATES = ['Rajasthan', 'All India'];

const EMPTY_ITEM: PyqItem = {
  title: '',
  examName: '',
  category: 'RAS',
  year: new Date().getFullYear(),
  state: 'Rajasthan',
  subject: 'General Knowledge & General Science',
  questionsCount: undefined,
  pdfSize: '',
  downloadUrl: '',
  hasSolution: true,
};

export default function AdminPyqsPage() {
  const [items, setItems] = useState<PyqItem[]>([]);
  const [configured, setConfigured] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/pyqs');
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.message || 'Failed to load PYQs');
        setConfigured(false);
        return;
      }
      setConfigured(data.configured ?? true);
      setItems(data.items ?? []);
    } catch {
      setError('Could not load PYQs');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const update = (index: number, next: PyqItem) => {
    const copy = [...items];
    copy[index] = next;
    setItems(copy);
    setResult(null);
  };

  async function save() {
    setSaving(true);
    setResult(null);
    try {
      const res = await fetch('/api/admin/pyqs', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setResult({ ok: false, message: data.message || 'Could not save PYQs' });
        return;
      }
      setItems(data.items ?? items);
      setResult({ ok: true, message: 'PYQs saved. The site will refresh within a minute.' });
    } catch {
      setResult({ ok: false, message: 'Could not save PYQs' });
    } finally {
      setSaving(false);
    }
  }

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
              <h1 className="text-lg font-black font-heading leading-none">Previous Year Papers</h1>
              <p className="text-xs text-white/60 mt-1">PYQs shown on the site /pyqs page</p>
            </div>
          </div>
          <LogoutButton />
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {!configured && !loading && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 mb-6 text-sm text-amber-900">
            MongoDB is not configured yet. Set{' '}
            <code className="font-mono text-xs bg-amber-100 px-1.5 py-0.5 rounded">MONGODB_URI</code>{' '}
            on the server to manage PYQs from here.
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
          <div className="flex-1">
            <p className="text-sm text-slate-500">
              Papers managed here are merged with the WordPress download list on /pyqs (MongoDB
              entries first). Create, edit, reorder and delete directly from here.
            </p>
          </div>
          <button
            onClick={load}
            disabled={loading}
            className="p-2.5 border border-slate-200 bg-white text-slate-500 hover:text-navy-900 rounded-xl transition-colors disabled:opacity-60 self-start"
            aria-label="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {error && (
          <p className="text-sm font-semibold text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3 mb-4">
            {error}
          </p>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20 text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sm:p-8">
            {items.length === 0 && (
              <div className="border border-dashed border-slate-200 rounded-2xl py-10 text-center mb-4">
                <FileText className="w-6 h-6 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-400">
                  No papers yet — add one below or use Sync from WordPress.
                </p>
              </div>
            )}

            <div className="space-y-4">
              {items.map((item, index) => (
                <div key={index} className="border border-slate-200 rounded-2xl p-4 relative">
                  <div className="absolute top-3 right-3 flex items-center gap-1">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => {
                        const copy = [...items];
                        const [entry] = copy.splice(index, 1);
                        copy.splice(index - 1, 0, entry);
                        setItems(copy);
                        setResult(null);
                      }}
                      className="p-1.5 text-slate-400 enabled:hover:text-navy-900 enabled:hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-30"
                      aria-label="Move up"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      disabled={index === items.length - 1}
                      onClick={() => {
                        const copy = [...items];
                        const [entry] = copy.splice(index, 1);
                        copy.splice(index + 1, 0, entry);
                        setItems(copy);
                        setResult(null);
                      }}
                      className="p-1.5 text-slate-400 enabled:hover:text-navy-900 enabled:hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-30"
                      aria-label="Move down"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const copy = [...items];
                        copy.splice(index, 1);
                        setItems(copy);
                        setResult(null);
                      }}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      aria-label="Remove paper"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid gap-3 pr-8">
                    <input
                      value={item.title}
                      onChange={(e) => update(index, { ...item, title: e.target.value })}
                      placeholder="Paper title *"
                      className="input-field"
                    />
                    <div className="grid sm:grid-cols-3 gap-3">
                      <input
                        value={item.examName}
                        onChange={(e) => update(index, { ...item, examName: e.target.value })}
                        placeholder="Exam name"
                        className="input-field"
                      />
                      <select
                        value={item.category}
                        onChange={(e) => update(index, { ...item, category: e.target.value })}
                        className="input-field"
                      >
                        {CATEGORIES.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                      <select
                        value={item.state}
                        onChange={(e) => update(index, { ...item, state: e.target.value })}
                        className="input-field"
                      >
                        {STATES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="grid sm:grid-cols-4 gap-3">
                      <input
                        type="number"
                        min={0}
                        value={item.year || ''}
                        onChange={(e) => update(index, { ...item, year: Number(e.target.value) || 0 })}
                        placeholder="Year"
                        className="input-field"
                      />
                      <input
                        type="number"
                        min={0}
                        value={item.questionsCount ?? ''}
                        onChange={(e) =>
                          update(index, {
                            ...item,
                            questionsCount: e.target.value ? Number(e.target.value) : undefined,
                          })
                        }
                        placeholder="Questions"
                        className="input-field"
                      />
                      <input
                        value={item.pdfSize ?? ''}
                        onChange={(e) => update(index, { ...item, pdfSize: e.target.value })}
                        placeholder="PDF size (e.g. 2 MB)"
                        className="input-field"
                      />
                      <label className="flex items-center gap-2 text-xs font-bold text-navy-900 input-field bg-slate-50">
                        <input
                          type="checkbox"
                          checked={item.hasSolution}
                          onChange={(e) => update(index, { ...item, hasSolution: e.target.checked })}
                          className="accent-emerald-600"
                        />
                        Has solution key
                      </label>
                    </div>
                    <input
                      value={item.downloadUrl}
                      onChange={(e) => update(index, { ...item, downloadUrl: e.target.value })}
                      placeholder="PDF download URL *"
                      className="input-field font-mono text-xs"
                    />
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setItems([...items, { ...EMPTY_ITEM }])}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2.5 border border-dashed border-slate-300 text-slate-500 hover:text-navy-900 hover:border-navy-900 text-xs font-bold rounded-xl transition-colors"
            >
              <Plus className="w-4 h-4" /> Add paper
            </button>

            {result && (
              <div
                className={`mt-5 flex items-start gap-2 text-xs font-semibold rounded-xl px-4 py-3 ${
                  result.ok
                    ? 'bg-green-50 text-green-700 border border-green-100'
                    : 'bg-red-50 text-red-600 border border-red-100'
                }`}
              >
                {result.ok ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <XCircle className="w-4 h-4 shrink-0" />}
                <span>{result.message}</span>
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <button
                onClick={save}
                disabled={saving}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-yellow-400 hover:bg-yellow-500 disabled:opacity-60 text-navy-950 text-xs font-black rounded-xl transition-colors"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Papers
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
