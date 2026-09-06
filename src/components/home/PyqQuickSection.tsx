'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { PYQ } from '@/types';
import { PYQ_HI } from '@/i18n/data';
import { useTranslation } from '@/i18n/useTranslation';
import { Download, CheckCircle, ArrowRight, Loader2, RefreshCw, WifiOff, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

export const PyqQuickSection: React.FC = () => {
  const { t, language } = useTranslation();
  const [pyqs, setPyqs] = useState<PYQ[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const autoScrollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isDesktopRef = useRef(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const SCROLL_AMOUNT = 420;

  const updateScrollButtons = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 2);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 2);
  }, []);

  const scroll = useCallback((direction: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: direction === 'left' ? -SCROLL_AMOUNT : SCROLL_AMOUNT, behavior: 'smooth' });
  }, []);

  const startAutoScroll = useCallback(() => {
    if (!isDesktopRef.current) return;
    stopAutoScroll();
    autoScrollRef.current = setInterval(() => {
      const el = scrollRef.current;
      if (!el) return;
      if (el.scrollLeft >= el.scrollWidth - el.clientWidth - 2) {
        el.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        el.scrollBy({ left: 200, behavior: 'smooth' });
      }
    }, 2500);
  }, []);

  function stopAutoScroll() {
    if (autoScrollRef.current) {
      clearInterval(autoScrollRef.current);
      autoScrollRef.current = null;
    }
  }

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    const apply = (matches: boolean) => {
      isDesktopRef.current = matches;
      if (matches) startAutoScroll();
      else stopAutoScroll();
    };
    apply(mq.matches);
    const onChange = (e: MediaQueryListEvent) => apply(e.matches);
    mq.addEventListener('change', onChange);
    return () => {
      mq.removeEventListener('change', onChange);
      stopAutoScroll();
    };
  }, [startAutoScroll]);

  const loadPyqs = async () => {
    setIsLoading(true);
    setIsError(false);
    try {
      const res = await fetch('/api/pyqs');
      if (!res.ok) throw new Error('Failed to load PYQs');
      const data = (await res.json()) as PYQ[];
      setPyqs(data);
    } catch {
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPyqs();
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateScrollButtons();
    el.addEventListener('scroll', updateScrollButtons, { passive: true });
    window.addEventListener('resize', updateScrollButtons);
    return () => {
      el.removeEventListener('scroll', updateScrollButtons);
      window.removeEventListener('resize', updateScrollButtons);
    };
  }, [pyqs, updateScrollButtons]);

  return (
    <section className="py-12 bg-slate-50 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6">
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

        {isLoading ? (
          <div className="flex gap-6 px-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="w-[76vw] max-w-[300px] shrink-0 snap-start sm:w-[340px] sm:max-w-none bg-white rounded-3xl border-2 border-slate-100 overflow-hidden animate-pulse">
                <div className="px-6 py-4 space-y-3">
                  <div className="h-5 bg-slate-200 rounded-full w-1/2" />
                  <div className="h-5 bg-slate-200 rounded w-3/4" />
                  <div className="h-3 bg-slate-100 rounded w-2/3" />
                  <div className="h-10 bg-slate-100 rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-8 gap-4 text-slate-500">
            <WifiOff className="w-8 h-8 text-red-400" />
            <p className="text-sm font-semibold text-center">
              {t('Something went wrong while fetching the question papers. Please try again.')}
            </p>
            <button
              onClick={() => {
                loadPyqs();
                startAutoScroll();
              }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{t('Try Again')}</span>
            </button>
          </div>
        ) : (
          <div className="relative group/scroll">
            {/* Left Arrow */}
            {canScrollLeft && (
              <button
                onClick={() => { scroll('left'); stopAutoScroll(); }}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-10 sm:h-10 bg-white/90 hover:bg-white border border-slate-200 shadow-lg rounded-full flex items-center justify-center transition-all hover:scale-110 opacity-100 sm:opacity-0 sm:group-hover/scroll:opacity-100"
                aria-label={t('Scroll left')}
              >
                <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-navy-900" />
              </button>
            )}
            {/* Right Arrow */}
            {canScrollRight && (
              <button
                onClick={() => { scroll('right'); stopAutoScroll(); }}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-10 sm:h-10 bg-white/90 hover:bg-white border border-slate-200 shadow-lg rounded-full flex items-center justify-center transition-all hover:scale-110 opacity-100 sm:opacity-0 sm:group-hover/scroll:opacity-100"
                aria-label={t('Scroll right')}
              >
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-navy-900" />
              </button>
            )}
            {/* Fade edges */}
            {canScrollLeft && <div className="absolute left-0 top-0 bottom-0 w-8 sm:w-12 bg-gradient-to-r from-slate-50 to-transparent z-10 pointer-events-none" />}
            {canScrollRight && <div className="absolute right-0 top-0 bottom-0 w-8 sm:w-12 bg-gradient-to-l from-slate-50 to-transparent z-10 pointer-events-none" />}

            <div className="overflow-hidden -mx-4 sm:-mx-6 lg:-mx-8">
              <div
                ref={scrollRef}
                className="flex gap-4 sm:gap-6 px-3 overflow-x-auto scroll-smooth snap-x snap-mandatory sm:snap-none scrollbar-hide"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {pyqs.map((pyq) => (
                  <div
                    key={pyq.id}
                    className="w-[76vw] max-w-[300px] shrink-0 snap-start sm:w-[340px] sm:max-w-none bg-white rounded-3xl p-6 border border-slate-200 shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between group"
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
            </div>
          </div>
        )}
      </div>
    </section>
  );
};