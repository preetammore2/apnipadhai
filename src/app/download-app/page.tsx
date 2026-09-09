'use client';

import React from 'react';
import Image from 'next/image';
import { Book } from 'lucide-react';
import { FaGooglePlay } from 'react-icons/fa';
import { useTranslation } from '@/i18n/useTranslation';

export default function DownloadAppPage() {
  const { t } = useTranslation();
  return (
    <div className="py-16 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Hero App Promo */}
        <div className="bg-gradient-to-br from-navy-900 via-brand-900 to-navy-900 text-white rounded-3xl p-8 sm:p-12 border border-white/10 shadow-2xl grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7 space-y-6">
            <span className="px-3.5 py-1 bg-amber-400/20 text-amber-300 text-xs font-bold rounded-full border border-amber-400/30">
              {t('OFFICIAL ANDROID APP')}
            </span>
            <h1 className="text-3xl sm:text-5xl font-black font-heading leading-tight">
              {t('Study Anywhere, Anytime With Apni Padhai App')}
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-lg">
              {t('Download lectures offline, attempt live all-India test series, read Brahmastra e-books, and clear doubts with expert teachers.')}
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <a
                href="https://play.google.com/store/search?q=apni+padhai&c=apps"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-3 px-6 py-3.5 bg-black hover:bg-black/90 text-white rounded-xl border border-white/20 shadow-lg transition-all duration-300 hover:border-white/40 hover:-translate-y-0.5"
              >
                <FaGooglePlay className="w-7 h-7 text-emerald-400" />
                <div className="text-left leading-tight">
                  <span className="block text-[9px] uppercase font-bold tracking-wide opacity-80">{t('Get it on')}</span>
                  <span className="text-base font-black">{t('Google Play')}</span>
                </div>
              </a>

              <a
                href="https://apnipadhai.org/"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-3 px-6 py-3.5 bg-black hover:bg-black/90 text-white rounded-xl border border-white/20 shadow-lg transition-all duration-300 hover:border-white/40 hover:-translate-y-0.5"
              >
                <Book className="w-7 h-7 text-white" />
                <div className="text-left leading-tight">
                  <span className="block text-[9px] uppercase font-bold tracking-wide opacity-80">{t('Explore')}</span>
                  <span className="text-base font-black">{t('Courses')}</span>
                </div>
              </a>
            </div>
          </div>

          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-72 h-[480px] rounded-3xl overflow-hidden shadow-2xl border-4 border-white/20">
              <Image
                src="/images/app_ui.png"
                alt={t('Apni Padhai App Mobile Screenshots')}
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
