'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { COURSE_HI } from '@/i18n/data';
import { useTranslation } from '@/i18n/useTranslation';
import { Tabs } from '@/components/ui/Tabs';
import { Badge } from '@/components/ui/Badge';
import { Star, Clock, ArrowRight, CheckCircle2, Flame, Loader2, RefreshCw, WifiOff, Search, Heart } from 'lucide-react';
import { useGetCoursesQuery } from '@/redux/api/courseApi';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { addToCart } from '@/redux/features/cart/cartSlice';
import { toggleWishlist } from '@/redux/features/wishlist/wishlistSlice';
import { toast } from 'sonner';

export const CoursesSection: React.FC = () => {
  const { t, language } = useTranslation();
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const dispatch = useAppDispatch();
  const wishlistItems = useAppSelector((state) => state.wishlist.items);

  const { data: courses = [], isLoading, isError, refetch } = useGetCoursesQuery(activeCategory);

  const tabOptions = [
    { id: 'all', label: t('All Live Batches') },
    { id: 'rajasthan-gk', label: t('Rajasthan GK') },
    { id: 'cet', label: t('Rajasthan CET') },
    { id: 'ssc-gd', label: t('SSC GD') },
    { id: 'ras', label: t('RAS Pre + Mains') },
    { id: 'science', label: t('Science Brahmastra') },
  ];

  return (
    <section className="py-20 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <span className="text-xs font-black text-amber-800 uppercase tracking-widest bg-yellow-100 px-3.5 py-1.5 rounded-full border border-yellow-300">
              {t('POPULAR BATCHES 2026')}
            </span>
            <h2 className="text-3xl sm:text-4xl font-black font-heading text-navy-900 mt-3">
              {t('Explore Live & Target Online Courses')}
            </h2>
            <p className="text-slate-600 text-sm sm:text-base mt-2">
              {t('Structured batch curriculum, live interaction, daily DPPs, and comprehensive test series.')}
            </p>
          </div>

          <Link
            href="/courses"
            className="inline-flex items-center gap-2 text-sm font-bold text-amber-700 hover:text-amber-800 transition-colors shrink-0"
          >
            <span>{t('View All Batches')}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Category Tabs */}
        <div className="mb-10">
          <Tabs tabs={tabOptions} activeTab={activeCategory} onChange={setActiveCategory} />
        </div>

        {/* Loading Spinner */}
        {isLoading ? (
          <div className="py-16 text-center">
            <Loader2 className="w-8 h-8 text-amber-600 animate-spin mx-auto" />
            <p className="text-xs text-slate-500 mt-2">{t('Loading Live Batches via RTK Query...')}</p>
          </div>
        ) : isError ? (
          <div className="py-16 text-center">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <WifiOff className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold font-heading text-navy-900">{t('Failed to load live batches')}</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {t('Something went wrong while fetching the latest batches. Please try again.')}
            </p>
            <button
              onClick={() => refetch()}
              className="mt-5 px-6 py-3 bg-navy-900 hover:bg-brand-600 text-white text-xs font-bold rounded-xl transition-colors inline-flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>{t('Retry Now')}</span>
            </button>
          </div>
        ) : courses.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-16 h-16 bg-yellow-100 text-amber-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold font-heading text-navy-900">{t('No batches found in this category')}</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {t('We are adding new batches regularly. Explore all batches to see everything we offer.')}
            </p>
            <Link
              href="/courses"
              className="mt-5 px-6 py-3 bg-yellow-400 hover:bg-yellow-500 text-navy-950 text-xs font-black rounded-xl transition-all inline-flex items-center gap-2"
            >
              <span>{t('View All Batches')}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          /* Course Cards Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course) => {
              const hi = COURSE_HI[course.id];
              return (
              <motion.div
                key={course.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                whileHover={{ y: -8 }}
                className="bg-white rounded-3xl border-2 border-slate-100 hover:border-yellow-300 overflow-hidden shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Course Image Header */}
                  <div className="relative h-52 w-full bg-slate-100 overflow-hidden">
                    <Image
                      src={course.image}
                      alt={language === 'hi' ? hi?.title ?? course.title : course.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-navy-950/80 via-transparent to-transparent" />

                    {/* Top Badges */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {course.isBestseller ? (
                          <span className="px-3 py-1 bg-yellow-400 text-navy-950 text-[10px] font-black uppercase rounded-full shadow-sm flex items-center gap-1">
                            <Flame className="w-3 h-3 fill-navy-950" /> {t('BESTSELLER')}
                          </span>
                        ) : (
                          <Badge variant="accent" size="sm">
                            {language === 'hi' ? hi?.targetExam ?? course.targetExam : course.targetExam}
                          </Badge>
                        )}
                        <span className="px-3 py-1 bg-white/95 text-navy-900 text-xs font-bold rounded-full shadow-sm">
                          {course.language}
                        </span>
                      </div>

                      <button
                        onClick={() => {
                          const isWishlisted = wishlistItems.some(
                            (item) => item.id === course.id && item.type === 'course'
                          );
                          dispatch(toggleWishlist({ id: course.id, type: 'course' }));
                          if (isWishlisted) {
                            toast.info(t('Removed from wishlist'));
                          } else {
                            toast.success(t('Added to wishlist!'));
                          }
                        }}
                        className="p-2 bg-white/95 hover:bg-white rounded-full shadow-sm transition-colors"
                        title={t('Save to wishlist')}
                      >
                        <Heart
                          className={`w-4 h-4 transition-colors ${
                            wishlistItems.some((item) => item.id === course.id && item.type === 'course')
                              ? 'fill-red-500 text-red-500'
                              : 'text-slate-600'
                          }`}
                        />
                      </button>
                    </div>

                    <div className="absolute bottom-3 left-3 right-3 text-white flex items-center justify-between">
                      <span className="text-xs font-medium flex items-center gap-1 text-slate-200">
                        <Clock className="w-3.5 h-3.5 text-yellow-400" /> {course.durationMonths} {t('Months Access')}
                      </span>
                      <span className="text-xs font-black text-yellow-300 flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" /> {course.rating} ({course.reviewCount})
                      </span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-6">
                    <h3 className="text-lg font-bold font-heading text-navy-900 group-hover:text-amber-700 transition-colors line-clamp-2 mb-2">
                      {language === 'hi' ? hi?.title ?? course.title : course.title}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 mb-4 leading-relaxed">
                      {language === 'hi' ? hi?.subtitle ?? course.subtitle : course.subtitle}
                    </p>

                    {/* Instructor Pill */}
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100 mb-4">
                      <div className="relative w-9 h-9 rounded-full overflow-hidden shrink-0 border-2 border-yellow-400">
                        <Image src={course.instructor.image} alt={course.instructor.name} fill className="object-cover" />
                      </div>
                      <div className="text-xs min-w-0">
                        <p className="font-bold text-navy-900 truncate">{course.instructor.name}</p>
                        <p className="text-[10px] text-slate-500 truncate">
                          {language === 'hi' ? hi?.instructor?.experience ?? course.instructor.experience : course.instructor.experience}
                        </p>
                      </div>
                    </div>

                    {/* Key Highlights */}
                    <div className="space-y-1.5 mb-6 text-xs text-slate-600">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{course.totalLectures}+ {t('Live HD Video Classes')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{course.totalTests}+ {t('Mock Tests & Topic PYQs')}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Price & Enrollment Footer */}
                <div className="px-6 pb-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-4 bg-slate-50/50">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-black font-heading text-navy-900">₹{course.price}</span>
                      <span className="text-xs text-slate-400 line-through">₹{course.originalPrice}</span>
                    </div>
                    <span className="text-[10px] font-black text-emerald-600">{course.discountPercentage}% {t('OFF TODAY')}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        dispatch(addToCart({ item: course, type: 'course' }));
                        toast.success(`${language === 'hi' ? hi?.title ?? course.title : course.title} ${t('added to cart!')}`);
                      }}
                      className="px-5 py-2.5 bg-yellow-400 hover:bg-yellow-500 text-navy-950 font-black rounded-xl text-xs shadow-button-glow transition-all"
                    >
                      {t('Enroll Now')}
                    </button>
                    <Link
                      href={`/courses/${course.id}`}
                      className="p-2.5 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl text-slate-700 transition-colors"
                      title={t('View Course Details')}
                    >
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};
