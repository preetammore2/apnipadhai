'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  MapPin,
  Phone,
  Mail,
  Youtube,
  Instagram,
  Send,
  Facebook,
  ArrowUp,
  ShieldCheck,
} from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from '@/i18n/useTranslation';

export const Footer: React.FC = () => {
  const { t } = useTranslation();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success(t('Subscribed successfully! You will receive daily exam updates & study material.'));
  };

  return (
    <footer className="bg-gradient-to-b from-[#713F12] via-[#451A03] to-[#0F172A] text-white pt-16 pb-24 sm:pb-8 relative overflow-hidden">
      {/* Background Subtle Mesh */}
      <div className="absolute inset-0 opacity-10 bg-grid-pattern pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-white/10">
          {/* Column 1: Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative w-12 h-12 bg-white rounded-2xl overflow-hidden shadow-lg p-1">
                <Image
                  src="/logo.png"
                  alt="Apni Padhai Publication Logo"
                  fill
                  className="object-cover rounded-xl"
                />
              </div>
              <div>
                <span className="font-heading font-extrabold text-2xl text-white tracking-tight">
                  Apni <span className="text-yellow-400">Padhai</span>
                </span>
                <p className="text-xs text-yellow-200 font-medium">{t("India's Smart Learning Platform")}</p>
              </div>
            </div>

            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-sm">
              {t('Empowering students across India with affordable high-quality live courses, bestselling Brahmastra books, updated previous year question papers, and expert mentorship.')}
            </p>

            {/* Address & Direct Contact */}
            <div className="space-y-2.5 pt-2 text-xs text-slate-300">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
                <span>House No.214, Ward No.20, Balla Niwas, Chittor Road, Behind Dangi Factory, Azad Nagar, Bhilwara, Rajasthan 311001</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-yellow-400 shrink-0" />
                <a href="tel:+917568716768" className="hover:text-white transition-colors font-bold">
                  +91 7568716768
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-yellow-400 shrink-0" />
                <a href="mailto:support@apnipadhaipublication.com" className="hover:text-white transition-colors">
                  support@apnipadhaipublication.com
                </a>
              </div>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="text-sm font-bold font-heading uppercase tracking-wider text-yellow-400 mb-4">{t('Explore Platform')}</h4>
            <ul className="space-y-2.5 text-xs text-slate-300">
              <li>
                <Link href="/about" className="hover:text-yellow-400 transition-colors flex items-center gap-2">
                  <span>›</span> {t('About Us')}
                </Link>
              </li>
              <li>
                <Link href="/careers" className="hover:text-yellow-400 transition-colors flex items-center gap-2">
                  <span>›</span> {t('Careers')}
                </Link>
              </li>
              <li>
                <Link href="/#courses" className="hover:text-yellow-400 transition-colors flex items-center gap-2">
                  <span>›</span> {t('Courses')}
                </Link>
              </li>
              <li>
                <Link href="/books" className="hover:text-yellow-400 transition-colors flex items-center gap-2">
                  <span>›</span> {t('Brahmastra Books Store')}
                </Link>
              </li>
              <li>
                <Link href="/pyqs" className="hover:text-yellow-400 transition-colors flex items-center gap-2">
                  <span>›</span> {t('Previous Years Papers (PYQs)')}
                </Link>
              </li>
              <li>
                <Link href="/results" className="hover:text-yellow-400 transition-colors flex items-center gap-2">
                  <span>›</span> {t('Selections & Top Rankers')}
                </Link>
              </li>
              <li>
                <Link href="/download-app" className="hover:text-yellow-400 transition-colors flex items-center gap-2">
                  <span>›</span> {t('Download Android App')}
                </Link>
              </li>
              <li>
                <Link href="/updates" className="hover:text-yellow-400 transition-colors flex items-center gap-2">
                  <span>›</span> {t('Blog & Latest Updates')}
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-yellow-400 transition-colors flex items-center gap-2">
                  <span>›</span> {t('FAQs')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Legal & Student Help */}
          <div>
            <h4 className="text-sm font-bold font-heading uppercase tracking-wider text-yellow-400 mb-4">{t('Policies & Support')}</h4>
            <ul className="space-y-2.5 text-xs text-slate-300">
              <li>
                <Link href="/contact" className="hover:text-yellow-400 transition-colors flex items-center gap-2">
                  <span>›</span> {t('Contact & Help Center')}
                </Link>
              </li>
              <li>
                <Link href="/track-order" className="hover:text-yellow-400 transition-colors flex items-center gap-2">
                  <span>›</span> {t('Track Your Order')}
                </Link>
              </li>
              <li>
                <Link href="/shipping-policy" className="hover:text-yellow-400 transition-colors flex items-center gap-2">
                  <span>›</span> {t('Shipping & Delivery Policy')}
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="hover:text-yellow-400 transition-colors flex items-center gap-2">
                  <span>›</span> {t('Privacy Policy')}
                </Link>
              </li>
              <li>
                <Link href="/terms-conditions" className="hover:text-yellow-400 transition-colors flex items-center gap-2">
                  <span>›</span> {t('Terms & Conditions')}
                </Link>
              </li>
              <li>
                <Link href="/refund-policy" className="hover:text-yellow-400 transition-colors flex items-center gap-2">
                  <span>›</span> {t('Return & Refund Policy')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Newsletter & Social */}
          <div>
            <h4 className="text-sm font-bold font-heading uppercase tracking-wider text-yellow-400 mb-4">{t('Connect With Us')}</h4>
            <p className="text-xs text-slate-300 mb-3">
              {t('Subscribe to get free test series PDFs, syllabus notes & exam alerts.')}
            </p>

            <form onSubmit={handleSubscribe} className="space-y-2 mb-5">
              <input
                type="email"
                required
                placeholder={t('Enter your email address')}
                className="w-full px-3.5 py-2.5 bg-white/10 border border-white/20 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-yellow-400 transition-colors"
              />
              <button
                type="submit"
                className="w-full py-2.5 bg-yellow-500 hover:bg-yellow-600 text-navy-900 font-extrabold text-xs rounded-xl shadow-button-glow transition-all"
              >
                {t('Subscribe Free')}
              </button>
            </form>

            {/* Social Media Links */}
            <div className="flex items-center gap-2">
              <a
                href="https://www.youtube.com/@AapniPadhai"
                target="_blank"
                rel="noreferrer"
                className="p-2.5 bg-white/10 hover:bg-red-600 rounded-xl text-white transition-colors"
                title="YouTube Channel"
              >
                <Youtube className="w-4 h-4" />
              </a>
              <a
                href="https://t.me/Aapni_Padhai"
                target="_blank"
                rel="noreferrer"
                className="p-2.5 bg-white/10 hover:bg-sky-500 rounded-xl text-white transition-colors"
                title="Telegram Group"
              >
                <Send className="w-4 h-4" />
              </a>
              <a
                href="https://www.instagram.com/apnipadhai_official/"
                target="_blank"
                rel="noreferrer"
                className="p-2.5 bg-white/10 hover:bg-pink-600 rounded-xl text-white transition-colors"
                title="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://www.facebook.com/apnipadhaipublication"
                target="_blank"
                rel="noreferrer"
                className="p-2.5 bg-white/10 hover:bg-blue-600 rounded-xl text-white transition-colors"
                title="Facebook Page"
              >
                <Facebook className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Copyright Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} Apni Padhai Publication. {t('All Rights Reserved.')}</p>

          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <ShieldCheck className="w-4 h-4" /> {t('100% Verified EdTech Platform')}
            </span>
            <button
              onClick={scrollToTop}
              className="flex items-center gap-1 text-white hover:text-yellow-400 font-bold transition-colors"
            >
              <span>{t('Back to top')}</span>
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
