'use client';

import React from 'react';
import { Languages } from 'lucide-react';
import { useTranslation } from '@/i18n/useTranslation';
import type { Language } from '@/redux/features/ui/uiSlice';

const OPTIONS: { value: Language; label: string }[] = [
  { value: 'en', label: 'EN' },
  { value: 'hi', label: 'हिंदी' },
];

export const LanguageSwitcher: React.FC = () => {
  const { language, changeLanguage } = useTranslation();

  return (
    <div className="flex items-center gap-1 p-1 bg-white/[0.06] rounded-full border border-white/10">
      <Languages className="w-4 h-4 text-brand-400 ml-1.5 mr-0.5 hidden sm:block" />
      {OPTIONS.map((opt) => {
        const active = language === opt.value;
        return (
          <button
            key={opt.value}
            onClick={() => changeLanguage(opt.value)}
            aria-pressed={active}
            title={opt.value === 'en' ? 'English' : 'हिंदी'}
            className={`px-2.5 py-1.5 rounded-full text-[11px] font-black transition-all ${
              active
                ? 'bg-gradient-to-r from-brand-400 to-brand-600 text-navy-950 shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
};
