'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { PackageSearch, PackageCheck, PackageOpen, Truck, Clock, CheckCircle2, XCircle, Loader2, Phone, Hash, ArrowRight, MapPin, CalendarDays, Mail, MessageCircleQuestion } from 'lucide-react';
import { useTranslation } from '@/i18n/useTranslation';

interface TrackedOrderResult {
  id: number;
  status: string;
  statusLabel: string;
  total: string;
  currency: string;
  dateCreated: string;
}

const STATUS_STEPS = [
  { status: 'pending', label: 'Pending Payment', icon: Clock },
  { status: 'processing', label: 'Processing', icon: PackageOpen },
  { status: 'completed', label: 'Delivered', icon: CheckCircle2 },
];

const STATUS_STYLE: Record<string, string> = {
  pending: 'bg-amber-50 border-amber-200 text-amber-700',
  processing: 'bg-blue-50 border-blue-200 text-blue-700',
  'on-hold': 'bg-orange-50 border-orange-200 text-orange-700',
  completed: 'bg-emerald-50 border-emerald-200 text-emerald-700',
  cancelled: 'bg-red-50 border-red-200 text-red-600',
  refunded: 'bg-purple-50 border-purple-200 text-purple-700',
  failed: 'bg-red-50 border-red-200 text-red-600',
};

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return iso;
  }
}

export default function TrackOrderPage() {
  const { t } = useTranslation();
  const [orderId, setOrderId] = useState('');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<TrackedOrderResult | null>(null);
  const [error, setError] = useState('');

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setResult(null);
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ orderId: orderId.trim(), phone: phone.trim() });
      const res = await fetch(`/api/orders/track?${params.toString()}`);
      const data = (await res.json()) as {
        success: boolean;
        message?: string;
        order?: TrackedOrderResult;
      };
      if (!data.success || !data.order) {
        setError(data.message ?? t('Failed to track order. Please try again.'));
        return;
      }
      setResult(data.order);
    } catch {
      setError(t('Failed to track order. Please try again.'));
    } finally {
      setIsLoading(false);
    }
  };

  const currentStepIndex = result
    ? STATUS_STEPS.findIndex((s) => s.status === result.status)
    : -1;

  return (
    <div className="py-12 bg-slate-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">

        {/* Banner */}
        <div className="text-center max-w-3xl mx-auto">
          <span className="text-xs font-bold text-brand-600 uppercase tracking-widest bg-brand-100/80 px-3.5 py-1.5 rounded-full inline-flex items-center gap-1.5">
            <PackageSearch className="w-3.5 h-3.5" /> {t('ORDER TRACKING')}
          </span>
          <h1 className="text-3xl sm:text-5xl font-black font-heading text-navy-900 mt-3">
            {t('Track Your Order')}
          </h1>
          <p className="text-slate-600 text-sm sm:text-base mt-2">
            {t('Track your Apni Padhai book order using your order ID and the mobile number you entered at checkout.')}
          </p>
        </div>

        {/* Track Form */}
        <form
          onSubmit={handleTrack}
          className="max-w-2xl mx-auto bg-white rounded-3xl border border-slate-200 shadow-card p-6 sm:p-8 space-y-4"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5 text-amber-600" /> {t('Order ID')}
              </label>
              <input
                type="text"
                inputMode="numeric"
                required
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder={t('e.g. 12456')}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-amber-500 focus:bg-white transition-colors text-navy-900"
              />
              <p className="text-[10px] text-slate-400">{t('Order ID is mentioned in your order confirmation email & WhatsApp.')}</p>
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-amber-600" /> {t('Mobile Number')}
              </label>
              <input
                type="tel"
                inputMode="numeric"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={t('10-digit mobile number')}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-amber-500 focus:bg-white transition-colors text-navy-900"
              />
              <p className="text-[10px] text-slate-400">{t('Must be the same number used at the time of order.')}</p>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-xs font-bold text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              <XCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-yellow-400 hover:to-amber-500 text-navy-950 font-black text-sm rounded-xl shadow-button-glow transition-all flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{t('Tracking order...')}</span>
              </>
            ) : (
              <>
                <PackageSearch className="w-4 h-4" />
                <span>{t('Track Order')}</span>
              </>
            )}
          </button>
        </form>

        {/* Result */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              className="max-w-2xl mx-auto bg-white rounded-3xl border border-slate-200 shadow-card p-6 sm:p-8"
            >
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-2xl flex items-center justify-center text-white shrink-0">
                    <PackageCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-bold">{t('Order')} #{result.id}</p>
                    <span className={`inline-flex items-center gap-1.5 mt-1 px-3 py-1 rounded-full text-[11px] font-black border ${STATUS_STYLE[result.status] ?? 'bg-slate-50 border-slate-200 text-slate-600'}`}>
                      <Truck className="w-3.5 h-3.5" /> {result.statusLabel}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500 font-bold">{t('Total Amount')}</p>
                  <p className="text-xl font-black font-heading text-navy-900">
                    {result.currency === 'INR' ? '₹' : result.currency}{' '}
                    {result.total}
                  </p>
                </div>
              </div>

              {/* Timeline */}
              <div className="mt-6 grid grid-cols-3 gap-2">
                {STATUS_STEPS.map((step, idx) => {
                  const Icon = step.icon;
                  const isReached = result && currentStepIndex >= idx;
                  const isCancelled = result && ['cancelled', 'refunded', 'failed'].includes(result.status);
                  return (
                    <div key={step.status} className="flex flex-col items-center gap-2 text-center">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                          isCancelled
                            ? 'border-red-200 bg-red-50 text-red-400'
                            : isReached
                            ? 'border-emerald-400 bg-emerald-50 text-emerald-600'
                            : 'border-slate-200 bg-slate-50 text-slate-400'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <span
                        className={`text-[10px] font-bold ${
                          isCancelled
                            ? 'text-red-400'
                            : isReached
                            ? 'text-emerald-600'
                            : 'text-slate-400'
                        }`}
                      >
                        {t(step.label)}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 pt-5 border-t border-slate-100 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-500">
                <span className="flex items-center gap-1.5">
                  <CalendarDays className="w-3.5 h-3.5 text-amber-600" /> {t('Ordered on')} {formatDate(result.dateCreated)}
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-amber-600" /> {t('Delivering across India')}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Help cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-card p-6">
            <div className="w-11 h-11 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-3">
              <Mail className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold font-heading text-navy-900">{t('Did not receive tracking info?')}</h3>
            <p className="text-xs text-slate-500 leading-relaxed mt-1.5">
              {t('Once your order ships, a confirmation email with tracking details is sent to your registered email. Delivery takes 5-10 days across India.')}
            </p>
          </div>
          <div className="bg-white rounded-3xl border border-slate-200 shadow-card p-6">
            <div className="w-11 h-11 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center mb-3">
              <MessageCircleQuestion className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold font-heading text-navy-900">{t('Need more help?')}</h3>
            <p className="text-xs text-slate-500 leading-relaxed mt-1.5">
              {t('Call or WhatsApp')}{' '}
              <a href="tel:+917568716768" className="font-bold text-amber-700">+91 7568716768</a>{' '}
              {t('or email')}{' '}
              <a href="mailto:support@apnipadhaipublication.com" className="font-bold text-amber-700">support@apnipadhaipublication.com</a>.
            </p>
          </div>
        </div>

        {/* Back link */}
        <div className="text-center">
          <Link
            href="/faq"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-amber-700 transition-colors"
          >
            <ArrowRight className="w-4 h-4 rotate-180" />
            <span>{t('Back to FAQs')}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
