'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { useGetBooksQuery } from '@/redux/api/bookApi';
import { useTranslation } from '@/i18n/useTranslation';
import { isComboBook } from '@/lib/books';
import type { Book } from '@/types';

const BOOK_INTERVAL = 900;

const bookVariants = {
  enter: (dir: number) => ({
    opacity: 0,
    scale: 0.82,
    y: 64,
    rotateY: dir > 0 ? -55 : 55,
    filter: 'blur(8px)',
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
  }),
  center: {
    opacity: 1,
    scale: 1,
    y: 0,
    rotateY: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
  },
  exit: (dir: number) => ({
    opacity: 0,
    scale: 0.8,
    y: -76,
    rotateY: dir > 0 ? 45 : -45,
    filter: 'blur(8px)',
    transition: { duration: 0.45, ease: [0.55, 0, 0.55, 0.2] as const },
  }),
};

export const HeroSection: React.FC = () => {
  const { t } = useTranslation();
  const { data: books = [], isLoading, isError } = useGetBooksQuery();

  const heroRef = useRef<HTMLElement>(null);

  const [activeIdx, setActiveIdx] = useState(0);
  const [dir, setDir] = useState(1);
  const [paused, setPaused] = useState(false);
  const [inView, setInView] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [compact, setCompact] = useState(false);

  const visibleBooks = useMemo(
    () => books.filter((b) => b.inStock && !isComboBook(b)),
    [books],
  );

  useEffect(() => {
    const handleResize = () => setCompact(window.innerWidth < 1024);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    const heroEl = heroRef.current;
    if (!heroEl) return;
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      threshold: 0.05,
    });
    io.observe(heroEl);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const handleVisibility = () => setPaused(document.hidden);
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  useEffect(() => {
    setActiveIdx((i) => Math.min(i, Math.max(0, visibleBooks.length - 1)));
  }, [visibleBooks.length]);

  useEffect(() => {
    if (reduced || paused || !inView || visibleBooks.length <= 1) return;
    const id = window.setTimeout(() => {
      setDir(1);
      setActiveIdx((i) => (i + 1) % visibleBooks.length);
    }, BOOK_INTERVAL);
    return () => window.clearTimeout(id);
  }, [activeIdx, reduced, paused, inView, visibleBooks.length]);

  const go = (nextRaw: number, direction: number) => {
    if (visibleBooks.length === 0) return;
    setDir(direction);
    setActiveIdx(((nextRaw % visibleBooks.length) + visibleBooks.length) % visibleBooks.length);
  };

  const active: Book | undefined = visibleBooks[activeIdx];
  const total = visibleBooks.length;

  return (
    <section
      ref={heroRef}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      className="relative min-h-[100svh] overflow-hidden flex items-center justify-center pt-20 pb-10"
    >
      {/* sr-only headline for SEO / assistive tech */}
      <h1 className="sr-only">
        Learn with Expert Educators & Crack Your Dream Exam — Apni Padhai Publication
      </h1>

      {/* ---------------- BACKGROUND ---------------- */}
      <video
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        src="/images/hero-bg.mp4"
        autoPlay
        muted
        loop
        playsInline
      />
      <div className="absolute inset-0 bg-slate-950/70 pointer-events-none" />
      <div className="absolute inset-0 bg-grid-light pointer-events-none" />

      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(74vw,740px)] aspect-square rounded-full bg-[radial-gradient(circle,rgba(245,158,11,0.2),rgba(245,158,11,0.05)_52%,transparent_74%)] blur-2xl pointer-events-none" />

      {/* ---------------- STAGE ---------------- */}
      <div className="relative z-10 w-full max-w-[1300px] px-4 sm:px-8 mx-auto flex flex-col items-center">
        {isLoading ? (
          <div className="flex flex-col items-center gap-4 py-28">
            <Loader2 className="w-10 h-10 text-amber-400 animate-spin" />
            <p className="text-[11px] uppercase tracking-[0.25em] text-slate-400 font-bold">
              {t('Loading Publication Store')}…
            </p>
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center gap-5 py-28 text-center">
            <p className="text-sm text-slate-300 font-medium max-w-md">
              {t("We're having trouble loading the latest books. Browse the store directly.")}
            </p>
            <Link
              href="/books"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500/90 hover:bg-amber-400 text-navy-950 text-xs font-black rounded-xl transition-all"
            >
              {t('Browse All Books')} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : total === 0 ? (
          <div className="flex flex-col items-center gap-5 py-28 text-center">
            <p className="text-sm text-slate-300 font-medium">{t('No books available right now.')}</p>
            <Link
              href="/books"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500/90 hover:bg-amber-400 text-navy-950 text-xs font-black rounded-xl transition-all"
            >
              {t('Browse All Books')} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <>
            {/* Featured book stage */}
            <div
              className="w-full max-w-[900px] h-[min(46vh,440px)] sm:h-[min(52vh,500px)] flex items-center justify-center"
              style={{ perspective: 1300 }}
              role="region"
              aria-roledescription="carousel"
              aria-label={t('Apni Padhai books — featured one by one')}
            >
              <div className="relative w-full h-full">
                {/* Ground shadow */}
                <div className="absolute left-1/2 bottom-[6%] w-[46%] h-[8%] -translate-x-1/2 rounded-[50%] bg-[radial-gradient(ellipse,rgba(0,0,0,0.55),transparent_70%)] blur-md pointer-events-none" />

                <button
                  onClick={() => go(activeIdx - 1, -1)}
                  aria-label={t('Previous book')}
                  className="absolute left-0 top-1/2 -translate-y-1/2 z-40 p-3 rounded-full bg-white/10 backdrop-blur border border-white/15 text-white shadow-lg hover:bg-white/20 active:scale-95 transition-all"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => go(activeIdx + 1, 1)}
                  aria-label={t('Next book')}
                  className="absolute right-0 top-1/2 -translate-y-1/2 z-40 p-3 rounded-full bg-white/10 backdrop-blur border border-white/15 text-white shadow-lg hover:bg-white/20 active:scale-95 transition-all"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>

                {/* Featured book (one by one) */}
                <AnimatePresence initial={false} custom={dir}>
                  <motion.div
                    key={active.id}
                    custom={dir}
                    variants={bookVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-30 will-change-transform"
                  >
                    <Link href={`/books/${active.id}`} className="group block" aria-label={active.title}>
                      <div
                        className="relative rounded-xl overflow-hidden bg-slate-100 ring-1 ring-white/25 shadow-[0_30px_70px_-18px_rgba(0,0,0,0.75)]"
                        style={{
                          width: compact ? 'min(58vw,260px)' : 'clamp(240px, 26vw, 340px)',
                          aspectRatio: '3 / 4',
                        }}
                      >
                        {active.coverImage ? (
                          <Image
                            src={active.coverImage}
                            alt={active.title}
                            fill
                            sizes="400px"
                            className="object-contain p-2 group-hover:scale-[1.05] transition-transform duration-500"
                          />
                        ) : (
                          <span className="absolute inset-0 flex items-center justify-center text-sm text-slate-500 text-center px-4 font-bold leading-snug">
                            {active.title}
                          </span>
                        )}
                        <div className="absolute inset-0 ring-1 ring-inset ring-black/10 rounded-xl pointer-events-none" />
                      </div>

                      {/* Hover overlay */}
                      <span
                        className={`absolute inset-x-0 bottom-4 mx-auto w-max px-4 py-2 rounded-full bg-amber-500/95 text-[10px] font-black text-navy-950 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap inline-flex items-center gap-1.5`}
                      >
                        <ArrowRight className="w-3.5 h-3.5" /> {t('VIEW BOOK')}
                      </span>
                    </Link>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
};