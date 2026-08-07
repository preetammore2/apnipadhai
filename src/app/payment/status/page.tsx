'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { useAppDispatch } from '@/redux/hooks';
import { clearCart } from '@/redux/features/cart/cartSlice';
import { useTranslation } from '@/i18n/useTranslation';

function PaymentStatusContent() {
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  const merchantTransactionId = searchParams.get('merchantTransactionId');
  const transactionId = searchParams.get('transactionId');
  const amountPaise = Number(searchParams.get('amount') || 0);

  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!merchantTransactionId) {
      setStatus('failed');
      setMessage(t('Missing payment reference'));
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const res = await fetch('/api/payments/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ merchantTransactionId }),
        });
        const data = await res.json();
        if (cancelled) return;

        if (res.ok && data.success) {
          setStatus('success');
          dispatch(clearCart());
        } else {
          setStatus('failed');
          setMessage(data.message || t('Payment could not be verified'));
        }
      } catch {
        if (!cancelled) {
          setStatus('failed');
          setMessage(t('Network error while verifying payment'));
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [merchantTransactionId, dispatch, t]);

  return (
    <div className="py-20 bg-slate-50 min-h-screen flex items-center justify-center">
      <div className="bg-white p-10 rounded-3xl border border-slate-200 shadow-card text-center max-w-md mx-auto space-y-5">
        {status === 'loading' && (
          <>
            <Loader2 className="w-12 h-12 text-brand-500 animate-spin mx-auto" />
            <h2 className="text-2xl font-bold font-heading text-navy-900">
              {t('Verifying your payment...')}
            </h2>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold font-heading text-navy-900">
              {t('Payment Successful!')}
            </h2>
            <p className="text-xs text-slate-500">
              {t('Your payment has been verified securely.')}
            </p>
            {transactionId && (
              <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-left space-y-1">
                <div className="flex justify-between text-xs text-slate-500">
                  <span>{t('Payment Reference')}</span>
                  <span className="font-bold text-navy-900">{transactionId}</span>
                </div>
                {amountPaise > 0 && (
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>{t('Amount Paid')}</span>
                    <span className="font-bold text-navy-900">₹{(amountPaise / 100).toLocaleString('en-IN')}</span>
                  </div>
                )}
              </div>
            )}
            <div className="pt-2 space-y-2">
              <Link
                href="/dashboard"
                className="block w-full px-6 py-3 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white rounded-xl text-xs font-bold shadow-button-glow transition-all"
              >
                {t('Go to Student Dashboard')}
              </Link>
              <Link
                href="/"
                className="block w-full px-6 py-3 bg-white border border-slate-200 text-navy-900 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all"
              >
                {t('Back to Home')}
              </Link>
            </div>
          </>
        )}

        {status === 'failed' && (
          <>
            <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto">
              <XCircle className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold font-heading text-navy-900">{t('Payment Failed')}</h2>
            {message && <p className="text-xs text-slate-500">{message}</p>}
            <div className="pt-2 space-y-2">
              <Link
                href="/checkout"
                className="block w-full px-6 py-3 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white rounded-xl text-xs font-bold shadow-button-glow transition-all"
              >
                {t('Try Again')}
              </Link>
              <Link
                href="/"
                className="block w-full px-6 py-3 bg-white border border-slate-200 text-navy-900 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all"
              >
                {t('Back to Home')}
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function PaymentStatusPage() {
  return (
    <Suspense
      fallback={
        <div className="py-20 bg-slate-50 min-h-screen flex items-center justify-center">
          <Loader2 className="w-10 h-10 text-brand-500 animate-spin" />
        </div>
      }
    >
      <PaymentStatusContent />
    </Suspense>
  );
}
