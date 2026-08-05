'use client';

import React, { use } from 'react';
import { COURSES_DATA } from '@/data/courses';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Accordion, AccordionItem } from '@/components/ui/Accordion';
import { Badge } from '@/components/ui/Badge';
import {
  Star,
  Clock,
  Users,
  CheckCircle2,
  PlayCircle,
  FileText,
  ShieldCheck,
  ArrowLeft,
} from 'lucide-react';
import { useAppDispatch } from '@/redux/hooks';
import { addToCart } from '@/redux/features/cart/cartSlice';
import { toast } from 'sonner';
import { useTranslation } from '@/i18n/useTranslation';
import { COURSE_HI } from '@/i18n/data';

export default function CourseDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const course = COURSES_DATA.find((c) => c.id === id);
  const dispatch = useAppDispatch();
  const { t, language } = useTranslation();

  if (!course) {
    notFound();
  }

  const hi = language === 'hi' ? COURSE_HI[course.id] : undefined;

  return (
    <div className="py-12 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Back Link */}
        <Link href="/courses" className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-brand-600 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span>{t('Back to All Batches')}</span>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Main Content Area */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Course Header Banner */}
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-card space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="primary">{hi?.targetExam ?? course.targetExam}</Badge>
                <Badge variant="accent">{hi?.level ?? course.level}</Badge>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  {course.language} {t('Medium')}
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-extrabold font-heading text-navy-900 leading-tight">
                {hi?.title ?? course.title}
              </h1>
              
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                {hi?.description ?? course.description}
              </p>

              {/* Course Meta Stats */}
              <div className="flex flex-wrap items-center gap-6 pt-4 border-t border-slate-100 text-xs sm:text-sm text-slate-600">
                <div className="flex items-center gap-1.5 font-bold text-navy-900">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span>{course.rating} ({course.reviewCount} {t('Reviews')})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-brand-500" />
                  <span>{course.enrolledStudents.toLocaleString('en-IN')} {t('Enrolled Aspirants')}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-blue-500" />
                  <span>{course.durationMonths} {t('Months Access')}</span>
                </div>
              </div>
            </div>

            {/* What You Will Get Feature List */}
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-card space-y-4">
              <h3 className="text-xl font-bold font-heading text-navy-900">{t('Course Key Features')}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {course.features.map((feat, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs sm:text-sm text-navy-900 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{hi?.features?.[idx] ?? feat}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Curriculum Accordion */}
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-card space-y-6">
              <div>
                <h3 className="text-xl font-bold font-heading text-navy-900">{t('Course Curriculum & Syllabus')}</h3>
                <p className="text-xs text-slate-500 mt-1">
                  {course.totalLectures} {t('Lectures')} • {course.totalTests} {t('Practice Test Series')}
                </p>
              </div>

              <Accordion>
                {course.curriculum.map((mod, idx) => (
                  <AccordionItem
                    key={idx}
                    title={hi?.curriculum?.[idx]?.title ?? mod.title}
                    subtitle={`${mod.lecturesCount} ${t('Lectures')} • ${mod.duration}`}
                    defaultOpen={idx === 0}
                  >
                    <ul className="space-y-2 pt-2">
                      {mod.topics.map((topic, i) => (
                        <li key={i} className="flex items-center justify-between text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xl">
                          <span className="flex items-center gap-2">
                            <PlayCircle className="w-4 h-4 text-brand-500" />
                            {hi?.curriculum?.[idx]?.topics?.[i] ?? topic}
                          </span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase">{t('HD Video')}</span>
                        </li>
                      ))}
                    </ul>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>

            {/* Instructor Card */}
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-card flex flex-col sm:flex-row items-center gap-6">
              <div className="relative w-24 h-24 rounded-2xl overflow-hidden shrink-0 border-2 border-brand-200">
                <Image src={course.instructor.image} alt={course.instructor.name} fill className="object-cover" />
              </div>
              <div className="text-center sm:text-left space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-2.5 py-0.5 rounded-full">
                  {t('Lead Instructor')}
                </span>
                <h4 className="text-lg font-bold font-heading text-navy-900">{course.instructor.name}</h4>
                <p className="text-xs text-slate-500">{hi?.instructor?.role ?? course.instructor.role} • {hi?.instructor?.experience ?? course.instructor.experience}</p>
                <p className="text-xs text-slate-600 pt-2">
                  {t('Specialized in competitive exam strategy, high-yield topic analysis, and zero-memorization conceptual tricks.')}
                </p>
              </div>
            </div>

          </div>

          {/* Sticky Purchasing Widget Sidebar */}
          <div className="lg:col-span-4">
            <div className="sticky top-24 bg-white p-6 rounded-3xl border border-slate-200 shadow-2xl space-y-6">
              
              {/* Media Preview Box */}
              <div className="relative h-44 rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 flex items-center justify-center text-white">
                <Image src={course.image} alt={hi?.title ?? course.title} fill className="object-cover opacity-60" />
                <div className="relative z-10 text-center space-y-2 p-4">
                  <PlayCircle className="w-12 h-12 text-white mx-auto animate-pulse" />
                  <p className="text-xs font-bold text-white">{t('Watch Free Demo Class')}</p>
                </div>
              </div>

              {/* Price Details */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-3xl font-black font-heading text-brand-600">₹{course.price}</span>
                  <span className="text-sm text-slate-400 line-through">₹{course.originalPrice}</span>
                </div>
                <p className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full text-center border border-emerald-200">
                  {t('Special Offer: Save')} {course.discountPercentage}% {t('Today')}
                </p>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <button
                  onClick={() => {
                    dispatch(addToCart({ item: course, type: 'course' }));
                    toast.success(`${hi?.title ?? course.title} ${t('added to cart!')}`);
                  }}
                  className="w-full py-4 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white font-bold text-sm rounded-2xl shadow-button-glow transition-all"
                >
                  {t('Enroll Now in Batch')}
                </button>
                <button
                  onClick={() => {
                    dispatch(addToCart({ item: course, type: 'course' }));
                    toast.success(`${hi?.title ?? course.title} ${t('added to cart!')}`);
                  }}
                  className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-navy-900 font-bold text-xs rounded-2xl transition-colors"
                >
                  {t('Add to Cart')}
                </button>
              </div>

              <div className="pt-4 border-t border-slate-100 space-y-2 text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>{t('100% Secure Payment via PhonePe & UPI')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-500 shrink-0" />
                  <span>{t('Instant E-book PDF Access Included')}</span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
