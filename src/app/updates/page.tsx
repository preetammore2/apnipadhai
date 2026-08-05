'use client';

import React from 'react';
import { UPDATES_DATA } from '@/data/updates';
import { UPDATE_HI } from '@/i18n/data';
import { useTranslation } from '@/i18n/useTranslation';
import Image from 'next/image';
import Link from 'next/link';
import { Clock, ArrowRight } from 'lucide-react';

export default function UpdatesPage() {
  const { t, language } = useTranslation();

  return (
    <div className="py-12 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Banner */}
        <div className="text-center max-w-3xl mx-auto">
          <span className="text-xs font-bold text-brand-600 uppercase tracking-widest bg-brand-100/80 px-3.5 py-1.5 rounded-full">
            {t('EXAM NEWS & STUDY ARTICLES')}
          </span>
          <h1 className="text-3xl sm:text-5xl font-black font-heading text-navy-900 mt-3">
            {t('Latest Updates & Notifications')}
          </h1>
          <p className="text-slate-600 text-sm sm:text-base mt-2">
            {t('Stay informed with official recruitment notifications, exam pattern changes, and expert preparation strategies.')}
          </p>
        </div>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {UPDATES_DATA.map((article) => (
            <div
              key={article.id}
              className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
                  <Image src={article.image} alt={article.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  <span className="absolute top-3 left-3 px-3 py-1 bg-navy-900/90 text-white text-xs font-bold rounded-full">
                    {t(article.category)}
                  </span>
                </div>

                <div className="p-6">
                  <div className="flex items-center gap-3 text-[11px] text-slate-400 mb-2">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {article.date}</span>
                    <span>•</span>
                    <span>{article.readTime}</span>
                  </div>

                  <Link href={`/updates/${article.slug}`}>
                    <h3 className="text-lg font-bold font-heading text-navy-900 group-hover:text-brand-600 transition-colors line-clamp-2 mb-2">
                      {language === 'hi' ? UPDATE_HI[article.slug]?.title ?? article.title : article.title}
                    </h3>
                  </Link>
                  <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">
                    {language === 'hi' ? UPDATE_HI[article.slug]?.excerpt ?? article.excerpt : article.excerpt}
                  </p>
                </div>
              </div>

              <div className="px-6 pb-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600">{t('By')} {article.author}</span>
                <Link
                  href={`/updates/${article.slug}`}
                  className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
                >
                  {t('Read Article')} <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
