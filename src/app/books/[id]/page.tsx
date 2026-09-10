'use client';

import React, { use, useState } from 'react';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
import { SamplePdfModal } from '@/components/layout/SamplePdfModal';
import {
  Star,
  FileText,
  Truck,
  ShieldCheck,
  ShoppingCart,
  Eye,
  CheckCircle2,
  ArrowLeft,
  Loader2,
} from 'lucide-react';
import { useAppDispatch } from '@/redux/hooks';
import { addToCart } from '@/redux/features/cart/cartSlice';
import { isComboBook } from '@/lib/books';
import { toast } from 'sonner';
import { useTranslation } from '@/i18n/useTranslation';
import { BOOK_HI } from '@/i18n/data';
import { useGetBookByIdQuery } from '@/redux/api/bookApi';
import { ComboBundleBuilder } from '@/components/books/ComboBundleBuilder';

export default function BookDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: book, isLoading } = useGetBookByIdQuery(id);
  const [isSampleOpen, setIsSampleOpen] = useState(false);
  const dispatch = useAppDispatch();
  const { t, language } = useTranslation();

  if (isLoading) {
    return (
      <div className="py-24 bg-slate-50 min-h-screen text-center">
        <Loader2 className="w-8 h-8 text-brand-600 animate-spin mx-auto" />
        <p className="text-xs text-slate-500 mt-2">{t('Loading Book Details...')}</p>
      </div>
    );
  }

  if (!book) {
    notFound();
  }

  const hi = language === 'hi' ? BOOK_HI[book.id] : undefined;
  const title = hi?.title ?? book.title;
  const subtitle = hi?.subtitle ?? book.subtitle;
  const hasSample = !!book.samplePdfUrl;

  if (isComboBook(book)) {
    return <ComboBundleBuilder book={book} />;
  }

  return (
    <div className="py-12 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Back Button */}
        <Link href="/books" className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-brand-600 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span>{t('Back to Publication Store')}</span>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Book Image Showcase */}
          <div className="lg:col-span-5">
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-card flex flex-col items-center justify-center relative">
              {book.discountPercentage > 0 && (
                <Badge variant="primary" size="lg" className="absolute top-4 left-4">
                  -{book.discountPercentage}% {t('OFF')}
                </Badge>
              )}

              <div className="relative w-full h-80 sm:h-96 my-4">
                {book.coverImage ? (
                  <Image
                    src={book.coverImage}
                    alt={title}
                    fill
                    className="object-contain drop-shadow-xl"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-2xl font-black font-heading text-slate-300 text-center px-6">
                      {title}
                    </span>
                  </div>
                )}
              </div>

              {hasSample && (
                <div className="w-full flex items-center justify-center gap-3 pt-4 border-t border-slate-100">
                  <button
                    onClick={() => setIsSampleOpen(true)}
                    className="w-full py-3 bg-brand-50 hover:bg-brand-100 text-brand-700 font-bold text-xs rounded-2xl flex items-center justify-center gap-2 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    <span>{t('Preview Sample PDF')}</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Book Specs & Order Box */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-card space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="accent">{t(book.category)}</Badge>
                {book.edition && (
                  <Badge variant="outline">{language === 'hi' ? hi?.edition ?? book.edition : book.edition}</Badge>
                )}
                {book.sku && (
                  <span className="text-xs font-bold text-slate-500">{t('SKU:')} {book.sku}</span>
                )}
              </div>

              <h1 className="text-3xl font-extrabold font-heading text-navy-900 leading-tight">
                {title}
              </h1>

              {subtitle && <p className="text-slate-600 text-sm leading-relaxed">{subtitle}</p>}

              {/* Rating & Author */}
              {(book.rating || book.author || book.pages) && (
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-500 border-y border-slate-100 py-3">
                  {book.rating && (
                    <span className="flex items-center gap-1 font-bold text-navy-900">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" /> {book.rating}
                      {book.reviewsCount ? ` (${book.reviewsCount} ${t('Ratings')})` : ''}
                    </span>
                  )}
                  {book.author && (
                    <>
                      <span>•</span>
                      <span>{t('Author:')} <strong className="text-navy-900">{book.author}</strong></span>
                    </>
                  )}
                  {book.pages && (
                    <>
                      <span>•</span>
                      <span>{book.pages} {t('Pages')}</span>
                    </>
                  )}
                </div>
              )}

              {/* Price & Cart Action */}
              <div className="space-y-4 pt-2">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                  <span className="text-3xl font-black font-heading text-brand-600">₹{book.price}</span>
                  {book.originalPrice > book.price && (
                    <span className="text-base text-slate-400 line-through">₹{book.originalPrice}</span>
                  )}
                  {book.originalPrice > book.price && (
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                      {t('You Save ₹')}{book.originalPrice - book.price}
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap gap-3">
                  {book && !isComboBook(book) && (
                  <button
                    onClick={() => {
                      dispatch(addToCart({ item: book, type: 'book' }));
                      toast.success(`${title} ${t('added to cart!')}`);
                    }}
                    className="flex-1 py-4 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white font-bold text-sm rounded-2xl shadow-button-glow transition-all flex items-center justify-center gap-2"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    <span>{t('Add to Cart')}</span>
                  </button>
                  )}

                  {hasSample && (
                    <button
                      onClick={() => setIsSampleOpen(true)}
                      className="px-6 py-4 bg-slate-100 hover:bg-slate-200 text-navy-900 font-bold text-xs rounded-2xl transition-colors flex items-center gap-2"
                    >
                      <FileText className="w-4 h-4 text-brand-600" />
                      <span>{t('Read Sample')}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Delivery Guarantees */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-slate-100 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-brand-500 shrink-0" />
                  <span>{t('Express Courier Delivery Across India')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>{t('100% Original Authentic Publication')}</span>
                </div>
              </div>
            </div>

            {/* Description & Table of Contents */}
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-card space-y-6">
              {book.description && (
                <div>
                  <h3 className="text-xl font-bold font-heading text-navy-900 mb-2">{t('Book Description')}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{language === 'hi' ? hi?.description ?? book.description : book.description}</p>
                </div>
              )}

              {book.tableOfContents && book.tableOfContents.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold font-heading text-navy-900 mb-3">{t('Table of Contents Highlights')}</h3>
                  <div className="space-y-2">
                    {book.tableOfContents.map((chap, idx) => (
                      <div key={idx} className="flex items-center gap-2.5 text-xs text-navy-900 bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <CheckCircle2 className="w-4 h-4 text-brand-500 shrink-0" />
                        <span>{hi?.tableOfContents?.[idx] ?? chap}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>
      </div>

      <SamplePdfModal
        book={book}
        isOpen={isSampleOpen}
        onClose={() => setIsSampleOpen(false)}
      />
    </div>
  );
}
