'use client';

import React from 'react';
import { useTranslation } from '@/i18n/useTranslation';
import { StudentsGallery } from '@/components/results/StudentsGallery';
import type { FolderStudent } from '@/lib/resultStudents';

interface ResultsClientProps {
  rajasthanPolice: FolderStudent[];
  reet: FolderStudent[];
}

export const ResultsClient: React.FC<ResultsClientProps> = ({ rajasthanPolice, reet }) => {
  const { t } = useTranslation();

  return (
    <div className="py-12 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">

        {/* Banner */}
        <div className="text-center max-w-3xl mx-auto">
          <span className="text-xs font-bold text-brand-600 uppercase tracking-widest bg-brand-100/80 px-3.5 py-1.5 rounded-full">
            {t('SELECTION HALL OF FAME')}
          </span>
          <h1 className="text-3xl sm:text-5xl font-black font-heading text-navy-900 mt-3">
            {t('Our Exam Champions & Rankers')}
          </h1>
          <p className="text-slate-600 text-sm sm:text-base mt-2">
            {t('Celebrating students who cleared Rajasthan Police and REET exams with Apni Padhai.')}
          </p>
        </div>

        {/* Rajasthan Police Selections */}
        <StudentsGallery
          students={rajasthanPolice}
          category="Rajasthan Police"
          badge={t('RAJASTHAN POLICE SELECTIONS')}
          title={t('Rajasthan Police Selected Students')}
          subtitle={t('Young aspirants who cleared the Rajasthan Police recruitment exam with Apni Padhai.')}
        />

        {/* REET L1/L2 Selections */}
        <StudentsGallery
          students={reet}
          category="REET L1/L2"
          badge={t('REET L1/L2 SELECTIONS')}
          title={t('REET L1 / L2 Qualified Students')}
          subtitle={t('Teachers who qualified the Rajasthan Eligibility Examination for Level 1 & Level 2.')}
        />

      </div>
    </div>
  );
};
