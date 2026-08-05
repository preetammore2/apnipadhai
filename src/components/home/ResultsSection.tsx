'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { RESULTS_DATA } from '@/data/results';
import { RESULT_HI } from '@/i18n/data';
import { useTranslation } from '@/i18n/useTranslation';
import { ArrowRight } from 'lucide-react';

export const ResultsSection: React.FC = () => {
  const { t, language } = useTranslation();
  return (
    <section className="py-20 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <span className="text-xs font-bold text-brand-600 uppercase tracking-widest bg-brand-50 px-3.5 py-1.5 rounded-full">
              {t('HALL OF FAME 2022-2026')}
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold font-heading text-navy-900 mt-3">
              {t('Apni Padhai Selection Champions')}
            </h2>
            <p className="text-slate-600 text-sm sm:text-base mt-2">
              {t('Celebrating top rankers who transformed their dedication into official government officer roles.')}
            </p>
          </div>

          <Link
            href="/results"
            className="inline-flex items-center gap-2 text-sm font-bold text-brand-600 hover:text-brand-700 transition-colors shrink-0"
          >
            <span>{t('View Full Ranker Gallery')}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Rankers Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {RESULTS_DATA.map((ranker) => (
            <div
              key={ranker.id}
              className="bg-slate-50 rounded-3xl p-6 border border-slate-200/80 shadow-card hover:shadow-card-hover transition-all text-center group hover:-translate-y-1"
            >
              <div className="relative w-24 h-24 mx-auto rounded-full overflow-hidden mb-4 border-4 border-white shadow-md">
                <Image src={ranker.photo} alt={ranker.name} fill className="object-cover" />
                <div className="absolute bottom-0 inset-x-0 bg-brand-500 text-white text-[9px] font-black uppercase py-0.5">
                  {ranker.rank}
                </div>
              </div>

              <h3 className="text-base font-bold font-heading text-navy-900 group-hover:text-brand-600 transition-colors">
                {ranker.name}
              </h3>
              <p className="text-xs font-bold text-brand-600 mt-0.5">{language === 'hi' ? RESULT_HI[ranker.id]?.exam ?? ranker.exam : ranker.exam}</p>
              <p className="text-[11px] text-slate-500 mb-4">{ranker.district} • {t('Roll No:')} {ranker.rollNo}</p>

              <p className="text-xs text-slate-600 italic bg-white p-3 rounded-2xl border border-slate-100 line-clamp-3">
                &ldquo;{language === 'hi' ? RESULT_HI[ranker.id]?.testimonial ?? ranker.testimonial : ranker.testimonial}&rdquo;
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
