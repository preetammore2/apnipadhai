'use client';

import React from 'react';
import Link from 'next/link';
import { PYQS_DATA } from '@/data/pyqs';
import { FileText, Download, CheckCircle, ArrowRight, Search, Filter } from 'lucide-react';

export const PyqQuickSection: React.FC = () => {
  return (
    <section className="py-20 bg-slate-50 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <span className="text-xs font-bold text-brand-600 uppercase tracking-widest bg-brand-100/80 px-3.5 py-1.5 rounded-full">
              FREE STUDY RESOURCES
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold font-heading text-navy-900 mt-3">
              Previous Year Question Papers (PYQs)
            </h2>
            <p className="text-slate-600 text-sm sm:text-base mt-2">
              Free solved question papers for RAS, SI, CET, SSC GD & LDC with detailed explanations.
            </p>
          </div>

          <Link
            href="/pyqs"
            className="inline-flex items-center gap-2 text-sm font-bold text-brand-600 hover:text-brand-700 transition-colors shrink-0"
          >
            <span>Search All PYQs Hub</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* PYQ Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PYQS_DATA.slice(0, 3).map((pyq) => (
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
                  <span>Includes Detailed Solution Key</span>
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
    </section>
  );
};
