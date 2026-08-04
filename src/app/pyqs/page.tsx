'use client';

import React, { useState } from 'react';
import { PYQS_DATA } from '@/data/pyqs';
import { Search, Download, FileText, CheckCircle, Filter, Calendar } from 'lucide-react';

export default function PyqPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedYear, setSelectedYear] = useState<string>('All');

  const categories = ['All', 'RAS', 'Sub Inspector', 'CET', 'LDC', 'SSC GD', 'Rajasthan GK'];
  const years = ['All', '2025', '2024', '2023', '2021'];

  const filteredPyqs = PYQS_DATA.filter((pyq) => {
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
            100% FREE OFFICIAL RESOURCE HUB
          </span>
          <h1 className="text-3xl sm:text-5xl font-black font-heading text-navy-900 mt-3">
            Previous Year Solved Papers (PYQs)
          </h1>
          <p className="text-slate-600 text-sm sm:text-base mt-2">
            Download high-quality official question papers with verified answer keys for Rajasthan & Central recruitment exams.
          </p>

          {/* Search Bar */}
          <div className="relative max-w-xl mx-auto mt-6">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by exam name, year or subject (e.g. RAS 2023, SI Hindi)..."
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
            <span>Filter Papers By:</span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500">Category:</span>
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
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 ml-auto">
              <span className="text-xs font-semibold text-slate-500">Year:</span>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-navy-900"
              >
                {years.map((yr) => (
                  <option key={yr} value={yr}>
                    {yr}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* PYQs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPyqs.map((pyq) => (
            <div
              key={pyq.id}
              className="bg-white rounded-3xl p-6 border border-slate-200 shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="px-3 py-1 bg-brand-50 text-brand-700 text-xs font-bold rounded-full">
                    {pyq.category} • {pyq.year}
                  </span>
                  <span className="text-[11px] font-bold text-slate-400">{pyq.pdfSize}</span>
                </div>

                <h3 className="text-base font-bold font-heading text-navy-900 group-hover:text-brand-600 transition-colors mb-2">
                  {pyq.title}
                </h3>
                <p className="text-xs text-slate-500 mb-4">{pyq.subject}</p>

                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 mb-4">
                  <CheckCircle className="w-4 h-4" />
                  <span>Verified Solved Answer Key</span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">{pyq.questionsCount} Questions</span>

                <a
                  href={pyq.downloadUrl}
                  download
                  onClick={(e) => {
                    e.preventDefault();
                    alert(`Downloading official solved PDF for ${pyq.title}`);
                  }}
                  className="px-4 py-2 bg-navy-900 hover:bg-brand-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
