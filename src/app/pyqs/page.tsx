'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { PYQ } from '@/types';
import { PYQ_HI } from '@/i18n/data';
import { useTranslation } from '@/i18n/useTranslation';
import { Search, Download, CheckCircle, Filter, Loader2, RefreshCw, WifiOff } from 'lucide-react';
import { toast } from 'sonner';

export default function PyqPage() {
  const { t, language } = useTranslation();
  const [pyqs, setPyqs] = useState<PYQ[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedYear, setSelectedYear] = useState<string>('All');

  const loadPyqs = async () => {
    setIsLoading(true);
    setIsError(false);
    try {
      const res = await fetch('/api/pyqs');
      if (!res.ok) throw new Error('Failed to load PYQs');
      const data = (await res.json()) as PYQ[];
      setPyqs(data);
    } catch {
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPyqs();
  }, []);

  const categories = useMemo(() => {
    const set = new Set<string>(['All']);
    pyqs.forEach((pyq) => set.add(pyq.category));
    return Array.from(set);
  }, [pyqs]);

  const years = useMemo(() => {
    const set = new Set<string>(['All']);
    pyqs.forEach((pyq) => set.add(String(pyq.year)));
    return Array.from(set).sort((a, b) => (a === 'All' ? -1 : Number(b) - Number(a)));
  }, [pyqs]);

  const filteredPyqs = pyqs.filter((pyq) => {
    const matchesCategory = selectedCategory === 'All' || pyq.category === selectedCategory;
    const matchesYear = selectedYear === 'All' || pyq.year.toString() === selectedYear;
    const matchesSearch =
      pyq.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pyq.examName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pyq.subject.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesYear && matchesSearch;
  });

  return (
    <div className="py-12 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="text-xs font-bold text-brand-600 uppercase tracking-widest bg-brand-100/80 px-3.5 py-1.5 rounded-full">
            {t('100% FREE OFFICIAL RESOURCE HUB')}
          </span>
          <h1 className="text-3xl sm:text-5xl font-black font-heading text-navy-900 mt-3">
            {t('Previous Year Solved Papers (PYQs)')}
          </h1>
          <p className="text-slate-600 text-sm sm:text-base mt-2">
            {t('Download high-quality official question papers with verified answer keys for Rajasthan & Central recruitment exams.')}
          </p>

          {/* Search Bar */}
          <div className="relative max-w-xl mx-auto mt-6">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={t('Search by exam name, year or subject (e.g. RAS 2023, SI Hindi)...')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm focus:outline-none focus:border-brand-500 shadow-sm text-navy-900"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-card mb-10 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-navy-900 uppercase tracking-wider">
            <Filter className="w-4 h-4 text-brand-500" />
            <span>{t('Filter Papers By:')}</span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500">{t('Category:')}</span>
              <div className="flex flex-wrap gap-1.5">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                      selectedCategory === cat
                        ? 'bg-brand-500 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {t(cat)}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 ml-auto">
              <span className="text-xs font-semibold text-slate-500">{t('Year:')}</span>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-navy-900"
              >
                {years.map((yr) => (
                  <option key={yr} value={yr}>
                    {t(yr)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-500">
            <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
            <p className="text-sm font-semibold">{t('Loading previous year papers...')}</p>
          </div>
        )}

        {isError && (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-slate-500">
            <WifiOff className="w-8 h-8 text-red-400" />
            <p className="text-sm font-semibold text-center">
              {t('Something went wrong while fetching the question papers. Please try again.')}
            </p>
            <button
              onClick={loadPyqs}
              className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{t('Try Again')}</span>
            </button>
          </div>
        )}

        {!isLoading && !isError && filteredPyqs.length === 0 && (
          <div className="text-center py-20 text-slate-500">
            <p className="text-sm font-semibold">{t('No papers match your filters. Try adjusting your search.')}</p>
          </div>
        )}

        {/* PYQs Grid */}
        {!isLoading && !isError && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPyqs.map((pyq) => (
              <div
                key={pyq.id}
                className="bg-white rounded-3xl p-6 border border-slate-200 shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="px-3 py-1 bg-brand-50 text-brand-700 text-xs font-bold rounded-full">
                      {t(pyq.category)} • {pyq.year}
                    </span>
                    {pyq.pdfSize && (
                      <span className="text-[11px] font-bold text-slate-400">{pyq.pdfSize}</span>
                    )}
                  </div>

                  <h3 className="text-base font-bold font-heading text-navy-900 group-hover:text-brand-600 transition-colors mb-2">
                    {language === 'hi' ? PYQ_HI[pyq.id]?.title ?? pyq.title : pyq.title}
                  </h3>
                  <p className="text-xs text-slate-500 mb-4">
                    {language === 'hi' ? PYQ_HI[pyq.id]?.subject ?? pyq.subject : pyq.subject}
                  </p>

                  {pyq.hasSolution && (
                    <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 mb-4">
                      <CheckCircle className="w-4 h-4" />
                      <span>{t('Verified Solved Answer Key')}</span>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  {pyq.questionsCount ? (
                    <span className="text-xs font-bold text-slate-500">
                      {pyq.questionsCount} {t('Questions')}
                    </span>
                  ) : (
                    <span />
                  )}

                  <a
                    href={pyq.downloadUrl}
                    download
                    onClick={() => toast.success(`${t('Downloading official solved PDF for')} ${pyq.title}`)}
                    className="px-4 py-2 bg-navy-900 hover:bg-brand-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{t('Download PDF')}</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
