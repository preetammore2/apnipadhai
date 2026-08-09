'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Loader2, Smartphone } from 'lucide-react';
import { useTranslation } from '@/i18n/useTranslation';
import { loadPhonePeCheckout } from '@/lib/phonepe-checkout';

type PaymentState = 'loading' | 'cancelled' | 'error';

function PaymentPageContent() {
  const { t } = useTranslation();
  const [state, setState] = useState<PaymentState>('loading');
  const [message, setMessage] = useState('');
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    (async () => {
      try {
        const res = await fetch('/api/payments/resume', { method: 'POST' });
        const data = await res.json();

        if (!res.ok || !data.redirectUrl) {
          setState('error');
          setMessage(data.message || t('Could not start payment. Please try again.'));
          return;
        }

        if (!data.embed) {
          window.location.href = data.redirectUrl;
          return;
        }

        let sdk;
        try {
          sdk = await loadPhonePeCheckout();
        } catch {
          window.location.href = data.redirectUrl;
          return;
        }

        try {
          sdk.transact({
            tokenUrl: data.redirectUrl,
            type: 'IFRAME',
            callback: (response) => {
              if (response === 'CONCLUDED') {
                window.location.href = `/payment/status?merchantTransactionId=${data.merchantTransactionId}`;
              } else {
                setState('cancelled');
              }
            },
          });
        } catch {
          window.location.href = data.redirectUrl;
          return;
        }
      } catch (error) {
        console.error('[payment] failed to start payment', error);
        setState('error');
        setMessage(t('Could not start payment. Please try again.'));
      }
    })();
  }, [t]);

  return (
    <div className="py-20 bg-slate-50 min-h-screen flex items-center justify-center">
      <div className="bg-white p-10 rounded-3xl border border-slate-200 shadow-card max-w-md w-full text-center space-y-5">
        {state === 'loading' && (
          <>
            <div className="w-16 h-16 bg-brand-50 text-brand-600 rounded-full flex items-center justify-center mx-auto">
              <Smartphone className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold font-heading text-navy-900">
              {t('Opening Secure Payment...')}
            </h2>
            <p className="text-xs text-slate-500">
              {t('Please complete the payment in the secure window.')}
            </p>
            <Loader2 className="w-6 h-6 text-brand-500 animate-spin mx-auto" />
          </>
        )}

        {state === 'cancelled' && (
          <>
            <div className="w-16 h-16 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center mx-auto">
              <ArrowLeft className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold font-heading text-navy-900">
              {t('Payment cancelled. Your order was not charged.')}
            </h2>
            <div className="pt-2 space-y-2">
              <Link
                href="/checkout"
                className="block w-full px-6 py-3 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white rounded-xl text-xs font-bold shadow-button-glow transition-all"
              >
                {t('Back to Checkout')}
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

        {state === 'error' && (
          <>
            <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto">
              <Smartphone className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold font-heading text-navy-900">
              {t('Payment could not be started')}
            </h2>
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

export default function PaymentPage() {
  return <PaymentPageContent />;
}
