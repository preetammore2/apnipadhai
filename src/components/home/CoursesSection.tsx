'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { BookOpen, PlayCircle, ArrowRight, ExternalLink, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from '@/i18n/useTranslation';

interface Course {
  id: string;
  title: string;
  tagline: string;
  description: string;
  image: string;
  url: string;
  type: string;
  features: string[];
  tag: string;
}

export const CoursesSection: React.FC = () => {
  const { t } = useTranslation();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const autoScrollRef = useRef<ReturnType<typeof setInterval> | null>(null);
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
    let cancelled = false;
    async function load() {
      try {
        let allCourses: Course[] = [];
        const seenIds = new Set<string>();
        let page = 1;
        let totalPages = 1;
        while (page <= totalPages && !cancelled) {
          const res = await fetch(`/api/courses?per_page=50&page=${page}`);
          const data = await res.json();
          if (data.courses?.length > 0) {
            allCourses = allCourses.concat(
              data.courses.map((c: Record<string, unknown>) => ({
                id: c.id as string,
                title: (c.title as string) ?? '',
                tagline: (c.tagline as string) ?? '',
                description: (c.description as string) ?? '',
                image: (c.image as string) ?? '',
                url: (c.url as string) ?? '',
                type: (c.type as string) || 'Online Batch',
                features: Array.isArray(c.features) ? (c.features as string[]) : [],
                tag: (c.tag as string) ?? '',
              }))
            );
          }
          const dataWithTotal: { totalPages?: number; courses?: unknown[] } = data;
          allCourses = allCourses.filter((course) => {
            if (seenIds.has(course.id)) return false;
            seenIds.add(course.id);
            return true;
          });
          totalPages = dataWithTotal.totalPages ?? 1;
          page++;
        }
        if (!cancelled && allCourses.length > 0) {
          setCourses(allCourses);
        }
      } catch {
        // keep fallback
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
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
  }, [courses, updateScrollButtons]);

  useEffect(() => {
    startAutoScroll();
    return () => stopAutoScroll();
  }, [startAutoScroll]);

  return (
    <section id="courses" className="py-12 bg-gradient-to-b from-white via-amber-50/40 to-white relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-yellow-200/20 rounded-full blur-3xl pointer-events-none" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-8">
          <span className="text-xs font-black text-amber-800 uppercase tracking-widest bg-yellow-100 px-3.5 py-1.5 rounded-full border border-yellow-300">
            {t('ONLINE CLASSES & TEST SERIES')}
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold font-heading text-navy-900 mt-3">
            {t('Apni Padhai Courses / Test Series & More')}
          </h2>
          <p className="text-slate-600 text-sm sm:text-base mt-2">
            {t('Premium online batches and mock test series crafted by Rohit Sir and the Apni Padhai faculty for every Rajasthan & all-India government exam.')}
          </p>
        </div>

        {/* Online Courses — Scrollable with Left/Right Controls */}
        <div className="relative group/scroll">
          {/* Left Arrow */}
          {canScrollLeft && (
            <button
              onClick={() => { scroll('left'); stopAutoScroll(); }}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white/90 hover:bg-white border border-slate-200 shadow-lg rounded-full flex items-center justify-center transition-all hover:scale-110 opacity-0 group-hover/scroll:opacity-100"
            >
              <ChevronLeft className="w-5 h-5 text-navy-900" />
            </button>
          )}
          {/* Right Arrow */}
          {canScrollRight && (
            <button
              onClick={() => { scroll('right'); stopAutoScroll(); }}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white/90 hover:bg-white border border-slate-200 shadow-lg rounded-full flex items-center justify-center transition-all hover:scale-110 opacity-0 group-hover/scroll:opacity-100"
            >
              <ChevronRight className="w-5 h-5 text-navy-900" />
            </button>
          )}
          {/* Fade edges */}
          {canScrollLeft && <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />}
          {canScrollRight && <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />}

          <div className="overflow-hidden -mx-4 sm:-mx-6 lg:-mx-8">
          {loading ? (
            <div className="flex gap-6 px-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="w-[340px] sm:w-[400px] shrink-0 bg-white rounded-3xl border-2 border-slate-100 overflow-hidden animate-pulse">
                  <div className="h-52 sm:h-56 bg-slate-200" />
                  <div className="p-6 space-y-3">
                    <div className="h-5 bg-slate-200 rounded w-3/4" />
                    <div className="h-3 bg-slate-100 rounded w-1/2" />
                    <div className="h-10 bg-slate-100 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div
              ref={scrollRef}
              className="flex gap-6 px-3 overflow-x-auto scroll-smooth scrollbar-hide"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {courses.map((course, idx) => (
              <div
                key={`${course.id}-${idx}`}
                className="w-[340px] sm:w-[400px] shrink-0 bg-white rounded-3xl border-2 border-slate-100 hover:border-amber-300 shadow-card hover:shadow-card-hover transition-all overflow-hidden flex flex-col group"
              >
                <div className="relative h-52 sm:h-56 bg-slate-100 overflow-hidden">
                  {course.image ? (
                    <Image
                      src={course.image}
                      alt={course.title}
                      fill
                      className="object-contain p-4 group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BookOpen className="w-16 h-16 text-amber-300" />
                    </div>
                  )}
                  {course.tag && (
                    <span className="absolute top-3 left-3 z-10 px-2.5 py-1 bg-yellow-400 text-navy-950 text-[10px] font-black rounded-full shadow-sm">
                      {t(course.tag)}
                    </span>
                  )}
                  <span className="absolute top-3 right-3 z-10 px-2.5 py-1 bg-navy-900/90 text-white text-[10px] font-bold rounded-full flex items-center gap-1">
                    <PlayCircle className="w-3 h-3 text-yellow-400" /> {t(course.type)}
                  </span>
                </div>

                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="text-lg font-extrabold font-heading text-navy-900 leading-snug">
                    {t(course.title)}
                  </h3>
                  {course.tagline && (
                    <p className="text-xs font-bold text-brand-600 mt-1">{t(course.tagline)}</p>
                  )}

                  <div className="flex flex-wrap gap-2 mt-4">
                    {course.features.map((feature) => (
                      <span
                        key={feature}
                        className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-full text-[10px] font-bold text-slate-600"
                      >
                        {t(feature)}
                      </span>
                    ))}
                  </div>

                  <div className="pt-5 mt-5 border-t border-slate-100 flex items-center justify-end gap-3">
                    <a
                      href={course.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-yellow-400 hover:bg-yellow-500 text-navy-950 text-xs font-black rounded-xl shadow-sm transition-all hover:-translate-y-0.5 active:scale-[0.97]"
                    >
                      {t('Enroll Now')}
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
            </div>
          )}
        </div>
        </div>

        {/* CTA */}
        <div className="mt-10 text-center">
          <Link
            href="/pyqs"
            className="group inline-flex items-center gap-2 px-8 py-3.5 bg-navy-900 hover:bg-brand-600 text-white text-sm font-black rounded-xl shadow-sm transition-all hover:-translate-y-0.5 active:scale-[0.97]"
          >
            <BookOpen className="w-4 h-4 text-yellow-400" />
            <span>{t('Explore PYQs & Mock Papers')}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
};
