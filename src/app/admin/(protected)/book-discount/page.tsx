'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, Loader2, RefreshCw, Save, XCircle } from 'lucide-react';
import LogoutButton from '@/app/admin/components/LogoutButton';
import {
  discountedPrice,
  isBookDiscountActive,
  type BookDiscount,
} from '@/lib/book-discount';

interface DiscountForm {
  enabled: boolean;
  type: 'percent' | 'flat';
  base: 'mrp' | 'selling';
  value: string;
  noExpiry: boolean;
  expiresAt: string;
}

/** The example from a typical book: MRP ₹150, selling at ₹100. */
const EXAMPLE = { mrp: 150, price: 100 };

function toDiscount(form: DiscountForm): BookDiscount {
  return {
    enabled: form.enabled,
    type: form.type,
    base: form.base,
    value: Number(form.value) || 0,
    expiresAt: form.noExpiry ? null : form.expiresAt || null,
  };
}

export default function AdminBookDiscountPage() {
  const [form, setForm] = useState<DiscountForm>({
    enabled: false,
    type: 'percent',
    base: 'selling',
    value: '',
    noExpiry: true,
    expiresAt: '',
  });
  const [configured, setConfigured] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

  const applyLoaded = (d: BookDiscount) =>
    setForm({
      enabled: d.enabled,
      type: d.type,
      base: d.base,
      value: d.value ? String(d.value) : '',
      noExpiry: !d.expiresAt,
      expiresAt: d.expiresAt ?? '',
    });

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/book-discount');
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.message || 'Failed to load the book discount');
        return;
      }
      setConfigured(data.configured ?? true);
      applyLoaded(data.discount);
    } catch {
      setError('Could not load the book discount');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const update = (next: Partial<DiscountForm>) => {
    setForm((prev) => ({ ...prev, ...next }));
    setResult(null);
  };

  async function save() {
    setResult(null);
    const discount = toDiscount(form);
    if (discount.enabled) {
      if (!(discount.value > 0)) {
        setResult({ ok: false, message: 'Enter a discount greater than zero.' });
        return;
      }
      if (discount.type === 'percent' && discount.value > 100) {
        setResult({ ok: false, message: 'A percentage discount cannot be more than 100.' });
        return;
      }
      if (!form.noExpiry && !form.expiresAt) {
        setResult({ ok: false, message: 'Pick an end date, or tick "No expiry".' });
        return;
      }
    }

    setSaving(true);
    try {
      const res = await fetch('/api/admin/book-discount', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(discount),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setResult({ ok: false, message: data.message || 'Could not save the book discount' });
        return;
      }
      applyLoaded(data.discount);
      setResult({
        ok: true,
        message: data.discount.enabled
          ? 'Discount saved. All book prices on the site update within a minute.'
          : 'Discount turned off. Book prices return to normal within a minute.',
      });
    } catch {
      setResult({ ok: false, message: 'Could not save the book discount' });
    } finally {
      setSaving(false);
    }
  }

  const preview = toDiscount({ ...form, enabled: true });
  const previewPrice = preview.value > 0 ? discountedPrice(EXAMPLE.price, EXAMPLE.mrp, preview) : EXAMPLE.price;
  const expired = form.enabled && !form.noExpiry && form.expiresAt !== '' && !isBookDiscountActive(toDiscount(form));

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
              <h1 className="text-lg font-black font-heading leading-none">Book Discount</h1>
              <p className="text-xs text-white/60 mt-1">Extra discount on every book&apos;s selling price</p>
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
            on the server to manage the book discount from here.
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
          <p className="flex-1 text-sm text-slate-500">
            Applies to all books on the site and in checkout. Your WooCommerce prices are not
            changed — turn the discount off (or let it expire) and prices go back to normal.
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
              Discount is on
            </label>

            <div className="grid sm:grid-cols-3 gap-3">
              <label className="grid gap-1 text-xs font-bold text-navy-900">
                Discount type
                <select
                  value={form.type}
                  onChange={(e) => update({ type: e.target.value as DiscountForm['type'] })}
                  className="input-field"
                >
                  <option value="percent">Percentage (%)</option>
                  <option value="flat">Flat amount (₹ off each book)</option>
                </select>
              </label>
              {form.type === 'percent' && (
                <label className="grid gap-1 text-xs font-bold text-navy-900">
                  Percentage of
                  <select
                    value={form.base}
                    onChange={(e) => update({ base: e.target.value as DiscountForm['base'] })}
                    className="input-field"
                  >
                    <option value="selling">Selling price</option>
                    <option value="mrp">MRP</option>
                  </select>
                </label>
              )}
              <label className="grid gap-1 text-xs font-bold text-navy-900">
                {form.type === 'percent' ? 'Percent off' : 'Amount off (₹)'}
                <input
                  type="number"
                  min={0}
                  max={form.type === 'percent' ? 100 : undefined}
                  value={form.value}
                  onChange={(e) => update({ value: e.target.value })}
                  placeholder={form.type === 'percent' ? '10' : '10'}
                  className="input-field"
                />
              </label>
            </div>

            <div className="grid sm:grid-cols-3 gap-3 items-end">
              <label className="grid gap-1 text-xs font-bold text-navy-900">
                Valid until (end of day)
                <input
                  type="date"
                  value={form.expiresAt}
                  disabled={form.noExpiry}
                  onChange={(e) => update({ expiresAt: e.target.value })}
                  className="input-field disabled:bg-slate-50 disabled:text-slate-400"
                />
              </label>
              <label className="flex items-center gap-2 text-xs font-bold text-navy-900 input-field bg-slate-50">
                <input
                  type="checkbox"
                  checked={form.noExpiry}
                  onChange={(e) => update({ noExpiry: e.target.checked })}
                  className="accent-emerald-600"
                />
                No expiry
              </label>
            </div>

            <div className="border border-slate-200 rounded-xl px-4 py-3 text-sm text-navy-900">
              <span className="text-slate-500">Example: a book with MRP ₹{EXAMPLE.mrp} selling at ₹{EXAMPLE.price} → </span>
              <strong>₹{previewPrice}</strong>
              {expired && (
                <span className="block text-xs font-semibold text-amber-700 mt-1">
                  This end date has already passed — the discount will not be applied.
                </span>
              )}
            </div>

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
                Save Discount
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
