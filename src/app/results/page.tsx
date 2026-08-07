'use client';

import React from 'react';
import Image from 'next/image';
import { RESULTS_DATA } from '@/data/results';
import { RESULT_HI } from '@/i18n/data';
import { useTranslation } from '@/i18n/useTranslation';
import { Trophy, Award, Star, CheckCircle } from 'lucide-react';
import { AnimatedCounter } from '@/components/ui/AnimatedCounter';

export default function ResultsPage() {
  const { t, language } = useTranslation();

  return (
    <div className="py-12 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Banner */}
        <div className="text-center max-w-3xl mx-auto">
          <span className="text-xs font-bold text-brand-600 uppercase tracking-widest bg-brand-100/80 px-3.5 py-1.5 rounded-full">
            {t('SELECTION HALL OF FAME')}
          </span>
          <h1 className="text-3xl sm:text-5xl font-black font-heading text-navy-900 mt-3">
            {t('Our Exam Champions & Rankers')}
          </h1>
          <p className="text-slate-600 text-sm sm:text-base mt-2">
            {t('Over 12,500+ student selections produced across RAS, Sub Inspector, CET, SSC GD, and LDC recruitment exams.')}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-card text-center">
            <Trophy className="w-8 h-8 text-amber-500 mx-auto mb-2" />
            <div className="text-2xl sm:text-3xl font-black font-heading text-navy-900">
              <AnimatedCounter end={12500} suffix="+" />
            </div>
            <p className="text-xs font-bold text-slate-500 mt-1">{t('Total Officer Selections')}</p>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-card text-center">
            <Award className="w-8 h-8 text-brand-500 mx-auto mb-2" />
            <div className="text-2xl sm:text-3xl font-black font-heading text-navy-900">AIR 4</div>
            <p className="text-xs font-bold text-slate-500 mt-1">{t('Top SI Exam Rank')}</p>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-card text-center">
            <Star className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <div className="text-2xl sm:text-3xl font-black font-heading text-navy-900">Rank 12</div>
            <p className="text-xs font-bold text-slate-500 mt-1">{t('CET Top State Ranker')}</p>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-card text-center">
            <CheckCircle className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl sm:text-3xl font-black font-heading text-navy-900">98%</div>
            <p className="text-xs font-bold text-slate-500 mt-1">{t('Direct Book Match Rate')}</p>
          </div>
        </div>

        {/* Rankers Wall */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {RESULTS_DATA.map((ranker) => (
            <div
              key={ranker.id}
              className="bg-white rounded-3xl p-6 border border-slate-200 shadow-card hover:shadow-card-hover transition-all text-center group"
            >
              <div className="relative w-28 h-28 mx-auto rounded-full overflow-hidden mb-4 border-4 border-slate-100 shadow-md">
                <Image src={ranker.photo} alt={ranker.name} fill className="object-cover" />
                <div className="absolute bottom-0 inset-x-0 bg-brand-500 text-white text-[10px] font-black uppercase py-0.5">
                  {ranker.rank}
                </div>
              </div>

              <h3 className="text-lg font-bold font-heading text-navy-900 group-hover:text-brand-600 transition-colors">
                {ranker.name}
              </h3>
              <p className="text-xs font-bold text-brand-600 mt-0.5">
                {language === 'hi' ? RESULT_HI[ranker.id]?.exam ?? ranker.exam : ranker.exam}
              </p>
              <p className="text-[11px] text-slate-500 mb-4">
                {ranker.district} • {t('Roll No:')} {ranker.rollNo}
              </p>

              <p className="text-xs text-slate-600 italic bg-slate-50 p-4 rounded-2xl border border-slate-100">
                &ldquo;{language === 'hi' ? RESULT_HI[ranker.id]?.testimonial ?? ranker.testimonial : ranker.testimonial}&rdquo;
              </p>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
