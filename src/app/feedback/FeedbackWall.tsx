'use client';

import React from 'react';
import { MessageSquareQuote, Quote } from 'lucide-react';
import type { FeedbackItem } from '@/lib/feedback';

export const FeedbackWall: React.FC<{ items: FeedbackItem[] }> = ({ items }) => {
  if (items.length === 0) {
    return (
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-12 text-center max-w-xl mx-auto">
        <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <MessageSquareQuote className="w-7 h-7" />
        </div>
        <h2 className="text-lg font-black font-heading text-navy-900">Feedback coming soon</h2>
        <p className="text-sm text-slate-500 mt-2">
          Student reviews and feedback will appear here once published.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {items.map((item, index) => (
        <div
          key={index}
          className="bg-white rounded-3xl border border-slate-100 shadow-card p-6 flex flex-col"
        >
          <Quote className="w-6 h-6 text-emerald-400 mb-3" />
          <p className="text-sm text-slate-600 leading-relaxed flex-1">{item.message}</p>

          <div className="flex items-center gap-3 mt-5 pt-5 border-t border-slate-100">
            {item.photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.photo}
                alt={item.name}
                className="w-11 h-11 rounded-full object-cover border border-slate-100"
              />
            ) : (
              <span className="w-11 h-11 rounded-full bg-emerald-100 text-emerald-700 font-black flex items-center justify-center text-sm">
                {item.name?.charAt(0)?.toUpperCase() || '?'}
              </span>
            )}
            <div className="min-w-0">
              <h3 className="text-sm font-bold font-heading text-navy-900 truncate">{item.name}</h3>
              <p className="text-[11px] font-semibold text-slate-400 truncate">
                {[item.exam, item.date].filter(Boolean).join(' · ') || 'Apni Padhai Student'}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
