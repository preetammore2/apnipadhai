'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Download, ExternalLink, FileText, Loader2, WifiOff, RefreshCw } from 'lucide-react';
import { Book } from '@/types';
import { useTranslation } from '@/i18n/useTranslation';

export default function BookSamplePdfPage() {
  const { t } = useTranslation();
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  const loadBooks = async () => {
    setIsLoading(true);
    setIsError(false);
    try {
      const res = await fetch('/api/books');
      if (!res.ok) throw new Error('Failed to load books');
      const data = (await res.json()) as Book[];
      setBooks(data.filter((book) => book.samplePdfUrl));
    } catch {
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBooks();
  }, []);

  return (
    <div className="py-12 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="text-xs font-bold text-brand-600 uppercase tracking-widest bg-brand-100/80 px-3.5 py-1.5 rounded-full">
            {t('100% FREE BOOK PREVIEWS')}
          </span>
          <h1 className="text-3xl sm:text-5xl font-black font-heading text-navy-900 mt-3">
            {t('Book Sample PDFs')}
          </h1>
          <p className="text-slate-600 text-sm sm:text-base mt-2">
            {t('Preview a free sample chapter of every Brahmastra book before you buy.')}
          </p>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            {t('Click Preview to read it in your browser or Download to save it.')}
          </p>
        </div>

        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-500">
            <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
            <p className="text-sm font-semibold">{t('Loading sample PDFs...')}</p>
          </div>
        )}

        {isError && (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-slate-500">
            <WifiOff className="w-8 h-8 text-red-400" />
            <p className="text-sm font-semibold text-center">
              {t('Something went wrong while fetching the sample PDFs. Please try again.')}
            </p>
            <button
              onClick={loadBooks}
              className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{t('Try Again')}</span>
            </button>
          </div>
        )}

        {!isLoading && !isError && books.length === 0 && (
          <div className="text-center py-20 text-slate-500">
            <FileText className="w-10 h-10 mx-auto text-slate-300 mb-3" />
            <p className="text-sm font-semibold">
              {t('Sample PDFs are not available right now. Please check back soon.')}
            </p>
          </div>
        )}

        {!isLoading && !isError && books.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {books.map((book) => (
              <div
                key={book.id}
                className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-card hover:shadow-card-hover transition-all flex flex-row sm:flex-col group"
              >
                <Link
                  href={`/books/${book.id}`}
                  className="relative shrink-0 w-32 sm:w-full sm:aspect-[3/4] bg-slate-100 overflow-hidden block"
                >
                  {book.coverImage ? (
                    <Image
                      src={book.coverImage}
                      alt={book.title}
                      fill
                      sizes="(max-width: 640px) 33vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-contain p-2 transform group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <span className="absolute inset-0 flex items-center justify-center p-4 text-center text-xl font-black font-heading text-slate-300">
                      {book.title}
                    </span>
                  )}
                  <span className="absolute top-2 right-2 px-2 py-0.5 bg-yellow-400 text-navy-950 text-[10px] font-black rounded-full uppercase shadow-sm">
                    {t('Sample')}
                  </span>
                </Link>

                <div className="p-4 flex flex-col flex-1 min-w-0">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    {book.category}
                  </span>
                  <Link href={`/books/${book.id}`}>
                    <h3 className="mt-1 text-sm sm:text-base font-bold font-heading text-navy-900 line-clamp-2 group-hover:text-brand-600 transition-colors">
                      {book.title}
                    </h3>
                  </Link>

                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-base font-black font-heading text-navy-900">
                      ₹{book.price}
                    </span>
                    {book.originalPrice > book.price && (
                      <span className="text-xs text-slate-400 line-through">₹{book.originalPrice}</span>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col sm:flex-row gap-2 sm:items-center">
                    <a
                      href={book.samplePdfUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full sm:flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 bg-navy-900 hover:bg-black text-white text-xs font-bold rounded-xl transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-yellow-400" />
                      {t('Preview')}
                    </a>
                    <a
                      href={book.samplePdfUrl}
                      download
                      className="w-full sm:flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold rounded-xl transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      {t('Download')}
                    </a>
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
