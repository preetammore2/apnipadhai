'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, Loader2, RefreshCw, Save, XCircle } from 'lucide-react';
import LogoutButton from '@/app/admin/components/LogoutButton';
import ImageUploader from '@/app/admin/components/ImageUploader';

interface PopupForm {
  enabled: boolean;
  image: string;
  alt: string;
  /** YYYY-MM-DD, shown until the end of that day. Always required. */
  expiresAt: string;
}

/** Today's date in India as YYYY-MM-DD (earliest allowed end date). */
function todayIst(): string {
  return new Date(Date.now() + 5.5 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

function isExpired(expiresAt: string): boolean {
  return !expiresAt || new Date(`${expiresAt}T23:59:59+05:30`).getTime() < Date.now();
}

export default function AdminPopupPage() {
  const [form, setForm] = useState<PopupForm>({ enabled: false, image: '', alt: '', expiresAt: '' });
  const [configured, setConfigured] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/popup');
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.message || 'Failed to load the popup');
        return;
      }
      setConfigured(data.configured ?? true);
      setForm({
        enabled: data.popup.enabled,
        image: data.popup.image,
        alt: data.popup.alt,
        expiresAt: data.popup.expiresAt ?? '',
      });
    } catch {
      setError('Could not load the popup');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const update = (next: Partial<PopupForm>) => {
    setForm((prev) => ({ ...prev, ...next }));
    setResult(null);
  };

  async function save() {
    setResult(null);
    if (form.enabled && !form.image) {
      setResult({ ok: false, message: 'Add a photo before turning the popup on.' });
      return;
    }
    if (form.enabled && !form.expiresAt) {
      setResult({ ok: false, message: 'Choose until which date the popup should show.' });
      return;
    }
    if (form.enabled && isExpired(form.expiresAt)) {
      setResult({ ok: false, message: 'The "Show until" date has already passed.' });
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/admin/popup', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        setResult({ ok: false, message: data.message || 'Could not save the popup' });
        return;
      }
      setResult({
        ok: true,
        message: data.popup.enabled
          ? `Popup saved. Visitors will see it until the end of ${data.popup.expiresAt} (changes apply within a minute).`
          : 'Popup turned off.',
      });
    } catch {
      setResult({ ok: false, message: 'Could not save the popup' });
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
              <h1 className="text-lg font-black font-heading leading-none">Popup</h1>
              <p className="text-xs text-white/60 mt-1">Photo shown when visitors open the website</p>
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
            on the server to manage the popup from here.
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
          <p className="flex-1 text-sm text-slate-500">
            Shown once per visit with a close (✕) button. Not shown on checkout, payment or admin
            pages. Uploading a new photo shows it again to everyone.
          </p>
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
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sm:p-8 space-y-5">
            <label className="flex items-center gap-3 text-sm font-bold text-navy-900">
              <input
                type="checkbox"
                checked={form.enabled}
                onChange={(e) => update({ enabled: e.target.checked })}
                className="w-4 h-4 accent-emerald-600"
              />
              Popup is on
            </label>

            <div>
              <label className="block text-xs font-bold text-navy-900 mb-1.5">Photo</label>
              <ImageUploader
                value={form.image}
                onChange={(image) => update({ image })}
                label="Upload popup photo"
              />
            </div>

            <label className="grid gap-1 text-xs font-bold text-navy-900 sm:max-w-xs">
              Show until (end of day) *
              <input
                type="date"
                min={todayIst()}
                value={form.expiresAt}
                onChange={(e) => update({ expiresAt: e.target.value })}
                className="input-field"
              />
            </label>
            {form.enabled && form.expiresAt && isExpired(form.expiresAt) && (
              <p className="text-xs font-semibold text-amber-700">
                This date has passed, so the popup is no longer showing. Pick a new date to show it again.
              </p>
            )}

            <input
              value={form.alt}
              onChange={(e) => update({ alt: e.target.value })}
              placeholder="Short description (for screen readers), e.g. Diwali offer on all books"
              className="input-field w-full"
            />

            {form.image && (
              <div>
                <p className="text-xs font-bold text-navy-900 mb-1.5">Preview</p>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={form.image}
                  alt={form.alt || 'Popup preview'}
                  className="max-h-80 w-auto rounded-2xl border border-slate-200"
                />
              </div>
            )}

            {result && (
              <div
                className={`flex items-start gap-2 text-xs font-semibold rounded-xl px-4 py-3 ${
                  result.ok
                    ? 'bg-green-50 text-green-700 border border-green-100'
                    : 'bg-red-50 text-red-600 border border-red-100'
                }`}
              >
                {result.ok ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <XCircle className="w-4 h-4 shrink-0" />}
                <span>{result.message}</span>
              </div>
            )}

            <div className="flex justify-end">
              <button
                onClick={save}
                disabled={saving || !configured}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-yellow-400 hover:bg-yellow-500 disabled:opacity-60 text-navy-950 text-xs font-black rounded-xl transition-colors"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Popup
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
