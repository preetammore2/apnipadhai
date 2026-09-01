'use client';

import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { BOOK_HI } from '@/i18n/data';
import { useTranslation } from '@/i18n/useTranslation';
import { Star, ShoppingCart, ArrowRight, Truck, Loader2, RefreshCw, WifiOff, Search, BadgePercent } from 'lucide-react';
import { useGetBooksQuery } from '@/redux/api/bookApi';
import { useAppDispatch } from '@/redux/hooks';
import { addToCart } from '@/redux/features/cart/cartSlice';
import { toast } from 'sonner';

const BOOK_TABS = [
  'All books',
  'Apni Padhai',
  'General English',
  'Science Book',
  'Math Book',
  'Hindi Book',
  'Rajasthan Art & Culture',
  'Rajasthan Geography',
  'Rajasthan History',
  'Rajasthan Politics',
  'Rajasthan Computer',
  'Rajasthan Sample Papers',
  'Combo',
];

export const BooksSection: React.FC = () => {
  const { t, language } = useTranslation();
  const dispatch = useAppDispatch();
  const { data: books = [], isLoading, isError, refetch } = useGetBooksQuery();
  const [activeTab, setActiveTab] = useState('All books');

  const tabCounts = useMemo(() => {
    const counts = new Map<string, number>([['All books', books.length]]);
    for (const tab of BOOK_TABS) {
      if (tab === 'All books') continue;
      counts.set(
        tab,
        books.filter(
          (book) => book.categories?.includes(tab) ?? book.category === tab,
        ).length,
      );
    }
    return counts;
  }, [books]);

  const filteredBooks = useMemo(() => {
    if (activeTab === 'All books') return books;
    return books.filter(
      (book) => book.categories?.includes(activeTab) ?? book.category === activeTab,
    );
  }, [books, activeTab]);

  return (
    <section className="py-20 bg-slate-50/80 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6">
          <div>
            <span className="text-xs font-black text-amber-800 uppercase tracking-widest bg-yellow-100 px-3.5 py-1.5 rounded-full border border-yellow-300">
              {t('APNI PADHAI PUBLICATION')}
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold font-heading text-navy-900 mt-3">
              {t('On Apni Padhai Books')}
            </h2>
            <p className="text-slate-600 text-sm sm:text-base mt-2">
              {t('Authentic study guides, question banks, and model papers trusted by over 2.5 Lakh+ students.')}
            </p>
          </div>
        </div>

        {/* Category Tabs */}
        {!isLoading && !isError && books.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-2 mb-10 -mx-4 px-4 sm:mx-0 sm:px-0">
            {BOOK_TABS.map((tab) => {
              const count = tabCounts.get(tab) ?? 0;
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-bold transition-all border ${
                    isActive
                      ? 'bg-navy-900 text-white border-navy-900 shadow-md'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-amber-300 hover:text-amber-800'
                  }`}
                >
                  {t(tab)}
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
        )}

        {/* Loading Spinner */}
        {isLoading ? (
          <div className="py-16 text-center">
            <Loader2 className="w-8 h-8 text-amber-600 animate-spin mx-auto" />
            <p className="text-xs text-slate-500 mt-2">{t('Loading Publication Store via RTK Query...')}</p>
          </div>
        ) : isError ? (
          <div className="py-16 text-center">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <WifiOff className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold font-heading text-navy-900">{t('Failed to load books')}</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {t('Something went wrong while fetching the Brahmastra book series. Please try again.')}
            </p>
            <button
              onClick={() => refetch()}
              className="mt-5 px-6 py-3 bg-navy-900 hover:bg-brand-600 text-white text-xs font-bold rounded-xl transition-colors inline-flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>{t('Retry Now')}</span>
            </button>
          </div>
        ) : books.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-16 h-16 bg-yellow-100 text-amber-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold font-heading text-navy-900">{t('No books available right now')}</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {t('New editions of the Brahmastra series are being printed. Check back soon.')}
            </p>
            <Link
              href="/books"
              className="mt-5 px-6 py-3 bg-yellow-400 hover:bg-yellow-500 text-navy-950 text-xs font-black rounded-xl transition-all inline-flex items-center gap-2"
            >
              <span>{t('Browse All Books')}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : filteredBooks.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-16 h-16 bg-slate-100 text-slate-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold font-heading text-navy-900">{t('No books in this category yet')}</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {t('New editions in this category are being printed. Explore other categories instead.')}
            </p>
          </div>
        ) : (
          <>
          {/* Books Grid */}
          <div className="flex gap-4 sm:gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide">
            {filteredBooks.slice(0, 8).map((book) => {
              const hi = BOOK_HI[book.id];
              return (
              <motion.div
                key={book.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4 }}
                whileHover={{ y: -6 }}
                className="bg-white rounded-2xl border border-slate-200 hover:border-amber-300 shadow-card hover:shadow-card-hover transition-all overflow-hidden flex flex-col group snap-start shrink-0 w-[45%] sm:w-[30%] lg:w-auto lg:flex-1 lg:min-w-0"
              >
                <div className="relative">
                  <Link href={`/books/${book.id}`} className="relative block h-40 sm:h-52 bg-slate-50 overflow-hidden">
                    {book.coverImage ? (
                      <Image
                        src={book.coverImage}
                        alt={language === 'hi' ? hi?.title ?? book.title : book.title}
                        fill
                        className="object-contain p-3 group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <span className="absolute inset-0 flex items-center justify-center text-sm font-black text-slate-300 px-4 text-center">
                        {language === 'hi' ? hi?.title ?? book.title : book.title}
                      </span>
                    )}
                  </Link>
                  {book.discountPercentage > 0 && (
                    <span className="absolute top-2.5 left-2.5 z-10 px-2 py-1 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center gap-1">
                      <BadgePercent className="w-3 h-3" /> -{book.discountPercentage}% {t('OFF')}
                    </span>
                  )}
                </div>

                <div className="p-4 flex flex-col flex-grow">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{t(book.category)}</span>
                  <Link href={`/books/${book.id}`}>
                    <h3 className="text-sm font-bold font-heading text-navy-900 line-clamp-1 group-hover:text-amber-700 transition-colors mt-1">
                      {language === 'hi' ? hi?.title ?? book.title : book.title}
                    </h3>
                  </Link>

                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-1.5">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span className="font-bold text-navy-900">{book.rating ?? t('Best Seller')}</span>
                  </div>

                  <div className="pt-3 mt-3 border-t border-slate-100 flex items-end justify-between gap-2 flex-grow">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-lg font-black font-heading text-navy-900">₹{book.price}</span>
                        {book.originalPrice > book.price && (
                          <span className="text-[10px] text-slate-400 line-through">₹{book.originalPrice}</span>
                        )}
                      </div>
                      <span className="text-[9px] font-bold text-emerald-600 flex items-center gap-1">
                        <Truck className="w-3 h-3" /> {t('Doorstep Delivery')}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        dispatch(addToCart({ item: book, type: 'book' }));
                        toast.success(`${language === 'hi' ? hi?.title ?? book.title : book.title} ${t('added to cart!')}`);
                      }}
                      className="p-2 bg-yellow-400 hover:bg-yellow-500 text-navy-950 rounded-xl transition-all shadow-sm shrink-0"
                      title={t('Add to Cart')}
                    >
                      <ShoppingCart className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
              );
            })}
          </div>

          {/* Browse All Books Button */}
          <div className="mt-12 text-center">
            <Link
              href="/books"
              className="group inline-flex items-center gap-2 px-8 py-3.5 bg-yellow-400 hover:bg-yellow-500 text-navy-950 text-sm font-black rounded-xl shadow-sm transition-all hover:-translate-y-0.5 active:scale-[0.97]"
            >
              <span>{t('Browse All Books')}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          </>
        )}
      </div>
    </section>
  );
};
