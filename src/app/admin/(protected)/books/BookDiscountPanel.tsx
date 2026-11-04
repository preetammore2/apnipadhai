'use client';

import { useCallback, useEffect, useState } from 'react';
import { CheckCircle2, ChevronDown, ChevronUp, Loader2, Percent, Save, XCircle } from 'lucide-react';
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

function describe(discount: BookDiscount | null): string {
  if (!discount || !isBookDiscountActive(discount)) return 'Off';
  const amount =
    discount.type === 'flat'
      ? `₹${discount.value} off each book`
      : `${discount.value}% of ${discount.base === 'mrp' ? 'MRP' : 'selling price'} off`;
  return discount.expiresAt ? `${amount} · until ${discount.expiresAt}` : `${amount} · no expiry`;
}

/**
 * Store-wide extra discount on every book's selling price, shown at the top of
 * the Books page. Saved via /api/admin/book-discount (needs the "Book
 * Discount" permission). WooCommerce prices themselves are never changed.
 */
export default function BookDiscountPanel() {
  const [form, setForm] = useState<DiscountForm>({
    enabled: false,
    type: 'percent',
    base: 'selling',
    value: '',
    noExpiry: false,
    expiresAt: '',
  });
  const [saved, setSaved] = useState<BookDiscount | null>(null);
  const [open, setOpen] = useState(false);
  const [configured, setConfigured] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

  const applyLoaded = (d: BookDiscount) => {
    setSaved(d);
    setForm({
      enabled: d.enabled,
      type: d.type,
      base: d.base,
      value: d.value ? String(d.value) : '',
      // Most discounts have an end date: only show "No expiry" ticked when a
      // running discount was saved without one.
      noExpiry: d.enabled && !d.expiresAt,
      expiresAt: d.expiresAt ?? '',
    });
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/book-discount');
      const data = await res.json();
      if (!res.ok || !data.success) {
        setResult({ ok: false, message: data.message || 'Failed to load the book discount' });
        return;
      }
      setConfigured(data.configured ?? true);
      applyLoaded(data.discount);
    } catch {
      setResult({ ok: false, message: 'Could not load the book discount' });
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
  const previewPrice =
    preview.value > 0 ? discountedPrice(EXAMPLE.price, EXAMPLE.mrp, preview) : EXAMPLE.price;
  const expired =
    form.enabled && !form.noExpiry && form.expiresAt !== '' && !isBookDiscountActive(toDiscount(form));
  const active = isBookDiscountActive(saved);

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm mb-6">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 px-5 py-4 text-left"
        aria-expanded={open}
      >
        <span className="w-10 h-10 bg-rose-100 text-rose-700 rounded-xl flex items-center justify-center shrink-0">
          <Percent className="w-5 h-5" />
        </span>
        <span className="flex-1 min-w-0">
          <span className="block text-sm font-black text-navy-900">Book Discount (all books)</span>
          <span className={`block text-xs font-semibold ${active ? 'text-emerald-700' : 'text-slate-500'}`}>
            {loading ? 'Loading…' : describe(saved)}
          </span>
        </span>
        {open ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
      </button>

      {open && (
        <div className="px-5 pb-5 space-y-4 border-t border-slate-100 pt-4">
          {!configured && (
            <p className="text-xs text-amber-900 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
              Firebase is not configured on the server, so the discount cannot be saved.
            </p>
          )}
          <p className="text-xs text-slate-500">
            Extra discount on every book&apos;s selling price, on the site and in checkout. Your
            WooCommerce prices are not changed — turn it off (or let it expire) and prices go back
            to normal.
          </p>

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
                placeholder="10"
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
            <span className="text-slate-500">
              Example: a book with MRP ₹{EXAMPLE.mrp} selling at ₹{EXAMPLE.price} →{' '}
            </span>
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
  );
}
