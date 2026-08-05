'use client';

import React from 'react';
import Link from 'next/link';
import { FileQuestion, Home } from 'lucide-react';
import { useTranslation } from '@/i18n/useTranslation';

export default function NotFound() {
  const { t } = useTranslation();
  return (
    <div className="min-h-[80vh] bg-slate-50 flex items-center justify-center p-6 text-center">
      <div className="bg-white p-10 sm:p-12 rounded-3xl border border-slate-200 shadow-card max-w-md w-full space-y-6">
        <div className="w-20 h-20 bg-brand-50 text-brand-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
          <FileQuestion className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold text-brand-600 uppercase tracking-widest bg-brand-100/80 px-3 py-1 rounded-full">
            {t('ERROR 404')}
          </span>
          <h1 className="text-3xl font-black font-heading text-navy-900">{t('Page Not Found')}</h1>
          <p className="text-xs sm:text-sm text-slate-500">
            {t("The page or paper you are looking for might have been moved or doesn't exist.")}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Link
            href="/"
            className="flex-1 py-3 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-bold shadow-button-glow transition-all flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            <span>{t('Go to Home')}</span>
          </Link>
          <Link
            href="/courses"
            className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-navy-900 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2"
          >
            <span>{t('Browse Courses')}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
