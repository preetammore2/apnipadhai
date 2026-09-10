'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslation } from '@/i18n/useTranslation';
import { CheckCircle2, Heart, ShieldCheck, Target, Send, ArrowRight, Download } from 'lucide-react';
import { FaYoutube } from 'react-icons/fa';
import { FeaturesSection } from '@/components/home/FeaturesSection';
import { TrustSection } from '@/components/home/TrustSection';
import { CommunitySection } from '@/components/home/CommunitySection';
import { PyqQuickSection } from '@/components/home/PyqQuickSection';

export default function AboutPage() {
  const { t } = useTranslation();

  return (
    <div className="py-12 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Banner */}
        <div className="text-center max-w-3xl mx-auto">
          <span className="text-xs font-bold text-brand-600 uppercase tracking-widest bg-brand-100/80 px-3.5 py-1.5 rounded-full">
            {t('OUR STORY & MISSION')}
          </span>
          <h1 className="text-3xl sm:text-5xl font-black font-heading text-navy-900 mt-3">
            {t('About Apni Padhai Publication')}
          </h1>
          <p className="text-slate-600 text-sm sm:text-base mt-2">
            {t('Democratizing competitive exam preparation in Rajasthan & India through affordable digital courses and bestselling study books.')}
          </p>
        </div>

        {/* Founder Feature Section */}
        <div className="bg-white p-8 sm:p-12 rounded-3xl border border-slate-200 shadow-card grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-5">
            <div className="relative h-[420px] w-full rounded-2xl overflow-hidden border-2 border-brand-200 shadow-xl">
              <Image src="/images/rohit sir QHD Photo.png" alt="Rohit Choudhary Founder" fill className="object-cover" />
            </div>
          </div>

          <div className="lg:col-span-7 space-y-4">
            <span className="px-3 py-1 bg-brand-50 text-brand-700 text-xs font-bold rounded-full">
              {t('FOUNDER & LEAD EDUCATOR')}
            </span>
            <h2 className="text-3xl font-extrabold font-heading text-navy-900">Rohit Choudhary</h2>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {t('10+ Years Teaching Experience • Author of Brahmastra Book Series')}
            </p>

            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              {t('Rohit Sir founded Apni Padhai with a vision to eliminate the financial hardship faced by rural and middle-class students preparing for government officer posts. By creating simplified, visual Brahmastra study guides and affordable online classes, Apni Padhai has guided over 12,500+ successful rankers.')}
            </p>

            <div className="space-y-2 pt-2 text-xs sm:text-sm text-slate-700">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>{t('Pioneered visual trick methods for Rajasthan Art & Culture')}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>{t('Mentored Rank 1, 4 & 12 in Rajasthan Competitive Exams')}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>{t('Over 100 Million views across educational YouTube lectures')}</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 pt-4">
              <a
                href="https://www.youtube.com/@AapniPadhai"
                target="_blank"
                rel="noreferrer"
                className="px-5 py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-button-glow transition-all"
              >
                <FaYoutube className="w-4 h-4" />
                <span>{t('YouTube Channel')}</span>
              </a>
              <a
                href="https://t.me/Aapni_Padhai"
                target="_blank"
                rel="noreferrer"
                className="px-5 py-3 bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-button-glow transition-all"
              >
                <Send className="w-4 h-4" />
                <span>{t('Telegram Community')}</span>
              </a>
            </div>
          </div>
        </div>

        {/* Trusted Numbers */}
        <TrustSection />

        {/* Core Values */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-card text-center space-y-3">
            <div className="w-12 h-12 bg-brand-50 text-brand-600 rounded-2xl flex items-center justify-center mx-auto">
              <Target className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold font-heading text-navy-900">{t('Our Mission')}</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              {t('To provide affordable, top-tier exam preparation content, e-books, and live coaching to every student in India regardless of location.')}
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-card text-center space-y-3">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold font-heading text-navy-900">{t('Quality & Authenticity')}</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              {t('Every book and mock paper is rigorously reviewed by former bureaucrats and subject experts for 100% accuracy.')}
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-card text-center space-y-3">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto">
              <Heart className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold font-heading text-navy-900">{t('Student First Pedagogy')}</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              {t('Dedicated doubt resolution, personalized counseling, and continuous support through your exam lifecycle.')}
            </p>
          </div>
        </div>

        {/* Why Over 100,000 Aspirants Choose Us */}
        <FeaturesSection />

        {/* Our Learning Community */}
        <CommunitySection />

        {/* Final CTA Banner */}
        <section className="py-12 bg-navy-950 text-white text-center relative overflow-hidden border-t border-amber-500/20 rounded-3xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-400/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-4xl mx-auto px-4 relative z-10 space-y-6">
            <h2 className="text-3xl sm:text-5xl font-black font-heading tracking-tight leading-tight text-white">
              {t('Start Your Success Journey With Apni Padhai Today')}
            </h2>

            <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto">
              {t("Join 1,000,000+ students preparing with India's smart learning platform. Get instant access to online classes & Brahmastra books.")}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <Link
                href="/books"
                className="px-8 py-4 bg-yellow-400 hover:bg-yellow-500 text-navy-950 font-black text-sm sm:text-base rounded-2xl shadow-button-glow transition-all flex items-center gap-2 transform hover:-translate-y-1"
              >
                <span>{t('Explore All Books')}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <a
                href="https://play.google.com/store/search?q=apni+padhai&c=apps"
                target="_blank"
                rel="noreferrer"
                className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-bold text-sm sm:text-base rounded-2xl border border-white/20 transition-all flex items-center gap-2 transform hover:-translate-y-1"
              >
                <Download className="w-4 h-4 text-yellow-400" />
                <span>{t('Install App')}</span>
              </a>
            </div>
          </div>
        </section>

        {/* Previous Year Question Papers */}
        <PyqQuickSection />

      </div>
    </div>
  );
}
