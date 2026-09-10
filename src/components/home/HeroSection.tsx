'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from '@/i18n/useTranslation';
import { DEFAULT_HERO_RATIO, DEFAULT_HERO_SLIDES, type HeroSlide } from '@/lib/hero-slides';

const SLIDE_INTERVAL = 6000;
const SWIPE_THRESHOLD = 56;

const slideVariants = {
  enter: (dir: number) => ({
    opacity: 0,
    scale: 1.08,
    x: dir > 0 ? 48 : -48,
    filter: 'blur(6px)',
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
  }),
  center: {
    opacity: 1,
    scale: 1,
    x: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
  },
  exit: (dir: number) => ({
    opacity: 0,
    scale: 1.04,
    x: dir > 0 ? -48 : 48,
    filter: 'blur(6px)',
    transition: { duration: 0.5, ease: [0.55, 0, 0.55, 0.2] as const },
  }),
};

export const HeroSection: React.FC = () => {
  const { t } = useTranslation();

  const heroRef = useRef<HTMLElement>(null);
  const swipeStartX = useRef<number | null>(null);

  const [activeIdx, setActiveIdx] = useState(0);
  const [dir, setDir] = useState(1);
  const [paused, setPaused] = useState(false);
  const [inView, setInView] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [slides, setSlides] = useState<HeroSlide[]>(DEFAULT_HERO_SLIDES);

  const total = slides.length;

  useEffect(() => {
    let ignore = false;
    fetch('/api/hero-slides')
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { slides?: HeroSlide[] } | null) => {
        if (ignore || !data || !Array.isArray(data.slides) || data.slides.length === 0) return;
        setSlides(data.slides);
      })
      .catch(() => {});
    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    if (activeIdx > slides.length - 1) {
      setActiveIdx(0);
    }
  }, [slides.length, activeIdx]);

  const go = useCallback((nextRaw: number, direction: number) => {
    setDir(direction);
    setActiveIdx(((nextRaw % total) + total) % total);
  }, [total]);

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
    if (reduced || paused || !inView || total <= 1) return;
    const id = window.setTimeout(() => {
      setDir(1);
      setActiveIdx((i) => (i + 1) % total);
    }, SLIDE_INTERVAL);
    return () => window.clearTimeout(id);
  }, [activeIdx, reduced, paused, inView, total]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!inView) return;
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        go(activeIdx - 1, -1);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        go(activeIdx + 1, 1);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [activeIdx, inView, go]);

  const handlePointerDown = (e: React.PointerEvent) => {
    swipeStartX.current = e.clientX;
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (swipeStartX.current === null) return;
    const dx = e.clientX - swipeStartX.current;
    if (Math.abs(dx) > SWIPE_THRESHOLD) {
      go(dx < 0 ? activeIdx + 1 : activeIdx - 1, dx < 0 ? 1 : -1);
    }
    swipeStartX.current = null;
  };

  const slide = slides[activeIdx];

  return (
    <section
      ref={heroRef}
      className="relative sm:min-h-[100svh] overflow-hidden flex items-center justify-center"
    >
      {/* sr-only headline for SEO / assistive tech */}
      <h1 className="sr-only">
        Learn with Expert Educators & Crack Your Dream Exam — Apni Padhai Publication
      </h1>

      {/* ---------------- SLIDES (Ken Burns) ---------------- */}
      <div
        className="relative w-full sm:absolute sm:inset-0 sm:max-w-[1600px] sm:mx-auto"
        style={{ aspectRatio: `${slide.ratio ?? DEFAULT_HERO_RATIO}` }}
      >
        <AnimatePresence initial={false} custom={dir}>
          <motion.div
            key={slide.src}
            custom={dir}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="absolute inset-0 will-change-transform"
            role="region"
            aria-roledescription="carousel"
            aria-label={t('Apni Padhai promo banners')}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={slide.src}
              alt={slide.alt}
              className="w-full h-full object-cover bg-slate-950"
              draggable={false}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Subtle overlays for contrast on edges */}
      <div className="absolute inset-0 bg-slate-950/10 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-slate-950/10 pointer-events-none" />

      {/* ---------------- CONTROLS ---------------- */}
      <div
        className="absolute inset-0 z-20"
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      />

      {/* Arrows */}
      <button
        onClick={() => go(activeIdx - 1, -1)}
        aria-label={t('Previous slide')}
        disabled={total <= 1}
        className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-white/10 backdrop-blur border border-white/15 text-white shadow-lg hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 transition-all"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        onClick={() => go(activeIdx + 1, 1)}
        aria-label={t('Next slide')}
        disabled={total <= 1}
        className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-white/10 backdrop-blur border border-white/15 text-white shadow-lg hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 transition-all"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Dots */}
      <motion.div
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 w-[min(92vw,560px)]"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
      >
        <div className="flex items-center justify-center gap-2">
          {slides.map((s, i) => (
            <button
              key={s.src}
              onClick={() => go(i, i > activeIdx ? 1 : -1)}
              aria-label={`${t('Go to slide')} ${i + 1}`}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === activeIdx ? 'w-6 bg-amber-400' : 'w-2 bg-white/30 hover:bg-white/60'
              }`}
            />
          ))}
        </div>
      </motion.div>
    </section>
  );
};