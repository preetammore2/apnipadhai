'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, Loader2, RefreshCw, Save, XCircle } from 'lucide-react';
import LogoutButton from '@/app/admin/components/LogoutButton';

interface DeliveryForm {
  amount: string;
  perExtraItem: string;
  label: string;
}

const PREVIEW_QUANTITIES = [1, 2, 3, 5];

export default function AdminDeliveryPage() {
  const [form, setForm] = useState<DeliveryForm>({ amount: '', perExtraItem: '', label: '' });
  const [configured, setConfigured] = useState(true);
  const [saved, setSaved] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/delivery');
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.message || 'Failed to load delivery settings');
        return;
      }
      setConfigured(data.configured ?? true);
      setSaved(data.saved ?? false);
      setForm({
        amount: String(data.delivery.amount),
        perExtraItem: String(data.delivery.perExtraItem),
        label: data.delivery.label,
      });
    } catch {
      setError('Could not load delivery settings');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function save() {
    setResult(null);
    const amount = Number(form.amount);
    const perExtraItem = Number(form.perExtraItem);
    if (form.amount === '' || form.perExtraItem === '' || !(amount >= 0) || !(perExtraItem >= 0)) {
      setResult({ ok: false, message: 'Enter both charges (use 0 for free).' });
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/admin/delivery', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, perExtraItem, label: form.label }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setResult({ ok: false, message: data.message || 'Could not save delivery settings' });
        return;
      }
      setSaved(true);
      setForm({
        amount: String(data.delivery.amount),
        perExtraItem: String(data.delivery.perExtraItem),
        label: data.delivery.label,
      });
      setResult({
        ok: true,
        message: 'Delivery charges saved. New orders use them right away; the cart updates within a minute.',
      });
    } catch {
      setResult({ ok: false, message: 'Could not save delivery settings' });
    } finally {
      setSaving(false);
    }
  }

  const base = Number(form.amount) || 0;
  const extra = Number(form.perExtraItem) || 0;

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
              <h1 className="text-lg font-black font-heading leading-none">Delivery Charges</h1>
              <p className="text-xs text-white/60 mt-1">Charged on every order at checkout</p>
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
            on the server to change delivery charges from here.
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
          <p className="flex-1 text-sm text-slate-500">
            Delivery = base charge for the first book + extra charge for every additional book
            (each copy counts). Coupons do not reduce delivery.
            {!saved && configured && !loading && ' Showing the current defaults — nothing saved here yet.'}
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
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sm:p-8">
            <div className="grid sm:grid-cols-3 gap-3">
              <label className="grid gap-1 text-xs font-bold text-navy-900">
                Base delivery (first book) ₹
                <input
                  type="number"
                  min={0}
                  value={form.amount}
                  onChange={(e) => {
                    setForm({ ...form, amount: e.target.value });
                    setResult(null);
                  }}
                  placeholder="40"
                  className="input-field"
                />
              </label>
              <label className="grid gap-1 text-xs font-bold text-navy-900">
                Each additional book ₹
                <input
                  type="number"
                  min={0}
                  value={form.perExtraItem}
                  onChange={(e) => {
                    setForm({ ...form, perExtraItem: e.target.value });
                    setResult(null);
                  }}
                  placeholder="15"
                  className="input-field"
                />
              </label>
              <label className="grid gap-1 text-xs font-bold text-navy-900">
                Label shown at checkout
                <input
                  value={form.label}
                  onChange={(e) => {
                    setForm({ ...form, label: e.target.value });
                    setResult(null);
                  }}
                  placeholder="Delivery Charges"
                  className="input-field"
                />
              </label>
            </div>

            <div className="mt-6">
              <p className="text-xs font-bold text-navy-900 mb-2">What customers will pay</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {PREVIEW_QUANTITIES.map((qty) => {
                  const charge = base + (qty - 1) * extra;
                  return (
                    <div key={qty} className="border border-slate-200 rounded-xl px-3 py-2.5">
                      <p className="text-[11px] text-slate-500">
                        {qty} {qty === 1 ? 'book' : 'books'}
                      </p>
                      <p className="text-sm font-black text-navy-900">
                        {charge > 0 ? `₹${charge}` : 'FREE'}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

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
                disabled={saving || !configured}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-yellow-400 hover:bg-yellow-500 disabled:opacity-60 text-navy-950 text-xs font-black rounded-xl transition-colors"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Delivery Charges
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
