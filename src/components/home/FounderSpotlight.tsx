'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Quote, Award, Youtube, CheckCircle2, ArrowRight } from 'lucide-react';
import { useTranslation } from '@/i18n/useTranslation';

export const FounderSpotlight: React.FC = () => {
  const { t } = useTranslation();
  return (
    <section className="py-20 bg-gradient-to-br from-navy-950 via-navy-900 to-navy-950 text-white relative overflow-hidden border-y border-amber-500/20">
      {/* Background Shapes */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-yellow-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Founder Photo */}
          <div className="lg:col-span-5 relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative mx-auto max-w-md"
            >
              <div className="relative h-[430px] w-full rounded-3xl overflow-hidden border-2 border-yellow-400/40 shadow-2xl">
                <Image
                  src="/images/rohit sir QHD Photo.png"
                  alt={t('Rohit Sir Founder Apni Padhai')}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-transparent to-transparent opacity-85" />
                
                <div className="absolute bottom-6 left-6 right-6">
                  <span className="px-3 py-1 bg-yellow-400 text-navy-950 text-[10px] font-black uppercase rounded-full tracking-wider shadow-sm">
                    {t('FOUNDER & LEAD EDUCATOR')}
                  </span>
                  <h3 className="text-2xl font-black font-heading text-white mt-1">Rohit Sir (Gurjar)</h3>
                  <p className="text-xs text-yellow-200 font-medium">{t('Author of Bestselling Brahmastra Book Series')}</p>
                </div>
              </div>

              {/* Floating Achievement Badge */}
              <div className="absolute -bottom-5 -right-5 bg-white text-navy-900 p-4 rounded-2xl shadow-2xl flex items-center gap-3 hidden sm:flex border border-yellow-300">
                <div className="p-2.5 bg-yellow-100 text-amber-800 rounded-xl">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-black text-navy-900">{t('10+ Years Experience')}</p>
                  <p className="text-[10px] font-bold text-slate-500">12,500+ {t('Selections Guided')}</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Founder Bio & Message */}
          <div className="lg:col-span-7 space-y-6">
            <span className="text-xs font-bold text-yellow-300 uppercase tracking-widest bg-yellow-400/10 px-3.5 py-1.5 rounded-full border border-yellow-400/20">
              {t("FOUNDER'S VISION")}
            </span>

            <h2 className="text-3xl sm:text-4xl font-extrabold font-heading text-white leading-tight">
              {t('"Education Should Not Be a Luxury. Every Aspirant Deserves Premium Guidance."')}
            </h2>

            <div className="relative pl-6 border-l-4 border-yellow-400 space-y-3">
              <Quote className="w-8 h-8 text-yellow-400/40 absolute -top-2 -left-4" />
              <p className="text-slate-200 text-sm sm:text-base leading-relaxed italic">
                {t('Apni Padhai was established with a singular mission: to eliminate the high barrier of expensive Kota & Jaipur coaching institutes. We bring exam-oriented teaching, high-yield Brahmastra study books, and direct mentor support straight to your mobile screen.')}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-yellow-400 shrink-0" />
                <span>{t('Simplifying Rajasthan History & Art-Culture')}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-yellow-400 shrink-0" />
                <span>{t('Author of Bestselling General Science Guide')}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-yellow-400 shrink-0" />
                <span>{t('50M+ Views across Educational Lectures')}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-yellow-400 shrink-0" />
                <span>{t('Dedicated Live Doubt Sessions')}</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 pt-4">
              <Link
                href="/about"
                className="px-6 py-3.5 bg-yellow-400 hover:bg-yellow-500 text-navy-950 font-black text-xs rounded-xl shadow-button-glow transition-all flex items-center gap-2"
              >
                <span>{t('Read Full Founder Story')}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <a
                href="https://www.youtube.com/@AapniPadhai"
                target="_blank"
                rel="noreferrer"
                className="px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl border border-white/20 transition-all flex items-center gap-2"
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
