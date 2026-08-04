'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Sparkles,
  Download,
  BookOpen,
  CheckCircle2,
  ArrowRight,
  Phone,
  Users,
  Award,
  BookMarked,
} from 'lucide-react';
import { AnimatedCounter } from '@/components/ui/AnimatedCounter';
import { useAppDispatch } from '@/redux/hooks';
import { setCounselorModalOpen } from '@/redux/features/ui/uiSlice';

interface HeroSectionProps {
  onOpenCounselorModal?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onOpenCounselorModal }) => {
  const dispatch = useAppDispatch();

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
    hidden: { opacity: 0, y: 25 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring', stiffness: 260, damping: 20 },
    },
  };

  return (
    <section className="relative min-h-[85vh] bg-hero-pattern overflow-hidden flex items-center pt-8 sm:pt-12 pb-16 sm:pb-24">
      {/* Background Motion Blobs */}
      <div className="absolute top-10 left-1/4 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-yellow-400/20 rounded-full blur-3xl animate-blob pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-amber-500/15 rounded-full blur-3xl animate-blob animation-delay-2000 pointer-events-none" />

      {/* Grid Overlay */}
      <div className="absolute inset-0 bg-grid-pattern opacity-50 pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full text-center">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6 sm:space-y-8"
        >
          
          {/* Top Animated Pill Badge */}
          <motion.div variants={itemVariants} className="inline-block">
            <div className="inline-flex items-center gap-2 px-3.5 sm:px-5 py-1.5 sm:py-2 bg-white/95 backdrop-blur-md border-2 border-yellow-300 rounded-full shadow-sm text-[11px] sm:text-xs font-black text-navy-900 mx-auto">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-80" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-yellow-500" />
              </span>
              <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span className="truncate">India's Smart Educational Platform & Publication</span>
            </div>
          </motion.div>

          {/* Main Centered Responsive Headline */}
          <motion.h1
            variants={itemVariants}
            className="text-3xl sm:text-5xl lg:text-6xl font-black font-heading text-navy-900 leading-[1.15] tracking-tight max-w-4xl mx-auto px-2"
          >
            Learn with Expert Educators & Crack Your{' '}
            <span className="text-gradient underline decoration-yellow-300 decoration-wavy underline-offset-4 sm:underline-offset-8">
              Dream Exam
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={itemVariants}
            className="text-xs sm:text-lg text-slate-600 leading-relaxed max-w-3xl mx-auto font-medium px-2"
          >
            Comprehensive online live coaching for Rajasthan CET 2026, Sub Inspector (SI), RAS, SSC GD & State Exams. Access bestselling <strong className="text-navy-900 font-bold">Brahmastra Study Books</strong>, solved PYQs, and daily test series.
          </motion.p>

          {/* Responsive Touch-Friendly CTAs */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 pt-2 max-w-md sm:max-w-none mx-auto"
          >
            <Link
              href="/courses"
              className="px-6 sm:px-8 py-3.5 sm:py-4 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-navy-950 font-black text-sm sm:text-base rounded-2xl shadow-button-glow transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2.5 group"
            >
              <BookOpen className="w-5 h-5 text-navy-950" />
              <span>Explore Live Batches</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <a
              href="https://play.google.com/store/search?q=apni+padhai&c=apps"
              target="_blank"
              rel="noreferrer"
              className="px-6 sm:px-8 py-3.5 sm:py-4 bg-navy-900 hover:bg-black text-white font-black text-sm sm:text-base rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2.5 transform hover:-translate-y-1"
            >
              <Download className="w-5 h-5 text-yellow-400" />
              <span>Download App</span>
            </a>

            <button
              onClick={handleCounselorModal}
              className="px-6 sm:px-7 py-3.5 sm:py-4 bg-white/95 hover:bg-white text-navy-900 text-sm sm:text-base font-bold rounded-2xl border-2 border-slate-200 shadow-sm flex items-center justify-center gap-2 transition-all hover:border-yellow-400 hover:text-amber-700"
            >
              <Phone className="w-4.5 h-4.5 text-amber-600" />
              <span>Talk to Counselor</span>
            </button>
          </motion.div>

          {/* Centered Key Metric Counters Grid */}
          <motion.div
            variants={itemVariants}
            className="pt-8 sm:pt-10 border-t border-amber-200/80 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 max-w-4xl mx-auto"
          >
            <div className="bg-white/90 backdrop-blur-md p-4 sm:p-5 rounded-3xl border border-yellow-200 shadow-sm flex items-center justify-center gap-4">
              <div className="p-3 bg-yellow-100 text-amber-800 rounded-2xl shrink-0">
                <Users className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="text-left">
                <div className="text-xl sm:text-2xl font-black font-heading text-navy-900">
                  <AnimatedCounter end={100000} suffix="+" />
                </div>
                <p className="text-[11px] sm:text-xs font-bold text-slate-500">Active Learners</p>
              </div>
            </div>

            <div className="bg-white/90 backdrop-blur-md p-4 sm:p-5 rounded-3xl border border-yellow-200 shadow-sm flex items-center justify-center gap-4">
              <div className="p-3 bg-amber-100 text-amber-900 rounded-2xl shrink-0">
                <BookMarked className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="text-left">
                <div className="text-xl sm:text-2xl font-black font-heading text-navy-900">
                  <AnimatedCounter end={250000} suffix="+" />
                </div>
                <p className="text-[11px] sm:text-xs font-bold text-slate-500">Books Sold</p>
              </div>
            </div>

            <div className="bg-white/90 backdrop-blur-md p-4 sm:p-5 rounded-3xl border border-yellow-200 shadow-sm flex items-center justify-center gap-4">
              <div className="p-3 bg-emerald-100 text-emerald-800 rounded-2xl shrink-0">
                <Award className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="text-left">
                <div className="text-xl sm:text-2xl font-black font-heading text-navy-900">
                  <AnimatedCounter end={12500} suffix="+" />
                </div>
                <p className="text-[11px] sm:text-xs font-bold text-slate-500">Exam Selections</p>
              </div>
            </div>
          </motion.div>

          {/* Feature Checkmarks */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs sm:text-sm font-bold text-slate-700 pt-2"
          >
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> 100% Updated Exam Syllabus
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> Printed Books Doorstep Delivery
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> Live Teacher Doubts Support
            </span>
          </motion.div>

        </motion.div>
      </div>
    </section>
  );
};
