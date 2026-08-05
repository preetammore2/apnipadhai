'use client';

import React, { useState } from 'react';
import { HeroSection } from '@/components/home/HeroSection';
import { TrustSection } from '@/components/home/TrustSection';
import { FeaturesSection } from '@/components/home/FeaturesSection';
import { CoursesSection } from '@/components/home/CoursesSection';
import { BooksSection } from '@/components/home/BooksSection';
import { FounderSpotlight } from '@/components/home/FounderSpotlight';
import { PyqQuickSection } from '@/components/home/PyqQuickSection';
import { ResultsSection } from '@/components/home/ResultsSection';
import { TestimonialsSection } from '@/components/home/TestimonialsSection';
import { AppDownloadSection } from '@/components/home/AppDownloadSection';
import { CommunitySection } from '@/components/home/CommunitySection';
import { CounselorModal } from '@/components/layout/CounselorModal';
import { ArrowRight, Phone, Download, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useTranslation } from '@/i18n/useTranslation';

export default function HomePage() {
  const [isCounselorOpen, setIsCounselorOpen] = useState(false);
  const { t } = useTranslation();

  return (
    <div className="space-y-0">
      {/* 1. Hero Section */}
      <HeroSection onOpenCounselorModal={() => setIsCounselorOpen(true)} />

      {/* 2. Trust Numbers Section */}
      <TrustSection />

      {/* 3. Why Students Choose Apni Padhai */}
      <FeaturesSection />

      {/* 4. Live & Target Courses */}
      <CoursesSection />

      {/* 5. Brahmastra Books Store */}
      <BooksSection />

      {/* 6. Founder Spotlight (Rohit Sir) */}
      <FounderSpotlight />

      {/* 7. Solved PYQs Section */}
      <PyqQuickSection />

      {/* 8. Top Rankers & Selections */}
      <ResultsSection />

      {/* 9. Student Love & Testimonials */}
      <TestimonialsSection />

      {/* 10. Community Section (600K+ YouTube Subscribers & 200K+ Telegram Followers) */}
      <CommunitySection />

      {/* 11. App Download Banner */}
      <AppDownloadSection />

      {/* 12. Final CTA Banner */}
      <section className="py-20 bg-navy-950 text-white text-center relative overflow-hidden border-t border-amber-500/20">
        <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 relative z-10 space-y-6">
          <span className="px-4 py-1.5 bg-yellow-400/10 text-yellow-300 border border-yellow-400/20 rounded-full text-xs font-black uppercase tracking-wider inline-flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-yellow-400" /> {t('READY TO CRACK YOUR DREAM EXAM?')}
          </span>

          <h2 className="text-3xl sm:text-5xl font-black font-heading tracking-tight leading-tight text-white">
            {t('Start Your Success Journey With Apni Padhai Today')}
          </h2>

          <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto">
            {t("Join 1,00,000+ students preparing with India's smart learning platform. Get instant access to online classes & Brahmastra books.")}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link
              href="/courses"
              className="px-8 py-4 bg-yellow-400 hover:bg-yellow-500 text-navy-950 font-black text-sm sm:text-base rounded-2xl shadow-button-glow transition-all flex items-center gap-2 transform hover:-translate-y-1"
            >
              <span>{t('Explore All Batches')}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <a
              href="https://play.google.com/store/search?q=apni+padhai&c=apps"
              target="_blank"
              rel="noreferrer"
              className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-bold text-sm sm:text-base rounded-2xl border border-white/20 transition-all flex items-center gap-2 transform hover:-translate-y-1"
            >
              <Download className="w-4 h-4 text-yellow-400" />
              <span>{t('Install App')}</span>
            </a>

            <button
              onClick={() => setIsCounselorOpen(true)}
              className="px-8 py-4 bg-navy-900 hover:bg-black text-slate-200 font-bold text-sm sm:text-base rounded-2xl border border-slate-700 transition-all flex items-center gap-2"
            >
              <Phone className="w-4 h-4 text-amber-400" />
              <span>{t('Talk to Counselor')}</span>
            </button>
          </div>
        </div>
      </section>

      {/* Counselor Modal */}
      <CounselorModal isOpen={isCounselorOpen} onClose={() => setIsCounselorOpen(false)} />
    </div>
  );
}
