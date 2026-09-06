'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  UserCheck,
  BookCheck,
  HelpCircle,
  Smartphone,
  CheckCircle,
  TrendingUp,
  FileCheck2,
  Tv,
  DollarSign,
  Award,
  BarChart2,
  Clock,
} from 'lucide-react';
import { useTranslation } from '@/i18n/useTranslation';

export const FeaturesSection: React.FC = () => {
  const { t } = useTranslation();
  const features = [
    {
      title: 'Expert Subject Teachers',
      desc: 'Learn directly from Rohit Sir and veteran educators with 10+ years of proven selection record.',
      icon: <UserCheck className="w-6 h-6 text-brand-500" />,
      color: 'border-brand-100 bg-brand-50/50',
    },
    {
      title: 'Updated Study Material',
      desc: 'Brahmastra e-books & printed note books designed strictly as per latest exam patterns & new district maps.',
      icon: <BookCheck className="w-6 h-6 text-blue-500" />,
      color: 'border-blue-100 bg-blue-50/50',
    },
    {
      title: 'Previous Year Papers (PYQs)',
      desc: 'Topic-wise solved 15+ year question banks with step-by-step detailed explanations.',
      icon: <FileCheck2 className="w-6 h-6 text-purple-500" />,
      color: 'border-purple-100 bg-purple-50/50',
    },
    {
      title: 'Affordable Courses',
      desc: 'Top quality coaching made accessible to every student without financial barriers.',
      icon: <DollarSign className="w-6 h-6 text-emerald-500" />,
      color: 'border-emerald-100 bg-emerald-50/50',
    },
    {
      title: 'Mobile App Learning',
      desc: 'Watch classes anywhere, download video lectures offline, and study on mobile/tablet.',
      icon: <Smartphone className="w-6 h-6 text-amber-500" />,
      color: 'border-amber-100 bg-amber-50/50',
    },
    {
      title: 'Live Interactive Classes',
      desc: 'Engage with educators in real-time chat, resolve doubts live.',
      icon: <Tv className="w-6 h-6 text-rose-500" />,
      color: 'border-rose-100 bg-rose-50/50',
    },
    {
      title: 'Doubt Resolution Support',
      desc: 'Dedicated doubt forums and on request live doubt clearing sessions for student.',
      icon: <HelpCircle className="w-6 h-6 text-indigo-500" />,
      color: 'border-indigo-100 bg-indigo-50/50',
    },
    {
      title: 'Performance Analytics',
      desc: 'All-India rank analysis, accuracy tracking.',
      icon: <BarChart2 className="w-6 h-6 text-teal-500" />,
      color: 'border-teal-100 bg-teal-50/50',
    },
    {
      title: 'Full Length Practice Tests',
      desc: 'Exam-like mock test series with OMR timer practice for real exam pressure training.',
      icon: <CheckCircle className="w-6 h-6 text-green-500" />,
      color: 'border-green-100 bg-green-50/50',
    },
    {
      title: 'Progress Tracking',
      desc: 'Monitor syllabus completion percentage, attendance stats, and test score growth graphs.',
      icon: <TrendingUp className="w-6 h-6 text-sky-500" />,
      color: 'border-sky-100 bg-sky-50/50',
    },
    {
      title: '12 Months Access Validity',
      desc: 'Unlimited lecture replay access with validities lasting through the exam dates.',
      icon: <Clock className="w-6 h-6 text-cyan-500" />,
      color: 'border-cyan-100 bg-cyan-50/50',
    },
  ];

  return (
    <section className="py-12 bg-slate-50 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-8">
          <span className="text-xs font-bold text-brand-600 uppercase tracking-widest bg-brand-100/80 px-3.5 py-1.5 rounded-full">
            {t('WHY APNI PADHAI')}
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold font-heading text-navy-900 mt-3">
            {t('Why Over 100,000 Aspirants Choose Us')}
          </h2>
          <p className="text-slate-600 text-sm sm:text-base mt-2">
            {t('Built with modern technology, student-centric pedagogy, and affordable pricing to guarantee your exam success.')}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {features.map((feat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.04 }}
              whileHover={{ y: -6 }}
              className={`p-6 rounded-3xl bg-white border ${feat.color} shadow-card hover:shadow-card-hover transition-all group`}
            >
              <div className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                {feat.icon}
              </div>
              <h3 className="text-base font-bold font-heading text-navy-900 group-hover:text-brand-600 transition-colors mb-1.5">
                {t(feat.title)}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">{t(feat.desc)}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
