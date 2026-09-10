'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Book } from 'lucide-react';
import { FaGooglePlay } from 'react-icons/fa';
import { useTranslation } from '@/i18n/useTranslation';

export const AppDownloadSection: React.FC = () => {
  const { t } = useTranslation();
  return (
    <section className="py-12 bg-hero-dark text-white relative overflow-hidden border-t border-white/5">
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
              {t('Access offline video downloads and 24/7 chat support right on your smartphone.')}
            </p>

            {/* Store Button */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 sm:gap-4 pt-4">
              <a
                href="https://play.google.com/store/search?q=apni+padhai&c=apps"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 sm:gap-3 px-3 sm:px-6 py-2.5 sm:py-3.5 bg-black hover:bg-navy-950 text-white rounded-xl border border-white/15 shadow-lg transition-all duration-300 hover:border-white/30 hover:-translate-y-0.5"
              >
                <FaGooglePlay className="w-5 h-5 sm:w-7 sm:h-7 text-emerald-400 shrink-0" />
                <div className="text-left leading-tight">
                  <span className="block text-[8px] sm:text-[9px] uppercase font-bold tracking-wide opacity-80">{t('Get it on')}</span>
                  <span className="text-sm sm:text-base font-black whitespace-nowrap">{t('Google Play')}</span>
                </div>
              </a>

              <a
                href="https://apnipadhai.org/"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 sm:gap-3 px-3 sm:px-6 py-2.5 sm:py-3.5 bg-black hover:bg-navy-950 text-white rounded-xl border border-white/15 shadow-lg transition-all duration-300 hover:border-white/30 hover:-translate-y-0.5"
              >
                <Book className="w-5 h-5 sm:w-7 sm:h-7 text-white shrink-0" />
                <div className="text-left leading-tight">
                  <span className="block text-[8px] sm:text-[9px] uppercase font-bold tracking-wide opacity-80">{t('Explore')}</span>
                  <span className="text-sm sm:text-base font-black whitespace-nowrap">{t('Courses')}</span>
                </div>
              </a>
            </div>
          </div>

          {/* Right Visual Image - Phone Mockup */}
          <div className="hidden lg:flex lg:col-span-5 relative justify-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="relative w-72 sm:w-80 rounded-[2.8rem] bg-navy-950 px-3 pt-12 pb-4 shadow-2xl border border-white/10"
            >
              {/* Speaker Grille */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 w-14 h-1.5 rounded-full bg-white/20 z-10" />
              {/* Notch / Punch Hole Camera */}
              <div className="absolute top-7 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-navy-900 border border-white/20 z-10" />
              {/* Screen */}
              <div className="relative overflow-hidden rounded-[2rem] bg-black aspect-[1080/2108]">
                <Image
                  src="/images/app_screens.png"
                  alt={t('Apni Padhai Mobile App Screens')}
                  fill
                  className="object-contain"
                />
              </div>
              {/* Home Indicator */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-24 h-1 rounded-full bg-white/30 z-10" />
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
};
