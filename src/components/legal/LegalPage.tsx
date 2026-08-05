'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, ArrowLeft, FileText, ScrollText, RotateCcw } from 'lucide-react';
import { useTranslation } from '@/i18n/useTranslation';

interface LegalSection {
  title: string;
  titleHi?: string;
  content: React.ReactNode;
  contentHi?: React.ReactNode;
}

interface LegalPageProps {
  badge: string;
  badgeHi?: string;
  title: string;
  titleHi?: string;
  description: string;
  descriptionHi?: string;
  lastUpdated: string;
  sections: LegalSection[];
}

export const LegalPage: React.FC<LegalPageProps> = ({
  badge,
  badgeHi,
  title,
  titleHi,
  description,
  descriptionHi,
  lastUpdated,
  sections,
}) => {
  const { t, isHindi } = useTranslation();

  const pick = (en: string, hi?: string) => (isHindi && hi ? hi : en);

  return (
    <div className="py-12 bg-slate-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-brand-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('Back to Home')}</span>
        </Link>

        <div className="bg-white p-8 sm:p-12 rounded-3xl border border-slate-200 shadow-card space-y-8">
          <div className="text-center space-y-3">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-brand-50 text-brand-700 text-xs font-bold uppercase tracking-widest rounded-full border border-brand-100">
              <ShieldCheck className="w-3.5 h-3.5" />
              {pick(badge, badgeHi)}
            </span>
            <h1 className="text-3xl sm:text-4xl font-black font-heading text-navy-900">{pick(title, titleHi)}</h1>
            <p className="text-slate-600 text-sm sm:text-base max-w-2xl mx-auto">{pick(description, descriptionHi)}</p>
            <p className="text-xs font-bold text-slate-400">
              {t('Last Updated')}: {lastUpdated}
            </p>
          </div>

          <div className="space-y-6">
            {sections.map((section, idx) => (
              <div key={idx} className="space-y-3">
                <h2 className="text-lg sm:text-xl font-bold font-heading text-navy-900 flex items-center gap-2.5">
                  <span className="w-8 h-8 bg-brand-50 text-brand-600 rounded-xl flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4" />
                  </span>
                  {pick(section.title, section.titleHi)}
                </h2>
                <div className="text-sm text-slate-600 leading-relaxed pl-1">
                  {isHindi && section.contentHi ? section.contentHi : section.content}
                </div>
              </div>
            ))}
          </div>

          <div className="pt-6 border-t border-slate-100 text-xs text-slate-500 space-y-2">
            <p className="font-bold text-navy-900">{t('Need help?')}</p>
            <p>
              {t('Reach our support team at')}{' '}
              <a href="mailto:support@apnipadhaipublication.com" className="text-brand-600 font-bold hover:underline">
                support@apnipadhaipublication.com
              </a>{' '}
              {t('or call us on')}{' '}
              <a href="tel:+917568716768" className="text-brand-600 font-bold hover:underline">
                +91 7568716768
              </a>
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                href="/terms-conditions"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-navy-900 rounded-xl font-bold transition-colors"
              >
                <ScrollText className="w-3.5 h-3.5" /> {t('Terms & Conditions')}
              </Link>
              <Link
                href="/refund-policy"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-navy-900 rounded-xl font-bold transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" /> {t('Refund Policy')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
