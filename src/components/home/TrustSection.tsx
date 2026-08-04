'use client';

import React from 'react';
import { AnimatedCounter } from '@/components/ui/AnimatedCounter';
import { Users, BookOpen, Download, Award, Building2, MapPin } from 'lucide-react';

export const TrustSection: React.FC = () => {
  const stats = [
    {
      label: 'Active Students',
      value: 100000,
      suffix: '+',
      icon: <Users className="w-6 h-6 text-brand-500" />,
      bg: 'bg-brand-50',
    },
    {
      label: 'Brahmastra Books Sold',
      value: 250000,
      suffix: '+',
      icon: <BookOpen className="w-6 h-6 text-blue-500" />,
      bg: 'bg-blue-50',
    },
    {
      label: 'App Downloads',
      value: 150000,
      suffix: '+',
      icon: <Download className="w-6 h-6 text-emerald-500" />,
      bg: 'bg-emerald-50',
    },
    {
      label: 'Successful Selections',
      value: 12500,
      suffix: '+',
      icon: <Award className="w-6 h-6 text-amber-500" />,
      bg: 'bg-amber-50',
    },
    {
      label: 'Cities Reached in Rajasthan',
      value: 50,
      suffix: '+',
      icon: <MapPin className="w-6 h-6 text-purple-500" />,
      bg: 'bg-purple-50',
    },
  ];

  return (
    <section className="py-12 bg-white border-y border-slate-100 relative z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-bold text-brand-600 uppercase tracking-widest bg-brand-50 px-3 py-1 rounded-full">
            TRUSTED BY ASPIRANTS NATIONWIDE
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-navy-900 mt-2">
            A Platform Trusted by over 1 Lakh+ Students
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {stats.map((stat, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl bg-slate-50/70 border border-slate-100 hover:border-slate-200 transition-all text-center group hover:-translate-y-1"
            >
              <div className={`w-12 h-12 ${stat.bg} rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform`}>
                {stat.icon}
              </div>
              <div className="text-2xl sm:text-3xl font-black font-heading text-navy-900 tracking-tight">
                <AnimatedCounter end={stat.value} suffix={stat.suffix} />
              </div>
              <p className="text-xs font-bold text-slate-500 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
