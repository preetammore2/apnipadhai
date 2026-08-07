'use client';

import React from 'react';
import Link from 'next/link';
import { COURSES_DATA } from '@/data/courses';
import { BOOKS_DATA } from '@/data/books';
import { BookOpen, ShoppingBag, PlayCircle, CheckCircle } from 'lucide-react';
import { useTranslation } from '@/i18n/useTranslation';

export default function DashboardPage() {
  const { t } = useTranslation();
  const enrolledCourse = COURSES_DATA[0];
  const orderedBook = BOOKS_DATA[0];

  return (
    <div className="py-12 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Welcome Header */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-card flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-brand-100 text-brand-700 rounded-full flex items-center justify-center font-bold text-xl font-heading">
              RS
            </div>
            <div>
              <h1 className="text-2xl font-bold font-heading text-navy-900">{t('Welcome Back, Aspirant!')}</h1>
              <p className="text-xs text-slate-500">{t('Student ID:')} AP-2026-84920 • {t('Target Exam:')} Rajasthan CET 2026</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/courses" className="px-4 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-bold transition-all shadow-button-glow">
              {t('Explore New Batches')}
            </Link>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Enrolled Content */}
          <div className="lg:col-span-8 space-y-6">
            
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-card space-y-4">
              <h3 className="text-lg font-bold font-heading text-navy-900">{t('My Enrolled Courses')}</h3>
              
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-brand-100 text-brand-700 rounded-xl">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-navy-900">{enrolledCourse.title}</h4>
                    <p className="text-xs text-slate-500">{enrolledCourse.totalLectures} {t('Lectures • Progress:')} 42% {t('Completed')}</p>
                  </div>
                </div>

                <Link
                  href={`/courses/${enrolledCourse.id}`}
                  className="px-4 py-2 bg-navy-900 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shrink-0"
                >
                  <PlayCircle className="w-4 h-4" />
                  <span>{t('Resume Learning')}</span>
                </Link>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-card space-y-4">
              <h3 className="text-lg font-bold font-heading text-navy-900">{t('My Book Orders')}</h3>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 text-blue-700 rounded-xl">
                    <ShoppingBag className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-navy-900">{orderedBook.title}</h4>
                    <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" /> {t('Dispatched via BlueDart (AWB:')} 9482910)
                    </p>
                  </div>
                </div>

                <span className="text-xs font-bold text-navy-900">₹{orderedBook.price}</span>
              </div>
            </div>

          </div>

          {/* Sidebar Stats */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-card space-y-4">
              <h3 className="text-base font-bold font-heading text-navy-900">{t('Learning Analytics')}</h3>
              
              <div className="space-y-3 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>{t('Syllabus Covered')}</span>
                  <span className="font-bold text-navy-900">42%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-brand-500 h-2 rounded-full w-[42%]" />
                </div>

                <div className="flex justify-between text-slate-600 pt-2">
                  <span>{t('Mock Tests Attempted')}</span>
                  <span className="font-bold text-navy-900">14 / 50</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>{t('Average Score')}</span>
                  <span className="font-bold text-emerald-600">84.5%</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
