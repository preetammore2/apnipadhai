'use client';

import React, { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Minus,
  Plus,
  ShoppingCart,
  Truck,
  ShieldCheck,
  BadgePercent,
  BookOpen,
  Zap,
  CheckCircle2,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Book, ComboBundleItem } from '@/types';
import { useAppDispatch } from '@/redux/hooks';
import { addToCart } from '@/redux/features/cart/cartSlice';
import { BOOK_HI } from '@/i18n/data';
import { useTranslation } from '@/i18n/useTranslation';
import { toast } from 'sonner';

function asBookBlock(item: ComboBundleItem): Book {
  return {
    id: item.id,
    title: item.title,
    category: 'Combo',
    price: item.price,
    originalPrice: item.originalPrice,
    discountPercentage:
      item.originalPrice > item.price
        ? Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)
        : 0,
    inStock: item.inStock,
    coverImage: item.coverImage,
    sku: item.sku,
  };
}

export const ComboBundleBuilder: React.FC<{ book: Book }> = ({ book }) => {
  const { t, language } = useTranslation();
  const dispatch = useAppDispatch();
  const router = useRouter();

  const items = useMemo(() => book.bundleItems ?? [], [book]);

  const [quantities, setQuantities] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {};
    for (const item of items) {
      init[item.id] = 0;
    }
    return init;
  });

  const selectedItems = useMemo(
    () => items.filter((item) => (quantities[item.id] ?? 0) > 0),
    [items, quantities],
  );

  const total = selectedItems.reduce(
    (sum, item) => sum + item.price * (quantities[item.id] ?? 0),
    0,
  );
  const minPrice = items.reduce((min, item) => Math.min(min, item.price), Infinity);

  const setQuantity = (id: string, delta: number) => {
    setQuantities((prev) => {
      const next = Math.max(0, (prev[id] ?? 0) + delta);
      return { ...prev, [id]: next };
    });
  };

  const addSelectedToCart = () => {
    if (selectedItems.length === 0) return;
    for (const item of selectedItems) {
      const qty = quantities[item.id] ?? 0;
      for (let i = 0; i < qty; i++) {
        dispatch(addToCart({ item: asBookBlock(item), type: 'book' }));
      }
    }
  };

  const handleAddToCart = () => {
    if (selectedItems.length === 0) {
      toast.error(t('Please select at least one book from your combo.'));
      return;
    }
    addSelectedToCart();
    toast.success(t('Combo added to cart!'));
  };

  const handleBuyNow = () => {
    if (selectedItems.length === 0) {
      toast.error(t('Please select at least one book from your combo.'));
      return;
    }
    addSelectedToCart();
    router.push('/checkout');
  };

  const hi = language === 'hi' ? BOOK_HI[book.id] : undefined;
  const title = hi?.title ?? book.title;
  const subtitle = hi?.subtitle ?? book.subtitle;

  return (
    <div className="py-12 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Combo Cover */}
          <div className="lg:col-span-5">
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-card flex flex-col items-center justify-center relative sticky top-24">
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

              <div className="w-full flex items-center justify-center gap-3 pt-4 border-t border-slate-100 text-xs text-slate-600">
                <span className="flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-amber-600" />
                  {items.filter((i) => i.inStock).length} {t('Books Included')}
                </span>
                <span className="text-slate-300">|</span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  {t('Mix & Match Your Books')}
                </span>
              </div>
            </div>
          </div>

          {/* Combo Builder */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-card space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="accent">{t('Combo')}</Badge>
                {book.sku && (
                  <span className="text-xs font-bold text-slate-500">{t('SKU:')} {book.sku}</span>
                )}
              </div>

              <h1 className="text-3xl font-extrabold font-heading text-navy-900 leading-tight">
                {title}
              </h1>
              {subtitle && <p className="text-slate-600 text-sm leading-relaxed">{subtitle}</p>}

              {/* Price */}
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2 pt-2">
                <span className="text-3xl font-black font-heading text-amber-700">
                  {selectedItems.length > 0 ? `₹${total}` : `${t('From ₹')}${minPrice ?? 0}`}
                </span>
                {selectedItems.length > 0 && (
                  <span className="text-xs font-bold text-slate-500">
                    {selectedItems.reduce((s, i) => s + (quantities[i.id] ?? 0), 0)} {t('books selected')}
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-500 flex items-start gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                {t('Choose any combination of the books below. Final price updates as you adjust quantities.')}
              </p>
            </div>

            {/* Bundle Items */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-card overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-base font-bold font-heading text-navy-900">
                  {t('Select Your Books')}
                </h3>
                <span className="text-xs font-bold text-slate-400">{items.filter((i) => i.inStock).length} {t('available')}</span>
              </div>

              <div className="divide-y divide-slate-100">
                {items.map((item) => {
                  const qty = quantities[item.id] ?? 0;
                  return (
                    <div
                      key={item.id}
                      className={`flex items-center gap-4 px-6 py-4 ${
                        qty > 0 ? 'bg-amber-50/60' : ''
                      }`}
                    >
                      {/* Thumb */}
                      <Link
                        href={`/books/${item.id}`}
                        className="relative w-16 h-20 shrink-0 bg-slate-100 rounded-xl overflow-hidden border border-slate-200"
                      >
                        {item.coverImage ? (
                          <Image
                            src={item.coverImage}
                            alt={item.title}
                            fill
                            className="object-contain p-1"
                          />
                        ) : (
                          <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-slate-300 px-1 text-center">
                            {item.title}
                          </span>
                        )}
                      </Link>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <Link href={`/books/${item.id}`}>
                          <h4 className="text-sm font-bold font-heading text-navy-900 line-clamp-1 hover:text-amber-700 transition-colors">
                            {item.title}
                          </h4>
                        </Link>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-base font-black text-navy-900">₹{item.price}</span>
                          {item.originalPrice > item.price && (
                            <span className="text-[10px] text-slate-400 line-through">₹{item.originalPrice}</span>
                          )}
                          {item.originalPrice > item.price && (
                            <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">
                              <BadgePercent className="w-2.5 h-2.5 inline mr-0.5" />
                              -{Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)}%
                            </span>
                          )}
                        </div>
                        {!item.inStock && (
                          <span className="text-[10px] font-bold text-red-500 mt-1 inline-block">
                            {t('Out of stock')}
                          </span>
                        )}
                      </div>

                      {/* Qty stepper */}
                      {item.inStock ? (
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => setQuantity(item.id, -1)}
                            disabled={qty === 0}
                            className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed text-navy-900 flex items-center justify-center transition-colors"
                            aria-label={t('Decrease quantity')}
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span
                            className={`w-8 text-center text-sm font-black font-heading ${
                              qty > 0 ? 'text-amber-700' : 'text-slate-400'
                            }`}
                          >
                            {qty}
                          </span>
                          <button
                            onClick={() => setQuantity(item.id, 1)}
                            className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-navy-900 flex items-center justify-center transition-colors"
                            aria-label={t('Increase quantity')}
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-[10px] font-bold text-slate-400 shrink-0">{t('—')}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <button
                onClick={handleAddToCart}
                disabled={selectedItems.length === 0}
                className="w-full py-4 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-yellow-400 hover:to-amber-500 text-navy-950 font-bold text-sm rounded-2xl shadow-button-glow transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ShoppingCart className="w-5 h-5" />
                <span>{t('Add Selected Books to Cart')}</span>
              </button>
              <button
                onClick={handleBuyNow}
                disabled={selectedItems.length === 0}
                className="w-full py-4 bg-navy-900 hover:bg-navy-800 text-white font-bold text-sm rounded-2xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {t('Buy Now')}
              </button>
            </div>

            {/* Delivery Guarantees */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600">
              <div className="flex items-center gap-2 bg-white p-4 rounded-2xl border border-slate-200">
                <Truck className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>{t('Express Courier Delivery Across India')}</span>
              </div>
              <div className="flex items-center gap-2 bg-white p-4 rounded-2xl border border-slate-200">
                <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>{t('100% Original Authentic Publication')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};