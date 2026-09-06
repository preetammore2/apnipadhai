'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ChevronDown, HelpCircle, ArrowRight, MessageCircleQuestion, Truck, BookOpen, GraduationCap, Wallet, Smartphone } from 'lucide-react';
import { useTranslation } from '@/i18n/useTranslation';
import { FAQ_DATA, FAQ_CATEGORIES } from '@/data/faq';
import { useSiteContent } from '@/lib/use-site-content';

const CATEGORY_ICONS: Record<string, { icon: React.ElementType; color: string }> = {
  'Orders & Delivery': { icon: Truck, color: 'bg-blue-50 text-blue-600' },
  'Books': { icon: BookOpen, color: 'bg-amber-50 text-amber-600' },
  'Courses & Test Series': { icon: GraduationCap, color: 'bg-emerald-50 text-emerald-600' },
  'Payments & Refunds': { icon: Wallet, color: 'bg-purple-50 text-purple-600' },
  'Account & App': { icon: Smartphone, color: 'bg-rose-50 text-rose-600' },
};

export const FaqSection: React.FC = () => {
  const { t } = useTranslation();
  const content = useSiteContent();
  const faqs = content?.faqs?.length ? content.faqs : FAQ_DATA;
  const categories = content?.faqs?.length
    ? ['All', ...Array.from(new Set(content.faqs.map((faq) => faq.category)))]
    : ['All', ...FAQ_CATEGORIES];
  const INITIAL_VISIBLE = 2;
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [openId, setOpenId] = useState<string | null>(faqs[0]?.id ?? null);

  const filtered =
    activeCategory === 'All'
      ? faqs
      : faqs.filter((faq) => faq.category === activeCategory);

  const visibleFaqs = filtered.slice(0, INITIAL_VISIBLE);

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
    setOpenId(null);
  };

  return (
    <section className="py-12 bg-white relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-yellow-200/20 rounded-full blur-3xl pointer-events-none" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="text-xs font-black text-amber-800 uppercase tracking-widest bg-yellow-100 px-3.5 py-1.5 rounded-full border border-yellow-300 inline-flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5" /> {t('STUDENT FAQS')}
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold font-heading text-navy-900 mt-3">
            {t('Frequently Asked Questions')}
          </h2>
          <p className="text-slate-600 text-sm sm:text-base mt-2">
            {t('Quick answers about books, orders, courses, payments, and the Apni Padhai app.')}
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {categories.map((category) => {
            const isActive = activeCategory === category;
            return (
              <button
                key={category}
                onClick={() => handleCategoryChange(category)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all border ${
                  isActive
                    ? 'bg-navy-900 text-white border-navy-900 shadow-md'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-amber-300 hover:text-amber-800'
                }`}
              >
                {t(category)}
              </button>
            );
          })}
        </div>

        {/* Accordion */}
        <div className="max-w-3xl mx-auto space-y-3">
          {visibleFaqs.map((faq, idx) => {
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

        {/* CTA */}
        <div className="mt-10 text-center">
          <Link
            href="/faq"
            className="group inline-flex items-center gap-2 px-8 py-3.5 bg-navy-900 hover:bg-brand-600 text-white text-sm font-black rounded-xl shadow-sm transition-all hover:-translate-y-0.5 active:scale-[0.97]"
          >
            <MessageCircleQuestion className="w-4 h-4 text-yellow-400" />
            <span>{t('View All FAQs')}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
};
