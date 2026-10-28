'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  CheckCircle2,
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  Save,
  Tag,
  Trash2,
  X,
  XCircle,
} from 'lucide-react';
import LogoutButton from '@/app/admin/components/LogoutButton';

type CouponType = 'percent' | 'fixed_cart' | 'fixed_product';

interface Coupon {
  id: number;
  code: string;
  type: CouponType;
  amount: number;
  description: string;
  expiresAt: string | null;
  usageCount: number;
  usageLimit: number;
  minimumAmount: number;
  maximumAmount: number;
  restricted: boolean;
}

interface CouponForm {
  code: string;
  type: CouponType;
  amount: string;
  description: string;
  expiresAt: string;
  usageLimit: string;
  minimumAmount: string;
  maximumAmount: string;
}

const EMPTY_FORM: CouponForm = {
  code: '',
  type: 'percent',
  amount: '',
  description: '',
  expiresAt: '',
  usageLimit: '',
  minimumAmount: '',
  maximumAmount: '',
};

const TYPE_LABELS: Record<CouponType, string> = {
  percent: 'Percentage off the books (%)',
  fixed_cart: 'Flat ₹ off the whole order',
  fixed_product: 'Flat ₹ off each book',
};

function describeDiscount(coupon: Coupon): string {
  if (coupon.type === 'percent') return `${coupon.amount}% off`;
  if (coupon.type === 'fixed_product') return `₹${coupon.amount} off each book`;
  return `₹${coupon.amount} off`;
}

function couponState(coupon: Coupon): { label: string; className: string } {
  if (coupon.expiresAt && new Date(`${coupon.expiresAt}T23:59:59+05:30`).getTime() < Date.now()) {
    return { label: 'Expired', className: 'bg-slate-100 text-slate-500' };
  }
  if (coupon.usageLimit > 0 && coupon.usageCount >= coupon.usageLimit) {
    return { label: 'Used up', className: 'bg-slate-100 text-slate-500' };
  }
  return { label: 'Active', className: 'bg-emerald-50 text-emerald-700' };
}

function toForm(coupon: Coupon): CouponForm {
  return {
    code: coupon.code,
    type: coupon.type,
    amount: String(coupon.amount),
    description: coupon.description,
    expiresAt: coupon.expiresAt ?? '',
    usageLimit: coupon.usageLimit ? String(coupon.usageLimit) : '',
    minimumAmount: coupon.minimumAmount ? String(coupon.minimumAmount) : '',
    maximumAmount: coupon.maximumAmount ? String(coupon.maximumAmount) : '',
  };
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState<CouponForm>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/coupons');
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.message || 'Failed to load coupons');
        return;
      }
      setCoupons(data.coupons ?? []);
    } catch {
      setError('Could not load coupons');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function resetForm() {
    setForm(EMPTY_FORM);
    setEditingId(null);
  }

  async function save() {
    setResult(null);
    const code = form.code.trim();
    if (editingId === null && !/^[A-Za-z0-9_-]{3,40}$/.test(code)) {
      setResult({ ok: false, message: 'Code must be 3–40 letters, numbers, - or _ (no spaces).' });
      return;
    }
    if (!(Number(form.amount) > 0)) {
      setResult({ ok: false, message: 'Enter a discount amount greater than zero.' });
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...(editingId === null ? { code } : {}),
        type: form.type,
        amount: form.amount,
        description: form.description,
        expiresAt: form.expiresAt || null,
        usageLimit: form.usageLimit || '0',
        minimumAmount: form.minimumAmount || '0',
        maximumAmount: form.maximumAmount || '0',
      };
      const res = await fetch(
        editingId === null ? '/api/admin/coupons' : `/api/admin/coupons/${editingId}`,
        {
          method: editingId === null ? 'POST' : 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        },
      );
      const data = await res.json();
      if (!res.ok || !data.success) {
        setResult({ ok: false, message: data.message || 'Could not save the coupon' });
        return;
      }
      setResult({
        ok: true,
        message:
          editingId === null
            ? `Coupon ${data.coupon.code} created. Customers can use it at checkout right away.`
            : `Coupon ${data.coupon.code} updated.`,
      });
      resetForm();
      await load();
    } catch {
      setResult({ ok: false, message: 'Could not save the coupon' });
    } finally {
      setSaving(false);
    }
  }

  async function remove(coupon: Coupon) {
    if (!window.confirm(`Delete coupon ${coupon.code}? Customers will no longer be able to use it.`)) {
      return;
    }
    setResult(null);
    setDeletingId(coupon.id);
    try {
      const res = await fetch(`/api/admin/coupons/${coupon.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setResult({ ok: false, message: data.message || 'Could not delete the coupon' });
        return;
      }
      if (editingId === coupon.id) resetForm();
      setCoupons((list) => list.filter((c) => c.id !== coupon.id));
      setResult({ ok: true, message: `Coupon ${coupon.code} deleted.` });
    } catch {
      setResult({ ok: false, message: 'Could not delete the coupon' });
    } finally {
      setDeletingId(null);
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
              <h1 className="text-lg font-black font-heading leading-none">Coupons</h1>
              <p className="text-xs text-white/60 mt-1">WooCommerce coupons used at checkout</p>
            </div>
          </div>
          <LogoutButton />
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <p className="flex-1 text-sm text-slate-500">
            Coupons are stored in WooCommerce, so they also appear under WooCommerce → Marketing →
            Coupons. Coupons are not taken off the delivery charge.
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

        {/* Create / edit form */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sm:p-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-black font-heading text-navy-900">
              {editingId === null ? 'New coupon' : `Edit ${form.code}`}
            </h2>
            {editingId !== null && (
              <button
                type="button"
                onClick={resetForm}
                className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-navy-900"
              >
                <X className="w-4 h-4" /> Cancel edit
              </button>
            )}
          </div>

          <div className="grid gap-3">
            <div className="grid sm:grid-cols-3 gap-3">
              <label className="grid gap-1 text-xs font-bold text-navy-900">
                Code *
                <input
                  value={form.code}
                  disabled={editingId !== null}
                  onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase().replace(/\s/g, '') })}
                  placeholder="e.g. RAS10"
                  className="input-field uppercase font-mono disabled:bg-slate-50 disabled:text-slate-500"
                />
              </label>
              <label className="grid gap-1 text-xs font-bold text-navy-900">
                Discount type
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value as CouponType })}
                  className="input-field"
                >
                  {(Object.keys(TYPE_LABELS) as CouponType[]).map((type) => (
                    <option key={type} value={type}>
                      {TYPE_LABELS[type]}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-1 text-xs font-bold text-navy-900">
                {form.type === 'percent' ? 'Percent off *' : 'Amount off (₹) *'}
                <input
                  type="number"
                  min={0}
                  max={form.type === 'percent' ? 100 : undefined}
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  placeholder={form.type === 'percent' ? '10' : '50'}
                  className="input-field"
                />
              </label>
            </div>
            <div className="grid sm:grid-cols-4 gap-3">
              <label className="grid gap-1 text-xs font-bold text-navy-900">
                Valid until
                <input
                  type="date"
                  value={form.expiresAt}
                  onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
                  className="input-field"
                />
              </label>
              <label className="grid gap-1 text-xs font-bold text-navy-900">
                Total uses allowed
                <input
                  type="number"
                  min={0}
                  value={form.usageLimit}
                  onChange={(e) => setForm({ ...form, usageLimit: e.target.value })}
                  placeholder="Unlimited"
                  className="input-field"
                />
              </label>
              <label className="grid gap-1 text-xs font-bold text-navy-900">
                Minimum order (₹)
                <input
                  type="number"
                  min={0}
                  value={form.minimumAmount}
                  onChange={(e) => setForm({ ...form, minimumAmount: e.target.value })}
                  placeholder="None"
                  className="input-field"
                />
              </label>
              <label className="grid gap-1 text-xs font-bold text-navy-900">
                Maximum order (₹)
                <input
                  type="number"
                  min={0}
                  value={form.maximumAmount}
                  onChange={(e) => setForm({ ...form, maximumAmount: e.target.value })}
                  placeholder="None"
                  className="input-field"
                />
              </label>
            </div>
            <label className="grid gap-1 text-xs font-bold text-navy-900">
              Note (only visible to admins)
              <input
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="e.g. Diwali offer for RAS students"
                className="input-field"
              />
            </label>
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
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-yellow-400 hover:bg-yellow-500 disabled:opacity-60 text-navy-950 text-xs font-black rounded-xl transition-colors"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : editingId === null ? (
                <Plus className="w-4 h-4" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {editingId === null ? 'Create Coupon' : 'Save Changes'}
            </button>
          </div>
        </div>

        {/* Coupon list */}
        {error && (
          <p className="text-sm font-semibold text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
            {error}
          </p>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20 text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : coupons.length === 0 && !error ? (
          <div className="border border-dashed border-slate-200 rounded-2xl py-10 text-center bg-white">
            <Tag className="w-6 h-6 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-400">No coupons yet — create one above.</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {coupons.map((coupon) => {
              const state = couponState(coupon);
              return (
                <div
                  key={coupon.id}
                  className="bg-white border border-slate-100 shadow-sm rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center gap-3"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono font-black text-navy-900">{coupon.code}</span>
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${state.className}`}>
                        {state.label}
                      </span>
                      <span className="text-xs font-bold text-brand-600">{describeDiscount(coupon)}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Used {coupon.usageCount}
                      {coupon.usageLimit > 0 ? ` / ${coupon.usageLimit}` : ''} times
                      {coupon.expiresAt ? ` · valid until ${coupon.expiresAt}` : ' · no expiry'}
                      {coupon.minimumAmount > 0 ? ` · min ₹${coupon.minimumAmount}` : ''}
                      {coupon.maximumAmount > 0 ? ` · max ₹${coupon.maximumAmount}` : ''}
                    </p>
                    {coupon.restricted && (
                      <p className="text-[11px] text-amber-700 mt-1">
                        Limited to certain books/categories (set in WooCommerce admin).
                      </p>
                    )}
                    {coupon.description && (
                      <p className="text-[11px] text-slate-400 mt-1 truncate">{coupon.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 self-end sm:self-auto">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(coupon.id);
                        setForm(toForm(coupon));
                        setResult(null);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="p-2 text-slate-400 hover:text-navy-900 hover:bg-slate-100 rounded-lg transition-colors"
                      aria-label={`Edit ${coupon.code}`}
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(coupon)}
                      disabled={deletingId === coupon.id}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                      aria-label={`Delete ${coupon.code}`}
                    >
                      {deletingId === coupon.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
