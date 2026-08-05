'use client';

import React, { useState } from 'react';
import { BOOKS_DATA } from '@/data/books';
import { Book } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { SamplePdfModal } from '@/components/layout/SamplePdfModal';
import Image from 'next/image';
import Link from 'next/link';
import { Star, ShoppingCart, Eye, Search, Truck, ArrowRight } from 'lucide-react';
import { useAppDispatch } from '@/redux/hooks';
import { addToCart } from '@/redux/features/cart/cartSlice';
import { toast } from 'sonner';
import { useTranslation } from '@/i18n/useTranslation';
import { BOOK_HI } from '@/i18n/data';

export default function BooksPage() {
  const [selectedBookForPdf, setSelectedBookForPdf] = useState<Book | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const dispatch = useAppDispatch();
  const { t, language } = useTranslation();

  const filteredBooks = BOOKS_DATA.filter((book) =>
    book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    book.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    book.examTarget.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="py-12 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Banner */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-bold text-brand-600 uppercase tracking-widest bg-brand-100/80 px-3.5 py-1.5 rounded-full">
            {t('OFFICIAL PUBLICATION STORE')}
          </span>
          <h1 className="text-3xl sm:text-5xl font-black font-heading text-navy-900 mt-3">
            {t('Brahmastra Study Books')}
          </h1>
          <p className="text-slate-600 text-sm sm:text-base mt-2">
            {t('Authentic printed books & practice guides written by Rohit Sir & senior faculty. Fast courier doorstep delivery across India.')}
          </p>

          {/* Search Bar */}
          <div className="relative max-w-md mx-auto mt-6">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={t('Search books (e.g. Science, Hindi, English, Ankganit)...')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm focus:outline-none focus:border-brand-500 shadow-sm text-navy-900"
            />
          </div>
        </div>

        {/* Books Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredBooks.map((book) => {
            const hi = language === 'hi' ? BOOK_HI[book.id] : undefined;
            const title = hi?.title ?? book.title;
            const subtitle = hi?.subtitle ?? book.subtitle;

            return (
              <div
                key={book.id}
                className="bg-white rounded-3xl border border-slate-200 p-5 shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Book Cover Frame */}
                  <div className="relative h-64 w-full bg-slate-100 rounded-2xl overflow-hidden mb-4 border border-slate-200/80 flex items-center justify-center p-4">
                    <Badge variant="primary" size="sm" className="absolute top-3 left-3 z-10">
                      -{book.discountPercentage}% {t('OFF')}
                    </Badge>

                    <div className="relative w-full h-full transform group-hover:scale-105 transition-transform duration-300">
                      <Image
                        src={book.coverImage}
                        alt={title}
                        fill
                        className="object-contain drop-shadow-md"
                      />
                    </div>

                    {/* Hover Quick Actions */}
                    <div className="absolute inset-0 bg-navy-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 p-4">
                      <button
                        onClick={() => setSelectedBookForPdf(book)}
                        className="p-3 bg-white text-navy-900 rounded-full shadow-lg hover:bg-brand-500 hover:text-white transition-colors"
                        title={t('Preview Sample PDF')}
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => {
                          dispatch(addToCart({ item: book, type: 'book' }));
                          toast.success(`${title} ${t('added to cart!')}`);
                        }}
                        className="p-3 bg-brand-500 text-white rounded-full shadow-lg hover:bg-brand-600 transition-colors"
                        title={t('Add to Cart')}
                      >
                        <ShoppingCart className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t(book.category)}</span>
                    <Link href={`/books/${book.id}`}>
                      <h3 className="text-base font-bold font-heading text-navy-900 line-clamp-1 group-hover:text-brand-600 transition-colors">
                        {title}
                      </h3>
                    </Link>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {subtitle}
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500 mt-3 pt-3 border-t border-slate-100">
                    <span className="flex items-center gap-1 font-bold text-navy-900">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> {book.rating} ({book.reviewsCount})
                    </span>
                    <span>{book.pages} {t('Pages')}</span>
                  </div>
                </div>

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

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        dispatch(addToCart({ item: book, type: 'book' }));
                        toast.success(`${title} ${t('added to cart!')}`);
                      }}
                      className="px-4 py-2 bg-navy-900 hover:bg-brand-600 text-white text-xs font-bold rounded-xl transition-colors shadow-sm"
                    >
                      {t('Buy Now')}
                    </button>
                    <Link
                      href={`/books/${book.id}`}
                      className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <SamplePdfModal
        book={selectedBookForPdf}
        isOpen={!!selectedBookForPdf}
        onClose={() => setSelectedBookForPdf(null)}
      />
    </div>
  );
}
