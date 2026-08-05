'use client';

import React from 'react';
import { Modal } from '@/components/ui/Modal';
import { Book } from '@/types';
import { FileText, Download, ShoppingCart } from 'lucide-react';
import Image from 'next/image';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { setSelectedPdfBook } from '@/redux/features/ui/uiSlice';
import { addToCart } from '@/redux/features/cart/cartSlice';
import { toast } from 'sonner';
import { useTranslation } from '@/i18n/useTranslation';
import { BOOK_HI } from '@/i18n/data';

interface SamplePdfModalProps {
  book?: Book | null;
  isOpen?: boolean;
  onClose?: () => void;
}

export const SamplePdfModal: React.FC<SamplePdfModalProps> = ({
  book: propBook,
  isOpen: propIsOpen,
  onClose: propOnClose,
}) => {
  const dispatch = useAppDispatch();
  const { t, language } = useTranslation();
  const reduxBook = useAppSelector((state) => state.ui.selectedPdfBook);
  const book = propBook !== undefined ? propBook : reduxBook;
  const isOpen = propIsOpen !== undefined ? propIsOpen : !!reduxBook;

  const handleClose = () => {
    dispatch(setSelectedPdfBook(null));
    if (propOnClose) propOnClose();
  };

  if (!book) return null;

  const hi = language === 'hi' ? BOOK_HI[book.id] : undefined;
  const title = hi?.title ?? book.title;
  const subtitle = hi?.subtitle ?? book.subtitle;
  const category = hi?.examTarget ?? book.category;

  const handleAddToCart = () => {
    dispatch(addToCart({ item: book, type: 'book' }));
    toast.success(t('added to cart!'));
    handleClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} maxWidth="2xl" title={`${t('Sample PDF Preview:')} ${title}`}>
      <div className="space-y-6">
        
        {/* Book Header Summary */}
        <div className="flex flex-col sm:flex-row items-center gap-6 p-4 bg-slate-50 rounded-2xl border border-slate-200">
          <div className="relative w-24 h-32 rounded-xl overflow-hidden shadow-md shrink-0 border border-slate-300">
            <Image src={book.coverImage} alt={book.title} fill className="object-contain p-1" />
          </div>

          <div className="space-y-2 text-center sm:text-left min-w-0">
            <span className="px-2.5 py-0.5 bg-yellow-400 text-navy-950 text-[10px] font-black rounded-full uppercase">
              {category}
            </span>
            <h3 className="text-base font-bold font-heading text-navy-900 line-clamp-1">{title}</h3>
            <p className="text-xs text-slate-500 line-clamp-2">{subtitle}</p>

            <div className="flex items-center justify-center sm:justify-start gap-3 pt-1">
              <span className="text-lg font-black font-heading text-navy-900">₹{book.price}</span>
              <span className="text-xs text-slate-400 line-through">₹{book.originalPrice}</span>
              <span className="text-[11px] font-black text-emerald-600">{t('Save {0}%', book.discountPercentage)}</span>
            </div>
          </div>
        </div>

        {/* Sample Index / Chapter Highlights */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-navy-900 flex items-center gap-2">
            <FileText className="w-4 h-4 text-amber-600" />
            <span>{t('Sample Chapter Table of Contents ({0} Total Pages)', book.pages)}</span>
          </h4>

          <div className="space-y-2 text-xs text-slate-700 bg-white p-4 rounded-2xl border border-slate-200">
            {book.tableOfContents.slice(0, 5).map((toc, idx) => (
              <div key={idx} className="flex items-center justify-between py-1.5 border-b border-slate-100 last:border-0">
                <span className="font-medium text-navy-900">{hi?.tableOfContents[idx] ?? toc}</span>
                <span className="text-[10px] font-bold text-amber-700 bg-yellow-100 px-2 py-0.5 rounded">{t('Sample PDF')}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleAddToCart}
            className="flex-1 py-3.5 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-yellow-400 hover:to-amber-500 text-navy-950 font-black text-xs rounded-xl shadow-button-glow transition-all flex items-center justify-center gap-2"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>{t('Buy Printed Hardcopy (₹{0})', book.price)}</span>
          </button>
          
          <a
            href={book.samplePdfUrl}
            target="_blank"
            rel="noreferrer"
            className="flex-1 py-3.5 bg-navy-900 hover:bg-black text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 text-center"
          >
            <Download className="w-4 h-4 text-yellow-400" />
            <span>{t('Download Sample PDF')}</span>
          </a>
        </div>

      </div>
    </Modal>
  );
};
