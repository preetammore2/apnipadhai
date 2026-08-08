'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ChevronDown, HelpCircle, ArrowRight, MessageCircleQuestion, Truck, BookOpen, GraduationCap, Wallet, Smartphone } from 'lucide-react';
import { useTranslation } from '@/i18n/useTranslation';
import { FAQ_DATA, FAQ_CATEGORIES } from '@/data/faq';

const CATEGORY_ICONS: Record<string, { icon: React.ElementType; color: string }> = {
  'Orders & Delivery': { icon: Truck, color: 'bg-blue-50 text-blue-600' },
  'Books': { icon: BookOpen, color: 'bg-amber-50 text-amber-600' },
  'Courses & Test Series': { icon: GraduationCap, color: 'bg-emerald-50 text-emerald-600' },
  'Payments & Refunds': { icon: Wallet, color: 'bg-purple-50 text-purple-600' },
  'Account & App': { icon: Smartphone, color: 'bg-rose-50 text-rose-600' },
};

export default function FaqPage() {
  const { t } = useTranslation();
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [openId, setOpenId] = useState<string | null>(FAQ_DATA[0]?.id ?? null);

  const filtered =
    activeCategory === 'All'
      ? FAQ_DATA
      : FAQ_DATA.filter((faq) => faq.category === activeCategory);

  return (
    <div className="py-12 bg-slate-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">

        {/* Banner */}
        <div className="text-center max-w-3xl mx-auto">
          <span className="text-xs font-bold text-brand-600 uppercase tracking-widest bg-brand-100/80 px-3.5 py-1.5 rounded-full inline-flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5" /> {t('STUDENT FAQS')}
          </span>
          <h1 className="text-3xl sm:text-5xl font-black font-heading text-navy-900 mt-3">
            {t('Frequently Asked Questions')}
          </h1>
          <p className="text-slate-600 text-sm sm:text-base mt-2">
            {t('Everything you need to know about Apni Padhai books, courses, orders, and payments.')}
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap justify-center gap-2">
          {['All', ...FAQ_CATEGORIES].map((category) => {
            const isActive = activeCategory === category;
            const count =
              category === 'All'
                ? FAQ_DATA.length
                : FAQ_DATA.filter((faq) => faq.category === category).length;
            return (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all border ${
                  isActive
                    ? 'bg-navy-900 text-white border-navy-900 shadow-md'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-amber-300 hover:text-amber-800'
                }`}
              >
                {t(category)}
                <span
                  className={`ml-1.5 text-[10px] font-black rounded-full px-1.5 py-0.5 ${
                    isActive ? 'bg-yellow-400 text-navy-950' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Accordion */}
        <div className="space-y-3">
          {filtered.map((faq, idx) => {
            const isOpen = openId === faq.id;
            const meta = CATEGORY_ICONS[faq.category] ?? CATEGORY_ICONS['Orders & Delivery'];
            const Icon = meta.icon;
            return (
              <motion.div
                key={faq.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: idx * 0.04 }}
                className={`border rounded-2xl transition-all ${
                  isOpen
                    ? 'border-amber-300 bg-amber-50/40 shadow-card'
                    : 'border-slate-200 bg-white hover:border-amber-200'
                }`}
              >
                <button
                  onClick={() => setOpenId(isOpen ? null : faq.id)}
                  className="w-full flex items-center gap-3 p-5 text-left"
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${meta.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="flex-1 text-sm font-bold font-heading text-navy-900 leading-snug">
                    {t(faq.question)}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-slate-400 transition-transform shrink-0 ${
                      isOpen ? 'rotate-180 text-amber-600' : ''
                    }`}
                  />
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: 'easeOut' }}
                      className="overflow-hidden"
                    >
                      <p className="px-5 pb-5 pl-[4.5rem] text-xs sm:text-sm text-slate-600 leading-relaxed">
                        {t(faq.answer)}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        {/* Still have questions */}
        <div className="bg-gradient-to-r from-amber-400 to-yellow-400 rounded-3xl p-8 sm:p-10 text-center shadow-button-glow">
          <h2 className="text-xl sm:text-2xl font-extrabold font-heading text-navy-950">
            {t('Still have questions?')}
          </h2>
          <p className="text-sm text-navy-800/80 mt-2 max-w-lg mx-auto">
            {t('Our counselors are happy to help with any query about books, courses, or orders.')}
          </p>
          <div className="flex flex-wrap justify-center gap-3 mt-6">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 bg-navy-950 text-white text-xs font-black rounded-xl transition-all hover:-translate-y-0.5 active:scale-[0.97]"
            >
              <MessageCircleQuestion className="w-4 h-4 text-yellow-400" />
              <span>{t('Contact Support')}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/track-order"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-navy-950 text-xs font-black rounded-xl transition-all hover:-translate-y-0.5 active:scale-[0.97]"
            >
              <span>{t('Track Your Order')}</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
