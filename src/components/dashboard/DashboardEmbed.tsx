'use client';

import React, { useState } from 'react';
import { ExternalLink, Loader2, ShieldCheck } from 'lucide-react';
import { useTranslation } from '@/i18n/useTranslation';

export function DashboardEmbed({ url }: { url: string }) {
  const { t } = useTranslation();
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-card overflow-hidden">
      <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-slate-200 bg-slate-50/60">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span className="font-semibold">{t('Secure embedded dashboard')}</span>
        </div>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-[11px] font-bold text-navy-900 hover:text-amber-600 transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          {t('Open full screen')}
        </a>
      </div>

      <div className="relative min-h-[60vh]">
        {!loaded && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-white z-10">
            <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
            <p className="text-xs text-slate-500">{t('Loading your dashboard...')}</p>
          </div>
        )}
        <iframe
          src={url}
          title="Apni Padhai Student Dashboard"
          className="w-full"
          style={{ height: 'min(80vh, 900px)' }}
          onLoad={() => setLoaded(true)}
        />
      </div>
    </div>
  );
}
