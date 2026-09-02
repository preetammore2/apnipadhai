'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { addToCart } from '@/redux/features/cart/cartSlice';
import { isComboBook } from '@/lib/books';
import { toggleWishlist } from '@/redux/features/wishlist/wishlistSlice';
import { Heart, ShoppingCart, Trash2, ArrowRight, BookOpen, ArrowLeft, Loader2 } from 'lucide-react';
import type { Book } from '@/types';
import { toast } from 'sonner';
import { useTranslation } from '@/i18n/useTranslation';
import { BOOK_HI } from '@/i18n/data';
import { useGetBooksQuery } from '@/redux/api/bookApi';

export default function WishlistPage() {
  const { t, language } = useTranslation();
  const dispatch = useAppDispatch();
  const wishlistItems = useAppSelector((state) => state.wishlist.items);
  const { data: books = [], isLoading } = useGetBooksQuery();

  const wishlistedBooks = books.filter((b) =>
    wishlistItems.some((item) => item.id === b.id && item.type === 'book')
  );

  const handleRemove = (id: string, type: 'book') => {
    dispatch(toggleWishlist({ id, type }));
    toast.info(t('Removed from wishlist'));
  };

  const handleAddToCart = (item: Book) => {
    dispatch(addToCart({ item, type: 'book' }));
    toast.success(
      `${language === 'hi' ? BOOK_HI[item.id]?.title ?? item.title : item.title} ${t('added to cart!')}`
    );
  };

  return (
    <div className="py-12 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-brand-600 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('Back to Home')}</span>
        </Link>

        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 uppercase tracking-widest bg-brand-50 px-3.5 py-1.5 rounded-full">
            <Heart className="w-3.5 h-3.5 fill-brand-500 text-brand-500" /> {t('SAVED ITEMS')}
          </span>
          <h1 className="text-3xl sm:text-4xl font-black font-heading text-navy-900 mt-3">
            {t('My Wishlist')}
          </h1>
          <p className="text-slate-600 text-sm sm:text-base mt-2">
            {wishlistedBooks.length} {wishlistedBooks.length === 1 ? t('item') : t('items')} —
            {t('ready for your exam preparation.')}
          </p>
        </div>

        {isLoading ? (
          <div className="py-20 text-center">
            <Loader2 className="w-8 h-8 text-brand-600 animate-spin mx-auto" />
            <p className="text-xs text-slate-500 mt-2">{t('Loading Wishlist...')}</p>
          </div>
        ) : wishlistedBooks.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-3xl border border-slate-200 shadow-card space-y-4">
            <div className="w-20 h-20 bg-red-50 text-red-400 rounded-full flex items-center justify-center mx-auto">
              <Heart className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold font-heading text-navy-900">{t('Your wishlist is empty')}</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {t('Tap the heart icon on any book to save it here for quick access later.')}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Link
                href="/books"
                className="px-6 py-3 bg-navy-900 hover:bg-brand-600 text-white font-bold text-xs rounded-xl transition-colors inline-flex items-center gap-2"
              >
                <BookOpen className="w-4 h-4" /> {t('Browse Books')}
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlistedBooks.map((book) => (
              <div
                key={`book-${book.id}`}
                className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-card hover:shadow-card-hover transition-all flex flex-col group"
              >
                <div className="relative h-40 bg-slate-50 flex items-center justify-center p-4">
                  <div className="relative w-full h-full">
                    {book.coverImage ? (
                      <Image
                        src={book.coverImage}
                        alt={language === 'hi' ? (BOOK_HI[book.id]?.title ?? book.title) : book.title}
                        fill
                        className="object-contain group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-sm font-black text-slate-300 text-center px-4">{book.title}</span>
                      </div>
                    )}
                  </div>
                  <span className="absolute top-3 left-3 px-3 py-1 bg-yellow-400 text-navy-950 text-[10px] font-black uppercase rounded-full">
                    {t('Book')}
                  </span>
                </div>

                <div className="p-6 flex flex-col flex-1">
                  <h3 className="text-base font-bold font-heading text-navy-900 line-clamp-2 mb-1.5">
                    {language === 'hi' ? (BOOK_HI[book.id]?.title ?? book.title) : book.title}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-1 mb-4">{t(book.category)}</p>

                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-black font-heading text-brand-600">₹{book.price}</span>
                        {book.originalPrice > book.price && (
                          <span className="text-xs text-slate-400 line-through">₹{book.originalPrice}</span>
                        )}
                      </div>
                      {book.discountPercentage > 0 && (
                        <span className="text-[10px] font-bold text-emerald-600">{book.discountPercentage}% {t('OFF')}</span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleRemove(book.id, 'book')}
                        className="p-2.5 bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-500 rounded-xl transition-colors"
                        title={t('Remove from wishlist')}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      {!isComboBook(book) && (
                      <button
                        onClick={() => handleAddToCart(book)}
                        className="p-2.5 bg-yellow-400 hover:bg-yellow-500 text-navy-950 rounded-xl transition-colors"
                        title={t('Add to cart')}
                      >
                        <ShoppingCart className="w-4 h-4" />
                      </button>
                      )}
                      <Link
                        href={`/books/${book.id}`}
                        className="p-2.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl transition-colors"
                        title={t('View details')}
                      >
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
