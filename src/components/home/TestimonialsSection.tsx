'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { TESTIMONIALS_DATA } from '@/data/testimonials';
import { TESTIMONIAL_HI } from '@/i18n/data';
import { useTranslation } from '@/i18n/useTranslation';
import { useSiteContent } from '@/lib/use-site-content';
import { Star, Quote, Heart, ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';

export const TestimonialsSection: React.FC = () => {
  const { t, language } = useTranslation();
  const content = useSiteContent();
  const items = content?.testimonials?.length ? content.testimonials : TESTIMONIALS_DATA;
  const scrollRef = useRef<HTMLDivElement>(null);
  const autoScrollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const resumeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const SCROLL_AMOUNT = 380;

  const updateScrollButtons = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 2);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 2);
  }, []);

  function stopAutoScroll() {
    if (autoScrollRef.current) {
      clearInterval(autoScrollRef.current);
      autoScrollRef.current = null;
    }
    if (resumeTimerRef.current) {
      clearTimeout(resumeTimerRef.current);
      resumeTimerRef.current = null;
    }
  }

  const startAutoScroll = useCallback(() => {
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

  const pauseAndResume = useCallback(() => {
    if (autoScrollRef.current) {
      clearInterval(autoScrollRef.current);
      autoScrollRef.current = null;
    }
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    resumeTimerRef.current = setTimeout(() => startAutoScroll(), 5000);
  }, [startAutoScroll]);

  const scroll = useCallback((direction: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: direction === 'left' ? -SCROLL_AMOUNT : SCROLL_AMOUNT, behavior: 'smooth' });
    pauseAndResume();
  }, [pauseAndResume]);

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
  }, [items, updateScrollButtons]);

  useEffect(() => {
    startAutoScroll();
    return () => stopAutoScroll();
  }, [startAutoScroll]);

  return (
    <section className="py-12 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <div className="text-center max-w-2xl mx-auto">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 uppercase tracking-widest bg-brand-50 px-3.5 py-1.5 rounded-full">
            {t('STUDENTS')} <Heart className="w-3.5 h-3.5 fill-brand-500 text-brand-500" /> APNI PADHAI
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold font-heading text-navy-900 mt-3">
            {t('Join The Apni Padhai Family Today!')}
          </h2>
          <p className="text-slate-600 text-sm sm:text-base mt-2">
            {t('Real success stories from students who cleared government exams with Apni Padhai.')}
          </p>
        </div>
      </div>

      {/* Scrollable Testimonials with Left/Right Controls */}
      <div className="relative group/scroll">
        {/* Left Arrow */}
        {canScrollLeft && (
          <button
            onClick={() => { scroll('left'); }}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white/90 hover:bg-white border border-slate-200 shadow-lg rounded-full flex items-center justify-center transition-all hover:scale-110"
          >
            <ChevronLeft className="w-5 h-5 text-navy-900" />
          </button>
        )}
        {/* Right Arrow */}
        {canScrollRight && (
          <button
            onClick={() => { scroll('right'); }}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white/90 hover:bg-white border border-slate-200 shadow-lg rounded-full flex items-center justify-center transition-all hover:scale-110"
          >
            <ChevronRight className="w-5 h-5 text-navy-900" />
          </button>
        )}
        {/* Fade edges */}
        {canScrollLeft && <div className="absolute left-0 top-0 bottom-0 w-14 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />}
        {canScrollRight && <div className="absolute right-0 top-0 bottom-0 w-14 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />}

        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto scroll-smooth px-4 sm:px-6 lg:px-8"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {items.map((item) => (
            <div
              key={item.id}
              className="w-80 sm:w-96 shrink-0 bg-slate-50 border border-slate-200/80 p-6 rounded-3xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(item.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                  <Quote className="w-6 h-6 text-brand-200" />
                </div>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed italic mb-6">
                  &ldquo;{language === 'hi' ? TESTIMONIAL_HI[item.id]?.quote ?? item.quote : item.quote}&rdquo;
                </p>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-slate-200/60">
                {item.photo ? (
                  <div className="relative w-11 h-11 rounded-full overflow-hidden shrink-0 border border-brand-200">
                    <Image src={item.photo} alt={item.name} fill className="object-cover" />
                  </div>
                ) : (
                  <div className="w-11 h-11 rounded-full shrink-0 border border-brand-200 bg-brand-100 text-brand-700 font-bold flex items-center justify-center">
                    {item.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <h4 className="text-sm font-bold text-navy-900">{item.name}</h4>
                  <p className="text-[11px] font-semibold text-brand-600">
                    {language === 'hi' ? TESTIMONIAL_HI[item.id]?.exam ?? item.exam : item.exam} {item.rank ? `(${item.rank})` : ''} {item.city ? `• ${item.city}` : ''}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
