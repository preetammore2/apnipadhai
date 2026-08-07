'use client';

import React, { use } from 'react';
import { UPDATES_DATA } from '@/data/updates';
import { UPDATE_HI } from '@/i18n/data';
import { useTranslation } from '@/i18n/useTranslation';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Clock, User, ArrowLeft } from 'lucide-react';

export default function ArticleDetailsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { t, language } = useTranslation();
  const { slug } = use(params);
  const article = UPDATES_DATA.find((a) => a.slug === slug);

  if (!article) {
    notFound();
  }

  return (
    <div className="py-12 bg-slate-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Back Link */}
        <Link href="/updates" className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-brand-600 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span>{t('Back to Updates & Exam News')}</span>
        </Link>

        {/* Main Article Container */}
        <article className="bg-white p-8 sm:p-12 rounded-3xl border border-slate-200 shadow-card space-y-6">
          <span className="px-3.5 py-1 bg-brand-50 text-brand-700 text-xs font-bold rounded-full">
            {t(article.category)}
          </span>

          <h1 className="text-3xl sm:text-4xl font-extrabold font-heading text-navy-900 leading-tight">
            {language === 'hi' ? UPDATE_HI[article.slug]?.title ?? article.title : article.title}
          </h1>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-500 border-y border-slate-100 py-3">
            <span className="flex items-center gap-1 font-bold text-navy-900">
              <User className="w-3.5 h-3.5 text-brand-500" /> {article.author}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-blue-500" /> {article.date}
            </span>
            <span>•</span>
            <span>{article.readTime}</span>
          </div>

          <div className="relative h-72 sm:h-96 w-full rounded-2xl overflow-hidden border border-slate-200">
            <Image src={article.image} alt={article.title} fill className="object-cover" />
          </div>

          <div className="prose prose-slate max-w-none text-sm sm:text-base leading-relaxed text-slate-700 whitespace-pre-line pt-4">
            {language === 'hi' ? UPDATE_HI[article.slug]?.content ?? article.content : article.content}
          </div>
        </article>

      </div>
    </div>
  );
}
