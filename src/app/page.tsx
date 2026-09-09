'use client';

import { HeroSection } from '@/components/home/HeroSection';
import { BooksSection } from '@/components/home/BooksSection';
import { FounderSpotlight } from '@/components/home/FounderSpotlight';
import { TestimonialsSection } from '@/components/home/TestimonialsSection';
import { AppDownloadSection } from '@/components/home/AppDownloadSection';
import { YouTubeSection } from '@/components/home/YouTubeSection';
import { CoursesSection } from '@/components/home/CoursesSection';
import { FaqSection } from '@/components/home/FaqSection';
import { BookDealsSection } from '@/components/home/BookDealsSection';
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
    </div>
  );
}
