'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Book } from '@/types';
import { SamplePdfModal } from '@/components/layout/SamplePdfModal';
import { Star, ShoppingCart, Eye, ArrowRight, Truck, Loader2 } from 'lucide-react';
import { useGetBooksQuery } from '@/redux/api/bookApi';
import { useAppDispatch } from '@/redux/hooks';
import { addToCart } from '@/redux/features/cart/cartSlice';
import { setSelectedPdfBook } from '@/redux/features/ui/uiSlice';
import { toast } from 'sonner';

export const BooksSection: React.FC = () => {
  const dispatch = useAppDispatch();
  const { data: books = [], isLoading } = useGetBooksQuery();

  return (
    <section className="py-20 bg-slate-50/80 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <span className="text-xs font-black text-amber-800 uppercase tracking-widest bg-yellow-100 px-3.5 py-1.5 rounded-full border border-yellow-300">
              APNI PADHAI PUBLICATION
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold font-heading text-navy-900 mt-3">
              Bestselling Brahmastra Book Series
            </h2>
            <p className="text-slate-600 text-sm sm:text-base mt-2">
              Authentic study guides, question banks, and model papers trusted by over 2.5 Lakh+ students.
            </p>
          </div>

          <Link
            href="/books"
            className="inline-flex items-center gap-2 text-sm font-bold text-amber-700 hover:text-amber-800 transition-colors shrink-0"
          >
            <span>Browse All Books</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Loading Spinner */}
        {isLoading ? (
          <div className="py-16 text-center">
            <Loader2 className="w-8 h-8 text-amber-600 animate-spin mx-auto" />
            <p className="text-xs text-slate-500 mt-2">Loading Publication Store via RTK Query...</p>
          </div>
        ) : (
          /* Books Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {books.slice(0, 4).map((book) => (
              <motion.div
                key={book.id}
                whileHover={{ y: -8 }}
                className="bg-white rounded-3xl border-2 border-slate-100 hover:border-yellow-300 p-5 shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Book Cover Image 3D Frame */}
                  <div className="relative h-64 w-full bg-slate-50 rounded-2xl overflow-hidden mb-4 border border-slate-200/80 flex items-center justify-center p-4 group-hover:shadow-md transition-all">
                    <span className="absolute top-3 left-3 z-10 px-2.5 py-1 bg-yellow-400 text-navy-950 text-[10px] font-black rounded-full shadow-sm">
                      -{book.discountPercentage}% OFF
                    </span>

                    <div className="relative w-full h-full transform group-hover:scale-105 transition-transform duration-300">
                      <Image
                        src={book.coverImage}
                        alt={book.title}
                        fill
                        className="object-contain drop-shadow-lg"
                      />
                    </div>

                    {/* Hover Quick Action Buttons */}
                    <div className="absolute inset-0 bg-navy-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 p-4">
                      <button
                        onClick={() => dispatch(setSelectedPdfBook(book))}
                        className="p-3 bg-white text-navy-900 rounded-full shadow-lg hover:bg-yellow-400 hover:text-navy-950 transition-colors"
                        title="Preview Sample PDF"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => {
                          dispatch(addToCart({ item: book, type: 'book' }));
                          toast.success(`${book.title} added to cart!`);
                        }}
                        className="p-3 bg-yellow-400 text-navy-950 rounded-full shadow-lg hover:bg-yellow-500 transition-colors font-bold"
                        title="Add to Cart"
                      >
                        <ShoppingCart className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{book.category}</span>
                    <h3 className="text-base font-bold font-heading text-navy-900 line-clamp-1 group-hover:text-amber-700 transition-colors">
                      {book.title}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {book.subtitle}
                    </p>
                  </div>

                  {/* Rating & Details */}
                  <div className="flex items-center justify-between text-xs text-slate-500 mt-3 pt-3 border-t border-slate-100">
                    <span className="flex items-center gap-1 font-bold text-navy-900">
                      <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-500" /> {book.rating}
                    </span>
                    <span>{book.pages} Pages</span>
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
                      <Truck className="w-3 h-3" /> Doorstep Delivery
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      dispatch(addToCart({ item: book, type: 'book' }));
                      toast.success(`${book.title} added to cart!`);
                    }}
                    className="px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-navy-950 text-xs font-black rounded-xl transition-all shadow-sm"
                  >
                    Buy Now
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Redux Connected Sample PDF Reader Modal */}
      <SamplePdfModal />
    </section>
  );
};
