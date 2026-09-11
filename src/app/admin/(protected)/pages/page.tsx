'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  LayoutTemplate,
  Loader2,
  Pencil,
  RefreshCw,
  RotateCcw,
  Save,
  XCircle,
} from 'lucide-react';
import LogoutButton from '@/app/admin/components/LogoutButton';

interface PageRow {
  key: string;
  slug: string;
  label: string;
  hint: string;
  title: string;
  content: string;
  exists: boolean;
}

const EMPTY_FORM = { title: '', content: '' };

export default function AdminPagesPage() {
  const [pages, setPages] = useState<PageRow[]>([]);
  const [configured, setConfigured] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<PageRow | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ ok: boolean; message: string } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/pages');
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.message || 'Failed to load pages');
        setConfigured(false);
        return;
      }
      setConfigured(data.configured ?? true);
      setPages(data.pages ?? []);
    } catch {
      setError('Could not load pages');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function openEdit(page: PageRow) {
    setEditing(page);
    setForm({ title: page.title, content: page.content });
    setModalOpen(true);
  }

  async function save() {
    if (!editing) return;
    if (!form.title.trim()) {
      window.alert('Title is required');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/admin/pages', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: editing.slug, title: form.title, content: form.content }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        window.alert(data.message || 'Could not save page');
        return;
      }
      setModalOpen(false);
      setNotice({ ok: true, message: `"${data.page.label}" saved.` });
      load();
    } catch {
      window.alert('Could not save page');
    } finally {
      setSaving(false);
    }
  }

  async function revert(page: PageRow) {
    if (!window.confirm(`Revert "${page.label}" to its default layout? Custom content will be removed.`)) {
      return;
    }
    setBusyKey(page.key);
    try {
      const res = await fetch('/api/admin/pages', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: page.slug }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        window.alert(data.message || 'Could not revert page');
        return;
      }
      setNotice({ ok: true, message: data.message ?? 'Page reverted.' });
      load();
    } catch {
      window.alert('Could not revert page');
    } finally {
      setBusyKey(null);
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
              <h1 className="text-lg font-black font-heading leading-none">Pages</h1>
              <p className="text-xs text-white/60 mt-1">Edit the content of the info pages</p>
            </div>
          </div>
          <LogoutButton />
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {!configured && !loading && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 mb-6 text-sm text-amber-900">
            Firebase is not configured yet. Set{' '}
            <code className="font-mono text-xs bg-amber-100 px-1.5 py-0.5 rounded">FIREBASE_SERVICE_ACCOUNT</code>{' '}
            on the server to edit pages from here.
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
          <div className="flex-1">
            <p className="text-sm text-slate-500">
              When a page has custom content, the site shows it instead of the built-in layout. Use{' '}
              <strong>Revert to default</strong> to switch back.
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

        {notice && (
          <div
            className={`text-xs font-semibold rounded-xl px-4 py-3 mb-4 flex items-center gap-2 ${
              notice.ok
                ? 'bg-green-50 text-green-700 border border-green-100'
                : 'bg-red-50 text-red-600 border border-red-100'
            }`}
          >
            {notice.ok ? <Save className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
            <span>{notice.message}</span>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20 text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : (
          <div className="space-y-3">
            {pages.map((page) => (
              <div
                key={page.key}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center gap-4"
              >
                <span className="w-11 h-11 bg-navy-100 text-navy-700 rounded-xl flex items-center justify-center shrink-0">
                  <LayoutTemplate className="w-5 h-5" />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-bold font-heading text-navy-900">{page.label}</h3>
                    <span
                      className={`text-[10px] font-black uppercase tracking-wide px-2 py-0.5 rounded-full ${
                        page.exists
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      {page.exists ? 'Custom content' : 'Default layout'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 truncate">/{page.key}</p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => openEdit(page)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-navy-900 hover:bg-slate-100 rounded-xl transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5" /> Edit
                  </button>
                  {page.exists && (
                    <button
                      onClick={() => revert(page)}
                      disabled={busyKey === page.key}
                      className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors disabled:opacity-60"
                    >
                      {busyKey === page.key ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <RotateCcw className="w-3.5 h-3.5" />
                      )}
                      Revert
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {modalOpen && editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl my-8">
            <div className="px-6 sm:px-8 py-5 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-lg font-black font-heading text-navy-900">Edit {editing.label}</h2>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-navy-900 text-xl leading-none"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <div className="px-6 sm:px-8 py-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-navy-900 mb-1.5">Title</label>
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Page title"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-navy-900 mb-1.5">
                  Content (HTML supported)
                </label>
                <textarea
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  rows={16}
                  placeholder="<h2>Section heading</h2><p>Paragraph text…</p>"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-mono leading-relaxed focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 resize-y"
                />
              </div>
            </div>

            <div className="px-6 sm:px-8 py-4 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={save}
                disabled={saving}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-yellow-400 hover:bg-yellow-500 disabled:opacity-60 text-navy-950 text-xs font-black rounded-xl transition-colors"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                Save Page
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
