'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Quote, Youtube, CheckCircle2, ArrowRight } from 'lucide-react';
import { useTranslation } from '@/i18n/useTranslation';

export const FounderSpotlight: React.FC = () => {
  const { t } = useTranslation();
  return (
    <section className="py-24 bg-hero-dark text-white relative overflow-hidden border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-14 items-center">

          {/* Founder Photo */}
          <div className="lg:col-span-5">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="relative mx-auto max-w-md"
            >
              <div className="relative h-[440px] w-full rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                <Image
                  src="/images/rohit sir QHD Photo.png"
                  alt={t('Rohit Choudhary Founder Apni Padhai')}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy-950/90 via-transparent to-transparent" />

                <div className="absolute bottom-5 left-5 right-5">
                  <span className="px-3 py-1 bg-brand-400 text-navy-950 text-[10px] font-black uppercase rounded-full tracking-wider">
                    {t('FOUNDER & LEAD EDUCATOR')}
                  </span>
                  <h3 className="text-2xl font-black font-heading text-white mt-2">Rohit Choudhary</h3>

                  <p className="text-xs text-slate-300 font-medium">{t('Author of Bestselling Brahmastra Book Series')}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 mt-5">
                <div className="bg-white/[0.04] border border-white/10 rounded-xl p-3 text-center">
                  <p className="text-xl font-black font-heading text-brand-300">10+</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">{t('Years Experience')}</p>
                </div>
                <div className="bg-white/[0.04] border border-white/10 rounded-xl p-3 text-center">
                  <p className="text-xl font-black font-heading text-brand-300">12,500+</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">{t('Selections Guided')}</p>
                </div>
                <div className="bg-white/[0.04] border border-white/10 rounded-xl p-3 text-center">
                  <p className="text-xl font-black font-heading text-brand-300">50M+</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">{t('Lecture Views')}</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Founder Bio & Message */}
          <div className="lg:col-span-7 space-y-6">
            <span className="inline-flex items-center gap-2 text-xs font-bold text-brand-300 uppercase tracking-widest bg-white/[0.04] px-3.5 py-1.5 rounded-full border border-brand-400/20">
              {t("FOUNDER'S VISION")}
            </span>

            <h2 className="text-3xl sm:text-4xl font-extrabold font-heading text-white leading-tight">
              {t('"Education Should Not Be a Luxury. Every Aspirant Deserves Premium Guidance."')}
            </h2>

            <div className="relative pl-6 border-l border-brand-400/40 space-y-3">
              <Quote className="w-7 h-7 text-brand-400/30 absolute -top-2 -left-3" />
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                {t('Apni Padhai was established with a singular mission: to eliminate the high barrier of expensive Kota & Jaipur coaching institutes. We bring exam-oriented teaching, high-yield Brahmastra study books, and direct mentor support straight to your mobile screen.')}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{t('Simplifying Rajasthan History & Art-Culture')}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{t('Author of Bestselling General Science Guide')}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{t('50M+ Views across Educational Lectures')}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{t('Dedicated Live Doubt Sessions')}</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 pt-4">
              <Link
                href="/about"
                className="group inline-flex items-center gap-2 px-6 py-3.5 bg-gradient-to-b from-brand-400 to-brand-600 text-navy-950 font-bold text-xs rounded-xl shadow-[0_8px_30px_-6px_rgba(234,179,8,0.55)] transition-all duration-300 hover:shadow-[0_14px_40px_-6px_rgba(234,179,8,0.7)] hover:-translate-y-0.5"
              >
                <span>{t('Read Full Founder Story')}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>

              <a
                href="https://www.youtube.com/@AapniPadhai"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-white/[0.06] hover:bg-white/[0.12] text-white font-semibold text-xs rounded-xl border border-white/15 transition-all duration-300 hover:border-white/25"
              >
                <Youtube className="w-4 h-4 text-red-500" />
                <span>{t('Watch Free Lectures on YouTube')}</span>
              </a>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
