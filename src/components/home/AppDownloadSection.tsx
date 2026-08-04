'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Download, Star, Smartphone, CheckCircle, QrCode } from 'lucide-react';

export const AppDownloadSection: React.FC = () => {
  return (
    <section className="py-20 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-navy-950 relative overflow-hidden shadow-2xl">
      {/* Mesh Overlay */}
      <div className="absolute inset-0 opacity-15 bg-grid-pattern pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Text & Badges */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <span className="text-xs font-black text-navy-950 uppercase tracking-widest bg-white/40 px-3.5 py-1.5 rounded-full border border-navy-950/20">
              LEARN ON THE GO
            </span>

            <h2 className="text-3xl sm:text-5xl font-black font-heading leading-tight text-navy-950">
              Download The Apni Padhai Mobile App
            </h2>

            <p className="text-navy-900 text-sm sm:text-base font-medium leading-relaxed max-w-xl mx-auto lg:mx-0">
              Access offline video downloads, daily live test series, e-books PDF reader, and instant doubt chat support right on your smartphone.
            </p>

            {/* Features Checklist */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm font-bold text-navy-950 max-w-lg mx-auto lg:mx-0 pt-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4.5 h-4.5 text-navy-950 shrink-0" />
                <span>Offline Video Download Mode</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4.5 h-4.5 text-navy-950 shrink-0" />
                <span>Live Test Series with Rank</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4.5 h-4.5 text-navy-950 shrink-0" />
                <span>Free Daily Current Affairs PDF</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4.5 h-4.5 text-navy-950 shrink-0" />
                <span>24/7 Teacher Doubt Chat</span>
              </div>
            </div>

            {/* Store Buttons & Rating */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-4">
              <a
                href="https://play.google.com/store/search?q=apni+padhai&c=apps"
                target="_blank"
                rel="noreferrer"
                className="px-7 py-4 bg-navy-950 hover:bg-black text-white rounded-2xl text-xs font-black flex items-center gap-3 shadow-2xl transition-all transform hover:-translate-y-1"
              >
                <Smartphone className="w-6 h-6 text-yellow-400" />
                <div className="text-left">
                  <span className="block text-[10px] text-slate-300 uppercase font-medium">Install Now From</span>
                  <span className="text-sm font-black">Google Play Store</span>
                </div>
              </a>

              <div className="flex items-center gap-3 p-3 bg-white/40 rounded-2xl backdrop-blur-md border border-navy-950/20">
                <div className="p-2 bg-navy-950 text-yellow-400 rounded-xl">
                  <QrCode className="w-6 h-6" />
                </div>
                <div className="text-left text-xs">
                  <p className="font-extrabold text-navy-950">Scan QR Code</p>
                  <p className="text-[10px] font-bold text-navy-900">To Install Directly</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Visual Image */}
          <div className="lg:col-span-5 relative flex justify-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative w-72 sm:w-80 h-[500px] rounded-3xl overflow-hidden shadow-2xl border-4 border-white/60"
            >
              <Image
                src="/images/Frame 1165043252 (1).png"
                alt="Apni Padhai Mobile App Screens"
                fill
                className="object-cover"
              />
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
};
