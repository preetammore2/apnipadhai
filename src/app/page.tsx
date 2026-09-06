'use client';

import { HeroSection } from '@/components/home/HeroSection';
import { BooksSection } from '@/components/home/BooksSection';
import { FounderSpotlight } from '@/components/home/FounderSpotlight';
import { PyqQuickSection } from '@/components/home/PyqQuickSection';
import { TestimonialsSection } from '@/components/home/TestimonialsSection';
import { AppDownloadSection } from '@/components/home/AppDownloadSection';
import { YouTubeSection } from '@/components/home/YouTubeSection';
import { CoursesSection } from '@/components/home/CoursesSection';
import { FaqSection } from '@/components/home/FaqSection';
import { BookDealsSection } from '@/components/home/BookDealsSection';
import { ArrowRight, Download, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useTranslation } from '@/i18n/useTranslation';

export default function HomePage() {
  const { t } = useTranslation();

  return (
    <div className="space-y-0">
      {/* 1. Hero Section */}
      <HeroSection />

      {/* 3. Brahmastra Books Store */}
      <BooksSection />

      {/* 4b. Books with Discount (from WordPress books-with-discount page) */}
      <BookDealsSection />

      {/* 6. Solved PYQs Section */}
      <PyqQuickSection />

      {/* 7. Student Love & Testimonials */}
      <TestimonialsSection />

      {/* 9. Free Lectures / YouTube Section */}
      <YouTubeSection />

      {/* 10. Founder's Vision (Rohit Sir) */}
      <FounderSpotlight />

      {/* 12. App Download Banner */}
      <AppDownloadSection />

      {/* 13. Courses / Test Series (from WordPress) */}
      <CoursesSection />

      {/* 14b. FAQs (from WordPress FAQ page) */}
      <FaqSection />

      {/* 12. Final CTA Banner */}
      <section className="py-12 bg-navy-950 text-white text-center relative overflow-hidden border-t border-amber-500/20">
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
              href="/books"
              className="px-8 py-4 bg-yellow-400 hover:bg-yellow-500 text-navy-950 font-black text-sm sm:text-base rounded-2xl shadow-button-glow transition-all flex items-center gap-2 transform hover:-translate-y-1"
            >
              <span>{t('Explore All Books')}</span>
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
          </div>
        </div>
      </section>
    </div>
  );
}
