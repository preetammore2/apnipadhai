'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Smartphone, CheckCircle, QrCode } from 'lucide-react';
import { useTranslation } from '@/i18n/useTranslation';

export const AppDownloadSection: React.FC = () => {
  const { t } = useTranslation();
  return (
    <section className="py-24 bg-hero-dark text-white relative overflow-hidden border-t border-white/5">
      {/* Subtle Light Grid Overlay */}
      <div className="absolute inset-0 bg-grid-light pointer-events-none" />

      {/* Soft Gold Glow Accent */}
      <div className="absolute -top-40 right-0 w-[500px] h-[400px] bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-14 items-center">

          {/* Left Text & Badges */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <span className="inline-flex items-center gap-2 text-xs font-bold text-brand-300 uppercase tracking-widest bg-white/[0.04] px-3.5 py-1.5 rounded-full border border-brand-400/20">
              {t('LEARN ON THE GO')}
            </span>

            <h2 className="text-3xl sm:text-5xl font-black font-heading leading-tight text-white">
              {t('Download The Apni Padhai Mobile App')}
            </h2>

            <p className="text-slate-300 text-sm sm:text-base font-medium leading-relaxed max-w-xl mx-auto lg:mx-0">
              {t('Access offline video downloads, daily live test series, e-books PDF reader, and instant doubt chat support right on your smartphone.')}
            </p>

            {/* Features Checklist */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm font-medium text-slate-300 max-w-lg mx-auto lg:mx-0 pt-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>{t('Offline Video Download Mode')}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>{t('Live Test Series with Rank')}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>{t('Free Daily Current Affairs PDF')}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>{t('24/7 Teacher Doubt Chat')}</span>
              </div>
            </div>

            {/* Store Button & QR */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-4">
              <a
                href="https://play.google.com/store/search?q=apni+padhai&c=apps"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-3 px-7 py-4 bg-gradient-to-b from-brand-400 to-brand-600 text-navy-950 rounded-2xl text-xs font-black shadow-[0_8px_30px_-6px_rgba(234,179,8,0.55)] transition-all duration-300 hover:shadow-[0_14px_40px_-6px_rgba(234,179,8,0.7)] hover:-translate-y-0.5"
              >
                <Smartphone className="w-6 h-6" />
                <div className="text-left">
                  <span className="block text-[10px] uppercase font-bold opacity-70">{t('Install Now From')}</span>
                  <span className="text-sm font-black">{t('Google Play Store')}</span>
                </div>
              </a>

              <div className="flex items-center gap-3 p-3 bg-white/[0.06] rounded-2xl backdrop-blur-md border border-white/15">
                <div className="p-2 bg-brand-400 text-navy-950 rounded-xl">
                  <QrCode className="w-6 h-6" />
                </div>
                <div className="text-left text-xs">
                  <p className="font-extrabold text-white">{t('Scan QR Code')}</p>
                  <p className="text-[10px] font-semibold text-slate-400">{t('To Install Directly')}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Visual Image */}
          <div className="lg:col-span-5 relative flex justify-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="relative w-72 sm:w-80 h-[500px] rounded-3xl overflow-hidden shadow-2xl border border-brand-400/30 bg-white/[0.03]"
            >
              <Image
                src="/images/Frame 1165043252 (1).png"
                alt={t('Apni Padhai Mobile App Screens')}
                fill
                className="object-cover"
              />
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
};
