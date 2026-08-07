'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { BOOK_HI } from '@/i18n/data';
import { useTranslation } from '@/i18n/useTranslation';
import { SamplePdfModal } from '@/components/layout/SamplePdfModal';
import { Star, ShoppingCart, Eye, ArrowRight, Truck, Loader2, RefreshCw, WifiOff, Search, Heart } from 'lucide-react';
import { useGetBooksQuery } from '@/redux/api/bookApi';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { addToCart } from '@/redux/features/cart/cartSlice';
import { setSelectedPdfBook } from '@/redux/features/ui/uiSlice';
import { toggleWishlist } from '@/redux/features/wishlist/wishlistSlice';
import { toast } from 'sonner';

export const BooksSection: React.FC = () => {
  const { t, language } = useTranslation();
  const dispatch = useAppDispatch();
  const wishlistItems = useAppSelector((state) => state.wishlist.items);
  const { data: books = [], isLoading, isError, refetch } = useGetBooksQuery();

  return (
    <section className="py-20 bg-slate-50/80 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <span className="text-xs font-black text-amber-800 uppercase tracking-widest bg-yellow-100 px-3.5 py-1.5 rounded-full border border-yellow-300">
              {t('APNI PADHAI PUBLICATION')}
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold font-heading text-navy-900 mt-3">
              {t('Bestselling Brahmastra Book Series')}
            </h2>
            <p className="text-slate-600 text-sm sm:text-base mt-2">
              {t('Authentic study guides, question banks, and model papers trusted by over 2.5 Lakh+ students.')}
            </p>
          </div>
        </div>

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
        ) : (
          <>
          {/* Books Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {books.slice(0, 4).map((book) => {
              const hi = BOOK_HI[book.id];
              return (
              <motion.div
                key={book.id}
                whileHover={{ y: -8 }}
                className="bg-white rounded-3xl border-2 border-slate-100 hover:border-yellow-300 p-5 shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Book Cover Image 3D Frame */}
                  <div className="relative h-64 w-full bg-slate-50 rounded-2xl overflow-hidden mb-4 border border-slate-200/80 flex items-center justify-center p-4 group-hover:shadow-md transition-all">
                    <span className="absolute top-3 left-3 z-10 px-2.5 py-1 bg-yellow-400 text-navy-950 text-[10px] font-black rounded-full shadow-sm">
                      -{book.discountPercentage}% {t('OFF')}
                    </span>

                    <button
                      onClick={() => {
                        const isWishlisted = wishlistItems.some(
                          (item) => item.id === book.id && item.type === 'book'
                        );
                        dispatch(toggleWishlist({ id: book.id, type: 'book' }));
                          if (isWishlisted) {
                            toast.info(t('Removed from wishlist'));
                          } else {
                            toast.success(t('Added to wishlist!'));
                          }
                      }}
                      className="absolute top-3 right-3 z-10 p-2 bg-white/95 hover:bg-white rounded-full shadow-sm transition-colors"
                      title={t('Save to wishlist')}
                    >
                      <Heart
                        className={`w-4 h-4 transition-colors ${
                          wishlistItems.some((item) => item.id === book.id && item.type === 'book')
                            ? 'fill-red-500 text-red-500'
                            : 'text-slate-600'
                        }`}
                      />
                    </button>

                    <div className="relative w-full h-full transform group-hover:scale-105 transition-transform duration-300">
                      <Image
                        src={book.coverImage}
                        alt={language === 'hi' ? hi?.title ?? book.title : book.title}
                        fill
                        className="object-contain drop-shadow-lg"
                      />
                    </div>

                    {/* Hover Quick Action Buttons */}
                    <div className="absolute inset-0 bg-navy-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 p-4">
                      <button
                        onClick={() => dispatch(setSelectedPdfBook(book))}
                        className="p-3 bg-white text-navy-900 rounded-full shadow-lg hover:bg-yellow-400 hover:text-navy-950 transition-colors"
                        title={t('Preview Sample PDF')}
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => {
                          dispatch(addToCart({ item: book, type: 'book' }));
                          toast.success(`${language === 'hi' ? hi?.title ?? book.title : book.title} ${t('added to cart!')}`);
                        }}
                        className="p-3 bg-yellow-400 text-navy-950 rounded-full shadow-lg hover:bg-yellow-500 transition-colors font-bold"
                        title={t('Add to Cart')}
                      >
                        <ShoppingCart className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t(book.category)}</span>
                    <h3 className="text-base font-bold font-heading text-navy-900 line-clamp-1 group-hover:text-amber-700 transition-colors">
                      {language === 'hi' ? hi?.title ?? book.title : book.title}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {language === 'hi' ? hi?.subtitle ?? book.subtitle : book.subtitle}
                    </p>
                  </div>

                  {/* Rating & Details */}
                  <div className="flex items-center justify-between text-xs text-slate-500 mt-3 pt-3 border-t border-slate-100">
                    <span className="flex items-center gap-1 font-bold text-navy-900">
                      <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-500" /> {book.rating}
                    </span>
                    <span>{book.pages} {t('Pages')}</span>
                  </div>
                </div>

                {/* Price & Action */}
                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-black font-heading text-navy-900">₹{book.price}</span>
                      <span className="text-xs text-slate-400 line-through">₹{book.originalPrice}</span>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                      <Truck className="w-3 h-3" /> {t('Doorstep Delivery')}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      dispatch(addToCart({ item: book, type: 'book' }));
                      toast.success(`${language === 'hi' ? hi?.title ?? book.title : book.title} ${t('added to cart!')}`);
                    }}
                    className="px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-navy-950 text-xs font-black rounded-xl transition-all shadow-sm"
                  >
                    {t('Buy Now')}
                  </button>
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

      {/* Redux Connected Sample PDF Reader Modal */}
      <SamplePdfModal />
    </section>
  );
};
