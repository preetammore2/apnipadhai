'use client';

import React from 'react';
import Image from 'next/image';
import { Smartphone, Download, QrCode, CheckCircle2, Star, ShieldCheck, Play } from 'lucide-react';

export default function DownloadAppPage() {
  return (
    <div className="py-16 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Hero App Promo */}
        <div className="bg-gradient-to-br from-navy-900 via-brand-900 to-navy-900 text-white rounded-3xl p-8 sm:p-12 border border-white/10 shadow-2xl grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7 space-y-6">
            <span className="px-3.5 py-1 bg-amber-400/20 text-amber-300 text-xs font-bold rounded-full border border-amber-400/30">
              OFFICIAL ANDROID APP
            </span>
            <h1 className="text-3xl sm:text-5xl font-black font-heading leading-tight">
              Study Anywhere, Anytime With Apni Padhai App
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-lg">
              Download lectures offline, attempt live all-India test series, read Brahmastra e-books, and clear doubts with expert teachers.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <a
                href="https://play.google.com/store/search?q=apni+padhai&c=apps"
                target="_blank"
                rel="noreferrer"
                className="px-6 py-4 bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm rounded-2xl shadow-button-glow transition-all flex items-center gap-3"
              >
                <Smartphone className="w-5 h-5" />
                <span>Install From Google Play Store</span>
              </a>
            </div>
          </div>

          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-72 h-[480px] rounded-3xl overflow-hidden shadow-2xl border-4 border-white/20">
              <Image
                src="/images/app_ui.png"
                alt="Apni Padhai App Mobile Screenshots"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>

        {/* Feature List */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-card text-center space-y-3">
            <Download className="w-8 h-8 text-brand-500 mx-auto" />
            <h3 className="text-lg font-bold font-heading text-navy-900">Offline Video Downloads</h3>
            <p className="text-xs text-slate-500 leading-relaxed">Save mobile data by downloading HD lecture videos to watch offline without internet.</p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-card text-center space-y-3">
            <Star className="w-8 h-8 text-amber-500 mx-auto" />
            <h3 className="text-lg font-bold font-heading text-navy-900">Live Mock Test Series</h3>
            <p className="text-xs text-slate-500 leading-relaxed">Simulate real exam timer environment with instant All-India rank & percentile evaluation.</p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-card text-center space-y-3">
            <ShieldCheck className="w-8 h-8 text-emerald-500 mx-auto" />
            <h3 className="text-lg font-bold font-heading text-navy-900">Complimentary E-Books</h3>
            <p className="text-xs text-slate-500 leading-relaxed">Read Brahmastra study guides and daily current affairs PDFs directly on the app built-in reader.</p>
          </div>
        </div>

      </div>
    </div>
  );
}
