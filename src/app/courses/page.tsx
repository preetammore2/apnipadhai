'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { COURSES_DATA } from '@/data/courses';
import { Tabs } from '@/components/ui/Tabs';
import { Badge } from '@/components/ui/Badge';
import Image from 'next/image';
import Link from 'next/link';
import { Star, Clock, CheckCircle2, ArrowRight, Search } from 'lucide-react';
import { useAppDispatch } from '@/redux/hooks';
import { addToCart } from '@/redux/features/cart/cartSlice';
import { toast } from 'sonner';
import { useTranslation } from '@/i18n/useTranslation';
import { COURSE_HI } from '@/i18n/data';

function CoursesPageContent() {
  const searchParams = useSearchParams();
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const dispatch = useAppDispatch();
  const { t, language } = useTranslation();

  const tabOptions = useMemo(
    () => [
      { id: 'all', label: t('All Courses') },
      { id: 'rajasthan-gk', label: t('Rajasthan GK') },
      { id: 'cet', label: t('Rajasthan CET') },
      { id: 'ssc-gd', label: t('SSC GD') },
      { id: 'ras', label: t('RAS Pre + Mains') },
      { id: 'science', label: t('Science') },
    ],
    [t],
  );

  useEffect(() => {
    const categoryParam = searchParams.get('category');
    if (categoryParam) {
      const knownTab = tabOptions.some((t) => t.id === categoryParam);
      setActiveCategory(knownTab ? categoryParam : 'all');
    }
  }, [searchParams, tabOptions]);

  const filtered = COURSES_DATA.filter((course) => {
    const matchesCategory = activeCategory === 'all' || course.category === activeCategory;
    const matchesSearch =
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.targetExam.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="py-12 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Banner */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="text-xs font-bold text-brand-600 uppercase tracking-widest bg-brand-100/80 px-3.5 py-1.5 rounded-full">
            {t('ONLINE LIVE & RECORDED BATCHES')}
          </span>
          <h1 className="text-3xl sm:text-5xl font-black font-heading text-navy-900 mt-3">
            {t('Explore All Courses')}
          </h1>
          <p className="text-slate-600 text-sm sm:text-base mt-2">
            {t('Structured exam prep designed by Rohit Sir & top educators. Includes live classes, DPPs & Test Series.')}
          </p>

          {/* Search Input */}
          <div className="relative max-w-md mx-auto mt-6">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={t('Search course title or exam (e.g. CET, SI, Science)...')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm focus:outline-none focus:border-brand-500 shadow-sm text-navy-900"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-10 flex justify-center">
          <Tabs tabs={tabOptions} activeTab={activeCategory} onChange={setActiveCategory} />
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map((course) => (
            <div
              key={course.id}
              className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
                  <Image
                    src={course.image}
                    alt={language === 'hi' ? COURSE_HI[course.id]?.title ?? course.title : course.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-900/70 via-transparent to-transparent" />
                  
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                    <Badge variant="primary" size="sm">
                      {language === 'hi' ? COURSE_HI[course.id]?.targetExam ?? course.targetExam : course.targetExam}
                    </Badge>
                    <span className="px-2.5 py-1 bg-white/90 text-navy-900 text-xs font-bold rounded-full">
                      {course.language}
                    </span>
                  </div>

                  <div className="absolute bottom-3 left-3 right-3 text-white flex items-center justify-between">
                    <span className="text-xs font-medium flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> {course.durationMonths} {t('Months')}
                    </span>
                    <span className="text-xs font-bold text-amber-300 flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-amber-300" /> {course.rating} ({course.reviewCount})
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-lg font-bold font-heading text-navy-900 group-hover:text-brand-600 transition-colors line-clamp-2 mb-2">
                    {language === 'hi' ? COURSE_HI[course.id]?.title ?? course.title : course.title}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2 mb-4 leading-relaxed">
                    {language === 'hi' ? COURSE_HI[course.id]?.subtitle ?? course.subtitle : course.subtitle}
                  </p>

                  <div className="flex items-center gap-3 p-2.5 bg-slate-50 rounded-2xl border border-slate-100 mb-4">
                    <div className="relative w-8 h-8 rounded-full overflow-hidden shrink-0">
                      <Image src={course.instructor.image} alt={course.instructor.name} fill className="object-cover" />
                    </div>
                    <div className="text-xs">
                      <p className="font-bold text-navy-900">{course.instructor.name}</p>
                      <p className="text-[10px] text-slate-500">{language === 'hi' ? COURSE_HI[course.id]?.instructor?.role ?? course.instructor.role : course.instructor.role}</p>
                    </div>
                  </div>

                  <div className="space-y-1 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      <span>{course.totalLectures}+ {t('Live HD Video Classes')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      <span>{course.totalTests}+ {t('Mock Tests & Topic PYQs')}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-6 pb-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-4 bg-slate-50/50">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-black font-heading text-brand-600">₹{course.price}</span>
                    <span className="text-xs text-slate-400 line-through">₹{course.originalPrice}</span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-600">{course.discountPercentage}% {t('OFF')}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      dispatch(addToCart({ item: course, type: 'course' }));
                      toast.success(`${language === 'hi' ? COURSE_HI[course.id]?.title ?? course.title : course.title} ${t('added to cart!')}`);
                    }}
                    className="px-4 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-bold shadow-button-glow transition-all"
                  >
                    {t('Enroll Now')}
                  </button>
                  <Link
                    href={`/courses/${course.id}`}
                    className="p-2.5 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl text-slate-700 transition-colors"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function CoursesPage() {
  return (
    <Suspense fallback={null}>
      <CoursesPageContent />
    </Suspense>
  );
}
