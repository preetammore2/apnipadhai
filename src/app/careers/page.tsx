'use client';

import { useTranslation } from '@/i18n/useTranslation';

export default function CareersPage() {
  const { t } = useTranslation();

  return (
    <div className="py-12 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-3xl mx-auto">
          <span className="text-xs font-bold text-brand-600 uppercase tracking-widest bg-brand-100/80 px-3.5 py-1.5 rounded-full">
            {t('JOIN OUR TEAM')}
          </span>
          <h1 className="text-3xl sm:text-5xl font-black font-heading text-navy-900 mt-3">
            {t('Careers at Apni Padhai')}
          </h1>
          <p className="text-slate-600 text-sm sm:text-base mt-2">
            {t('Build the future of EdTech with us. We are looking for passionate subject experts, content writers, video editors, and layout designers.')}
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-3xl p-10 sm:p-14 border border-slate-200 shadow-card text-center">
            <h3 className="text-xl font-bold font-heading text-navy-900">
              {t('No Current Openings')}
            </h3>
            <p className="text-sm text-slate-500 mt-2">
              {t('We are currently not hiring. Please check back later or email us your resume at hr@apnipadhai.com.')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
