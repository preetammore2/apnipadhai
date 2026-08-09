'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { PYQ } from '@/types';
import { PYQ_HI } from '@/i18n/data';
import { useTranslation } from '@/i18n/useTranslation';
import { Download, CheckCircle, ArrowRight, Loader2, RefreshCw, WifiOff } from 'lucide-react';
import { toast } from 'sonner';

export const PyqQuickSection: React.FC = () => {
  const { t, language } = useTranslation();
  const [pyqs, setPyqs] = useState<PYQ[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  const loadPyqs = async () => {
    setIsLoading(true);
    setIsError(false);
    try {
      const res = await fetch('/api/pyqs');
      if (!res.ok) throw new Error('Failed to load PYQs');
      const data = (await res.json()) as PYQ[];
      setPyqs(data);
    } catch (error) {
      console.error('[PyqQuickSection] load error', error);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPyqs();
  }, []);

  return (
    <section className="py-20 bg-slate-50 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <span className="text-xs font-bold text-brand-600 uppercase tracking-widest bg-brand-100/80 px-3.5 py-1.5 rounded-full">
              {t('FREE STUDY RESOURCES')}
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold font-heading text-navy-900 mt-3">
              {t('Previous Year Question Papers (PYQs)')}
            </h2>
            <p className="text-slate-600 text-sm sm:text-base mt-2">
              {t('Free solved question papers for RAS, SI, CET, SSC GD & LDC with detailed explanations.')}
            </p>
          </div>

          <Link
            href="/pyqs"
            className="inline-flex items-center gap-2 text-sm font-bold text-brand-600 hover:text-brand-700 transition-colors shrink-0"
          >
            <span>{t('Search All PYQs Hub')}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {isLoading && (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-500">
            <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
            <p className="text-sm font-semibold">{t('Loading previous year papers...')}</p>
          </div>
        )}

        {isError && (
          <div className="flex flex-col items-center justify-center py-16 gap-4 text-slate-500">
            <WifiOff className="w-8 h-8 text-red-400" />
            <p className="text-sm font-semibold text-center">
              {t('Something went wrong while fetching the question papers. Please try again.')}
            </p>
            <button
              onClick={loadPyqs}
              className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{t('Try Again')}</span>
            </button>
          </div>
        )}

        {!isLoading && !isError && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {pyqs.slice(0, 3).map((pyq) => (
              <div
                key={pyq.id}
                className="bg-white rounded-3xl p-6 border border-slate-200 shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="px-3 py-1 bg-brand-50 text-brand-700 text-xs font-bold rounded-full">
                      {t(pyq.category)} • {pyq.year}
                    </span>
                    {pyq.pdfSize && (
                      <span className="text-[11px] font-bold text-slate-400">{pyq.pdfSize}</span>
                    )}
                  </div>

                  <h3 className="text-base font-bold font-heading text-navy-900 group-hover:text-brand-600 transition-colors mb-2">
                    {language === 'hi' ? PYQ_HI[pyq.id]?.title ?? pyq.title : pyq.title}
                  </h3>
                  <p className="text-xs text-slate-500 mb-4">{language === 'hi' ? PYQ_HI[pyq.id]?.subject ?? pyq.subject : pyq.subject}</p>

                  {pyq.hasSolution && (
                    <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 mb-4">
                      <CheckCircle className="w-4 h-4" />
                      <span>{t('Includes Detailed Solution Key')}</span>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  {pyq.questionsCount ? (
                    <span className="text-xs font-bold text-slate-500">{pyq.questionsCount} {t('Questions')}</span>
                  ) : (
                    <span />
                  )}

                  <a
                    href={pyq.downloadUrl}
                    download
                    onClick={() => toast.success(`${t('Downloading official solved PDF for')} ${language === 'hi' ? PYQ_HI[pyq.id]?.title ?? pyq.title : pyq.title}`)}
                    className="px-4 py-2 bg-navy-900 hover:bg-brand-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{t('Download PDF')}</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
