'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { BadgePercent, ShoppingCart, ArrowRight, Truck, Star, Badge } from 'lucide-react';
import { useTranslation } from '@/i18n/useTranslation';
import { BOOK_HI } from '@/i18n/data';
import { useGetBooksQuery } from '@/redux/api/bookApi';
import { useAppDispatch } from '@/redux/hooks';
import { addToCart } from '@/redux/features/cart/cartSlice';
import { toast } from 'sonner';

export const BookDealsSection: React.FC = () => {
  const { t, language } = useTranslation();
  const dispatch = useAppDispatch();
  const { data: books = [], isLoading } = useGetBooksQuery();

  const deals = useMemo(
    () =>
      books
        .filter((book) => book.discountPercentage > 0 && book.inStock)
        .sort((a, b) => b.discountPercentage - a.discountPercentage)
        .slice(0, 8),
    [books],
  );

  if (isLoading || deals.length === 0) return null;

  return (
    <section className="py-16 bg-gradient-to-b from-slate-50 via-amber-50/60 to-slate-50 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-72 h-72 bg-red-200/20 rounded-full blur-3xl pointer-events-none" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-black text-red-700 uppercase tracking-widest bg-red-100 px-3.5 py-1.5 rounded-full border border-red-200 inline-flex items-center gap-1.5">
              <BadgePercent className="w-3.5 h-3.5 animate-pulse" /> {t('BOOKS WITH DISCOUNT')}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-navy-900 mt-3">
              {t('Limited-Time Discounted Books')}
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm mt-1.5">
              {t('Grab bestselling Brahmastra books at special discounted prices before stock runs out.')}
            </p>
          </div>
          <Link
            href="/books"
            className="group inline-flex items-center gap-2 px-5 py-2.5 bg-navy-900 hover:bg-brand-600 text-white text-xs font-black rounded-xl transition-all hover:-translate-y-0.5"
          >
            <span>{t('Shop All Books')}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Deals Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {deals.map((book, idx) => {
            const hi = BOOK_HI[book.id];
            const title = language === 'hi' ? hi?.title ?? book.title : book.title;
            return (
              <motion.div
                key={book.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                whileHover={{ y: -6 }}
                className="bg-white rounded-2xl border border-slate-200 hover:border-amber-300 shadow-card hover:shadow-card-hover transition-all overflow-hidden flex flex-col group"
              >
                <div className="relative">
                  <Link href={`/books/${book.id}`} className="relative block h-40 sm:h-52 bg-slate-50 overflow-hidden">
                    {book.coverImage ? (
                      <Image
                        src={book.coverImage}
                        alt={title}
                        fill
                        className="object-contain p-3 group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <span className="absolute inset-0 flex items-center justify-center text-sm font-black text-slate-300 px-4 text-center">
                        {title}
                      </span>
                    )}
                  </Link>
                  <span className="absolute top-2.5 left-2.5 z-10 px-2 py-1 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center gap-1">
                    <Badge className="w-3 h-3" /> -{book.discountPercentage}% {t('OFF')}
                  </span>
                  <div className="absolute top-2.5 right-2.5 z-10 px-2 py-1 bg-emerald-500 text-white text-[10px] font-black rounded-full">
                    {t('HOT')}
                  </div>
                </div>

                <div className="p-4 flex flex-col flex-grow">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{t(book.category)}</span>
                  <Link href={`/books/${book.id}`}>
                    <h3 className="text-sm font-bold font-heading text-navy-900 line-clamp-1 group-hover:text-amber-700 transition-colors mt-1">
                      {title}
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
                        <span className="text-[10px] text-slate-400 line-through">₹{book.originalPrice}</span>
                      </div>
                      <span className="text-[9px] font-bold text-emerald-600 flex items-center gap-1">
                        <Truck className="w-3 h-3" /> {t('Doorstep Delivery')}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        dispatch(addToCart({ item: book, type: 'book' }));
                        toast.success(`${title} ${t('added to cart!')}`);
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
      </div>
    </section>
  );
};
