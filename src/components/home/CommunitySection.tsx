'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Youtube, Send, Instagram, ArrowRight, Users } from 'lucide-react';
import Link from 'next/link';
import { useTranslation } from '@/i18n/useTranslation';

export const CommunitySection: React.FC = () => {
  const { t } = useTranslation();
  const communityCards = [
    {
      id: 'youtube',
      name: 'Apni Padhai YouTube',
      count: '600K+ Subscribers',
      icon: <Youtube className="w-10 h-10 text-red-600" />,
      bgGradient: 'from-red-50 to-amber-50/50 hover:border-red-300',
      badge: 'FREE LECTURES & TRICKS',
      href: 'https://www.youtube.com/@AapniPadhai',
      btnText: 'Subscribe on YouTube',
    },
    {
      id: 'telegram',
      name: 'Apni Padhai Telegram',
      count: '200K+ Followers',
      icon: <Send className="w-10 h-10 text-sky-600" />,
      bgGradient: 'from-sky-50 to-amber-50/50 hover:border-sky-300',
      badge: 'DAILY PDF & EXAM ALERTS',
      href: 'https://t.me/Aapni_Padhai',
      btnText: 'Join Telegram Channel',
    },
    {
      id: 'instagram',
      name: 'Apni Padhai Instagram',
      count: '150K+ Community',
      icon: <Instagram className="w-10 h-10 text-pink-600" />,
      bgGradient: 'from-pink-50 to-amber-50/50 hover:border-pink-300',
      badge: 'CURRENT AFFAIRS REELS',
      href: 'https://www.instagram.com/apnipadhai_official/',
      btnText: 'Follow on Instagram',
    },
  ];

  return (
    <section className="py-20 bg-white relative overflow-hidden border-t border-slate-100">
      {/* Background Radial Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-yellow-100/40 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-10">
        
        {/* Section Header */}
        <div className="max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-black text-amber-800 uppercase tracking-widest bg-yellow-100 px-3.5 py-1.5 rounded-full border border-yellow-300">
            {t('OUR LEARNING COMMUNITY')}
          </span>

          <h2 className="text-3xl sm:text-5xl font-black font-heading text-navy-900 tracking-tight">
            {t('Join The Apni Padhai Family, Today!')}
          </h2>

          <p className="text-slate-600 text-sm sm:text-base max-w-2xl mx-auto font-medium">
            {t('Explore our YouTube channels, Telegram community, and social handles to get access to free live lectures, daily PYQ PDFs, and exam updates.')}
          </p>
        </div>

        {/* Community Cards Grid (Matching Reference Image Style) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {communityCards.map((card) => (
            <motion.a
              key={card.id}
              href={card.href}
              target="_blank"
              rel="noreferrer"
              whileHover={{ y: -8 }}
              className={`p-8 rounded-3xl bg-gradient-to-b ${card.bgGradient} border-2 border-slate-100 shadow-card hover:shadow-card-hover transition-all flex flex-col items-center justify-between text-center group relative overflow-hidden`}
            >
              <div className="space-y-4 w-full">
                <span className="inline-block px-3 py-1 bg-white text-navy-900 text-[10px] font-black uppercase rounded-full shadow-sm border border-slate-200/80">
                  {t(card.badge)}
                </span>

                {/* Channel Icon Frame */}
                <div className="w-20 h-20 bg-white rounded-3xl shadow-md border border-slate-100 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
                  {card.icon}
                </div>

                {/* Channel Name & Metrics */}
                <div className="space-y-1">
                  <h3 className="text-xl font-bold font-heading text-navy-900 group-hover:text-amber-700 transition-colors">
                    {t(card.name)}
                  </h3>
                  <p className="text-base font-extrabold font-heading text-navy-950">
                    {t(card.count)}
                  </p>
                </div>
              </div>

              {/* Action Link */}
              <div className="pt-6 mt-4 w-full border-t border-slate-200/60">
                <span className="inline-flex items-center gap-1.5 text-xs font-black text-navy-900 group-hover:text-amber-800 transition-colors">
                  <span>{t(card.btnText)}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </motion.a>
          ))}
        </div>

        {/* Bottom Main CTA Button (Matching Reference Image Style) */}
        <div className="pt-4">
          <Link
            href="/books"
            className="inline-flex max-w-full items-center justify-center gap-2 px-5 sm:px-8 py-3.5 sm:py-4 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-yellow-400 hover:to-amber-500 text-navy-950 font-black text-sm sm:text-base rounded-2xl shadow-button-glow transition-all transform hover:-translate-y-1 whitespace-normal text-center"
          >
            <Users className="w-5 h-5" />
            <span>{t('Get Started with Apni Padhai')}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </section>
  );
};
