'use client';

import React, { useState } from 'react';
import { useTranslation } from '@/i18n/useTranslation';
import { StudentsGallery } from '@/components/results/StudentsGallery';
import { FolderOpen, Shield, BookOpen, ArrowLeft } from 'lucide-react';
import type { FolderStudent } from '@/lib/resultStudents';

interface ResultsClientProps {
  rajasthanPolice: FolderStudent[];
  reet: FolderStudent[];
}

type FolderKey = 'rajasthanPolice' | 'reet';

interface FolderInfo {
  key: FolderKey;
  title: string;
  subtitle: string;
  badge: string;
  category: FolderStudent['category'];
  count: number;
}

export const ResultsClient: React.FC<ResultsClientProps> = ({ rajasthanPolice, reet }) => {
  const { t } = useTranslation();
  const [activeFolder, setActiveFolder] = useState<FolderKey | null>(null);

  const folders: FolderInfo[] = [
    {
      key: 'rajasthanPolice',
      title: t('Rajasthan Police'),
      subtitle: t('Young aspirants who cleared the Rajasthan Police recruitment exam with Apni Padhai.'),
      badge: t('RAJASTHAN POLICE SELECTIONS'),
      category: 'Rajasthan Police',
      count: rajasthanPolice.length,
    },
    {
      key: 'reet',
      title: t('REET L1 / L2'),
      subtitle: t('Teachers who qualified the Rajasthan Eligibility Examination for Level 1 & Level 2.'),
      badge: t('REET L1/L2 SELECTIONS'),
      category: 'REET L1/L2',
      count: reet.length,
    },
  ];

  const activeData = activeFolder === 'rajasthanPolice' ? rajasthanPolice
    : activeFolder === 'reet' ? reet
    : [];
  const activeInfo = folders.find((f) => f.key === activeFolder);

  return (
    <div className="py-12 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">

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

        {activeFolder && activeInfo ? (
          /* ---- Selected folder view ---- */
          <div className="space-y-8">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setActiveFolder(null)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-slate-300 bg-white text-slate-700 font-bold text-sm hover:bg-slate-100 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                {t('All folders')}
              </button>
            </div>

            <StudentsGallery
              students={activeData}
              category={activeInfo.category}
              badge={activeInfo.badge}
              title={activeInfo.title}
              subtitle={activeInfo.subtitle}
            />
          </div>
        ) : (
          /* ---- Folder selection view ---- */
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {folders.map((folder) => {
              const isBlue = folder.key === 'rajasthanPolice';
              return (
                <button
                  key={folder.key}
                  type="button"
                  onClick={() => setActiveFolder(folder.key)}
                  disabled={folder.count === 0}
                  className={`group relative overflow-hidden rounded-3xl border shadow-card hover:shadow-card-hover transition-all text-left ${
                    isBlue ? 'border-blue-200 bg-white' : 'border-emerald-200 bg-white'
                  } ${folder.count === 0 ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:-translate-y-1'}`}
                >
                  <div className={`relative h-48 sm:h-56 overflow-hidden ${isBlue ? 'bg-gradient-to-br from-blue-500 to-blue-700' : 'bg-gradient-to-br from-emerald-500 to-emerald-700'}`}>
                    <div className="absolute inset-0 flex items-center justify-center">
                      {isBlue ? (
                        <Shield className="w-24 h-24 text-white/35" strokeWidth={1.5} />
                      ) : (
                        <BookOpen className="w-24 h-24 text-white/35" strokeWidth={1.5} />
                      )}
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-navy-900/70 via-transparent to-transparent" />
                    <div className="absolute bottom-3 left-4">
                      <span className={`inline-flex items-center gap-1.5 text-white text-xs font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-md ${
                        isBlue ? 'bg-blue-600/90' : 'bg-emerald-600/90'
                      }`}>
                        {isBlue ? <Shield className="w-3.5 h-3.5" /> : <BookOpen className="w-3.5 h-3.5" />}
                        {folder.badge}
                      </span>
                    </div>
                  </div>

                  <div className="p-5 flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-extrabold font-heading text-navy-900 flex items-center gap-2">
                        <FolderOpen className={`w-5 h-5 ${isBlue ? 'text-blue-600' : 'text-emerald-600'}`} />
                        {folder.title}
                      </h3>
                      <p className="text-xs text-slate-500 font-semibold mt-1">
                        {folder.count} {folder.count === 1 ? t('student') : t('students')}
                      </p>
                    </div>
                    <span className={`text-sm font-black shrink-0 ${isBlue ? 'text-blue-600' : 'text-emerald-600'} group-hover:translate-x-1 transition-transform`}>
                      {t('Open')} →
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
};
