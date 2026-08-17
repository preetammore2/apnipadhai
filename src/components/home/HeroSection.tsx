'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Download,
  BookOpen,
  CheckCircle2,
  ArrowRight,
  Phone,
} from 'lucide-react';
import { useTranslation } from '@/i18n/useTranslation';
import { useAppDispatch } from '@/redux/hooks';
import { setCounselorModalOpen } from '@/redux/features/ui/uiSlice';
import { useSiteContent } from '@/lib/use-site-content';

interface HeroSectionProps {
  onOpenCounselorModal?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onOpenCounselorModal }) => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const { hero } = useSiteContent() ?? {};

  const handleCounselorModal = () => {
    dispatch(setCounselorModalOpen(true));
    if (onOpenCounselorModal) onOpenCounselorModal();
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring' as const, stiffness: 260, damping: 22 },
    },
  };

  return (
    <section className="relative min-h-[85vh] bg-hero-dark overflow-hidden flex items-center pt-8 sm:pt-12 pb-16 sm:pb-24">
      {/* Background Video */}
      <video
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        src="/images/hero-bg.mp4"
        autoPlay
        muted
        loop
        playsInline
      />

      {/* Dark Overlay for readability */}
      <div className="absolute inset-0 bg-slate-950/70 pointer-events-none" />

      {/* Subtle Light Grid Overlay */}
      <div className="absolute inset-0 bg-grid-light pointer-events-none" />

      {/* Soft Gold Glow Accents */}
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[640px] h-[400px] bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[420px] h-[420px] bg-amber-500/[0.06] rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full text-center">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6 sm:space-y-8"
        >
          {/* Top Pill Badge */}
          {/* <motion.div variants={itemVariants} className="inline-block">
            <div className="inline-flex items-center gap-2.5 px-4 sm:px-5 py-1.5 sm:py-2 bg-white/[0.04] backdrop-blur-md border border-brand-400/30 rounded-full text-[11px] sm:text-xs font-semibold uppercase tracking-[0.18em] text-brand-300 mx-auto max-w-full">
              <span className="flex h-1.5 w-1.5 relative shrink-0">
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-brand-400" />
              </span>
              <Sparkles className="w-3.5 h-3.5 text-brand-400 shrink-0" />
            </div>
          </motion.div> */}

          {/* Main Headline */}
          <motion.h1
            variants={itemVariants}
            className="text-3xl sm:text-5xl lg:text-6xl font-black font-heading text-white leading-[1.15] tracking-tight max-w-4xl mx-auto px-2"
          >
            {hero ? (
              (() => {
                const highlight = (hero.highlight ?? '').trim();
                if (!highlight) return hero.title;
                const idx = hero.title
                  .toLowerCase()
                  .indexOf(highlight.toLowerCase());
                if (idx === -1) return hero.title;
                const before = hero.title.slice(0, idx).replace(/\s+$/, '');
                const after = hero.title.slice(idx + highlight.length).replace(/^\s+/, '');
                return (
                  <>
                    {before && <>{before} </>}
                    <span className="text-gradient-gold">
                      {hero.title.slice(idx, idx + highlight.length)}
                    </span>
                    {after && <> {after}</>}
                  </>
                );
              })()
            ) : (
              <>
                {t('Learn with Expert Educators & Crack Your')}{' '}
                <span className="text-gradient-gold">{t('Dream Exam')}</span>
              </>
            )}
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={itemVariants}
            className="text-sm sm:text-lg text-slate-300 leading-relaxed max-w-3xl mx-auto font-medium px-2"
          >
            {hero?.subtitle ? (
              hero.subtitle
            ) : (
              <>
                {t('Comprehensive online live coaching for Rajasthan CET 2026, Sub Inspector (SI), RAS, SSC GD & State Exams. Access bestselling')}{' '}
                <strong className="text-white font-bold">{t('Brahmastra Study Books')}</strong>
                {t(', solved PYQs, and daily test series.')}
              </>
            )}
          </motion.p>

          {/* CTAs */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 pt-2 max-w-md sm:max-w-none mx-auto"
          >
            <Link
              href="/books"
              className="group inline-flex items-center justify-center gap-2.5 px-7 sm:px-8 py-3.5 sm:py-4 bg-gradient-to-b from-brand-400 to-brand-600 text-navy-950 font-bold text-sm sm:text-base rounded-xl shadow-[0_8px_30px_-6px_rgba(234,179,8,0.55)] transition-all duration-300 hover:shadow-[0_14px_40px_-6px_rgba(234,179,8,0.7)] hover:-translate-y-0.5 active:scale-[0.97]"
            >
              <BookOpen className="w-5 h-5" />
              <span>{t('Explore Brahmastra Books')}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <a
              href="https://play.google.com/store/search?q=apni+padhai&c=apps"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2.5 px-7 sm:px-8 py-3.5 sm:py-4 bg-white/[0.06] backdrop-blur border border-white/15 text-white text-sm sm:text-base font-semibold rounded-xl transition-all duration-300 hover:bg-white/[0.12] hover:border-white/25 hover:-translate-y-0.5 active:scale-[0.97]"
            >
              <Download className="w-5 h-5 text-brand-400" />
              <span>{t('Download App')}</span>
            </a>

            <button
              onClick={handleCounselorModal}
              className="inline-flex items-center justify-center gap-2.5 px-7 sm:px-8 py-3.5 sm:py-4 bg-white/[0.06] backdrop-blur border border-white/15 text-white text-sm sm:text-base font-semibold rounded-xl transition-all duration-300 hover:bg-white/[0.12] hover:border-white/25 hover:-translate-y-0.5 active:scale-[0.97] cursor-pointer"
            >
              <Phone className="w-5 h-5 text-brand-400" />
              <span>{t('Talk to Counselor')}</span>
            </button>
          </motion.div>

          {/* Feature Checkmarks */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs sm:text-sm font-medium text-slate-300 pt-2"
          >
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> {t('100% Updated Exam Syllabus')}
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> {t('Printed Books Doorstep Delivery')}
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> {t('Live Teacher Doubts Support')}
            </span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};
