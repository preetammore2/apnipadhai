'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { BOOK_HI } from '@/i18n/data';
import { useTranslation } from '@/i18n/useTranslation';
import { Star, ShoppingCart, ArrowRight, Truck, Loader2, RefreshCw, WifiOff, Search, BadgePercent, Package } from 'lucide-react';
import { useGetBooksQuery } from '@/redux/api/bookApi';
import { useAppDispatch } from '@/redux/hooks';
import { addToCart } from '@/redux/features/cart/cartSlice';
import { isComboBook, sortComboFirst } from '@/lib/books';
import { toast } from 'sonner';

export const BooksSection: React.FC = () => {
  const { t, language } = useTranslation();
  const dispatch = useAppDispatch();
  const { data: books = [], isLoading, isError, refetch } = useGetBooksQuery();
  const [activeCategory, setActiveCategory] = React.useState<string>('all');

  const nonComboBooks = React.useMemo(
    () => books.filter((book) => !isComboBook(book)),
    [books],
  );

  const categories = React.useMemo(() => {
    const set = new Set<string>();
    nonComboBooks.forEach((book) => {
      if (book.category && book.category !== 'All books') set.add(book.category);
      (book.categories ?? [])
        .filter((c) => c !== 'All books')
        .forEach((c) => set.add(c));
    });
    return Array.from(set);
  }, [nonComboBooks]);

  const visibleBooks = React.useMemo(
    () =>
      activeCategory === 'all'
        ? nonComboBooks
        : nonComboBooks.filter(
            (book) =>
              book.category === activeCategory ||
              (book.categories ?? []).includes(activeCategory),
          ),
    [nonComboBooks, activeCategory],
  );

  const comboBooks = React.useMemo(() => books.filter(isComboBook), [books]);

  const comboMinPrice = (book: (typeof books)[number]): number => {
    if (book.bundleItems?.length) {
      return Math.min(...book.bundleItems.map((i) => i.price));
    }
    return book.price;
  };

  return (
    <section className="py-12 bg-slate-50/80 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="flex flex-col items-center text-center md:flex-row md:items-end md:text-left justify-between mb-8 gap-6">
          <div>
            <span className="inline-flex text-[11px] sm:text-xs font-black text-amber-800 uppercase tracking-wider bg-yellow-100 px-3.5 py-1.5 rounded-full border border-yellow-300">
              {t('APNI PADHAI PUBLICATION')}
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold font-heading text-navy-900 mt-3">
              {t('Books')}
            </h2>
          </div>
        </div>

        {/* Loading Spinner */}
        {isLoading ? (
          <div className="py-8 text-center">
            <Loader2 className="w-8 h-8 text-amber-600 animate-spin mx-auto" />
            <p className="text-xs text-slate-500 mt-2">{t('Loading Publication Store via RTK Query...')}</p>
          </div>
        ) : isError ? (
          <div className="py-8 text-center">
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
          <div className="py-8 text-center">
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
        ) : (
<>
          {/* Category Filter Tabs */}
          {categories.length > 0 && (
            <div className="mb-6 flex gap-2 overflow-x-auto pb-2 scrollbar-hide snap-x">
              {['all', ...categories].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`shrink-0 snap-start px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                    activeCategory === cat
                      ? 'bg-navy-900 text-white shadow-md'
                      : 'bg-white text-navy-900 border border-slate-200 hover:border-amber-300 hover:text-amber-700'
                  }`}
                >
                  {cat === 'all' ? t('All Books') : t(cat)}
                </button>
              ))}
            </div>
          )}

{/* Books Grid — horizontal scroll on mobile/tablet, 4-in-row grid on large screens */}
          <div className="flex gap-4 sm:gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide lg:grid lg:grid-cols-4 lg:overflow-visible lg:pb-0 lg:snap-none">
{[...sortComboFirst([...comboBooks, ...visibleBooks]).slice(0, 8)].map((book) => {
              const hi = BOOK_HI[book.id];
              const isCombo = isComboBook(book);
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
                    <div className="min-w-0">
                      <div className="flex items-baseline gap-1 whitespace-nowrap">
                        {isCombo ? (
                          <>
                            <span className="text-[10px] font-black text-amber-700 uppercase">From</span>
                            <span className="text-lg font-black font-heading text-navy-900">₹{comboMinPrice(book)}</span>
                          </>
                        ) : (
                          <span className="text-lg font-black font-heading text-navy-900">₹{book.price}</span>
                        )}
                        {!isCombo && book.originalPrice > book.price && (
                          <span className="text-[10px] text-slate-400 line-through">₹{book.originalPrice}</span>
                        )}
                      </div>
                      <span className="text-[9px] font-bold text-emerald-600 flex items-center gap-1">
                        <Truck className="w-3 h-3 shrink-0" /> {t('Doorstep Delivery')}
                      </span>
                    </div>
                    {isCombo ? (
                    <Link
                      href={`/books/${book.id}`}
                      title={t('Select Books')}
                      className="p-2 inline-flex items-center justify-center bg-navy-900 hover:bg-amber-600 text-white rounded-xl transition-colors shrink-0"
                    >
                      <Package className="w-4 h-4" />
                    </Link>
                    ) : (
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
                    )}
                  </div>
                </div>
              </motion.div>
              );
            })}
          </div>

          {/* Browse All Books Button */}
          <div className="mt-8 text-center">
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
