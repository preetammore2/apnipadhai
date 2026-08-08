'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Send, CheckCircle2, Loader2, BadgePercent, Truck, Headphones, BookOpen, ShieldCheck } from 'lucide-react';
import { useTranslation } from '@/i18n/useTranslation';

const PERKS = [
  { label: 'Best prices & offers', icon: BadgePercent },
  { label: 'Fast delivery', icon: Truck },
  { label: '24/7 active', icon: Headphones },
  { label: 'Best Content Books', icon: BookOpen },
];

export const NewsletterSection: React.FC = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setStatus('error');
      return;
    }

    setStatus('loading');
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmed }),
      });
      if (!res.ok) throw new Error('Subscription failed');
      setStatus('success');
    } catch {
      setStatus('error');
    }
  };

  return (
    <section className="relative overflow-hidden bg-navy-950 py-20">
      {/* Decorative blobs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center">
          <span className="px-4 py-1.5 bg-yellow-400/10 text-yellow-300 border border-yellow-400/20 rounded-full text-xs font-black uppercase tracking-wider inline-flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5 text-yellow-400" /> {t('NEWSLETTER')}
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold font-heading text-white mt-4">
            {t('Never Miss an Update')}
          </h2>
          <p className="text-slate-400 text-sm sm:text-base mt-2">
            {t('Enter your email and receive a discount on your next order!')}
          </p>
        </div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45 }}
          className="mt-8"
        >
          {status === 'success' ? (
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl px-6 py-6 flex items-center justify-center gap-3 text-emerald-300">
              <CheckCircle2 className="w-6 h-6" />
              <p className="text-sm font-bold">
                {t('Subscribed! Check your inbox for a welcome discount code.')}
              </p>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto"
            >
              <div className="relative flex-grow">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setStatus('idle');
                  }}
                  placeholder={t('Enter your email address')}
                  className={`w-full pl-11 pr-4 py-4 bg-white/5 border rounded-2xl text-sm text-white placeholder:text-slate-500 outline-none transition-colors ${
                    status === 'error'
                      ? 'border-red-500/60 focus:border-red-400'
                      : 'border-white/15 focus:border-yellow-400'
                  }`}
                />
              </div>
              <button
                type="submit"
                disabled={status === 'loading'}
                className="px-7 py-4 bg-yellow-400 hover:bg-yellow-500 disabled:opacity-60 text-navy-950 text-sm font-black rounded-2xl shadow-button-glow transition-all inline-flex items-center justify-center gap-2 transform hover:-translate-y-0.5 active:scale-[0.97]"
              >
                {status === 'loading' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                <span>{t('Subscribe')}</span>
              </button>
            </form>
          )}

          {status === 'error' && (
            <p className="text-center text-red-400 text-xs font-bold mt-3">
              {t('Please enter a valid email address and try again.')}
            </p>
          )}
        </motion.div>

        {/* Perks */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-12">
          {PERKS.map((perk) => {
            const Icon = perk.icon;
            return (
              <div
                key={perk.label}
                className="flex items-center gap-2.5 justify-center py-3 px-4 bg-white/5 rounded-xl border border-white/10"
              >
                <Icon className="w-4 h-4 text-yellow-400 shrink-0" />
                <span className="text-[11px] sm:text-xs text-slate-300 font-bold">{t(perk.label)}</span>
              </div>
            );
          })}
        </div>

        <p className="text-center text-[11px] text-slate-500 mt-6 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5" />
          {t('We respect your privacy. No spam, unsubscribe anytime.')}
        </p>
      </div>
    </section>
  );
};
