'use client';

import React from 'react';
import { TESTIMONIALS_DATA } from '@/data/testimonials';
import { Star, Quote, Heart } from 'lucide-react';
import Image from 'next/image';

export const TestimonialsSection: React.FC = () => {
  return (
    <section className="py-20 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="text-center max-w-2xl mx-auto">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 uppercase tracking-widest bg-brand-50 px-3.5 py-1.5 rounded-full">
            STUDENTS <Heart className="w-3.5 h-3.5 fill-brand-500 text-brand-500" /> APNI PADHAI
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold font-heading text-navy-900 mt-3">
            Join The Apni Padhai Family Today!
          </h2>
          <p className="text-slate-600 text-sm sm:text-base mt-2">
            Real success stories from aspirants who cracked Sub Inspector, CET, RAS, and LDC exams.
          </p>
        </div>
      </div>

      {/* Infinite Scrolling Marquee */}
      <div className="relative w-full overflow-hidden flex">
        <div className="flex gap-6 animate-marquee whitespace-normal hover:[animation-play-state:paused]">
          {[...TESTIMONIALS_DATA, ...TESTIMONIALS_DATA].map((item, idx) => (
            <div
              key={idx}
              className="w-80 sm:w-96 shrink-0 bg-slate-50 border border-slate-200/80 p-6 rounded-3xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(item.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                  <Quote className="w-6 h-6 text-brand-200" />
                </div>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed italic mb-6">
                  "{item.quote}"
                </p>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-slate-200/60">
                <div className="relative w-11 h-11 rounded-full overflow-hidden shrink-0 border border-brand-200">
                  <Image src={item.photo} alt={item.name} fill className="object-cover" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-navy-900">{item.name}</h4>
                  <p className="text-[11px] font-semibold text-brand-600">
                    {item.exam} {item.rank ? `(${item.rank})` : ''} • {item.city}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
