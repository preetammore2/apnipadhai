'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingBag, X, Trash2, Plus, Minus, ArrowRight, Tag, ShieldCheck } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import {
  removeFromCart,
  updateQuantity,
  setCartOpen,
  applyCoupon,
} from '@/redux/features/cart/cartSlice';
import { toast } from 'sonner';
import { useTranslation } from '@/i18n/useTranslation';
import { BOOK_HI } from '@/i18n/data';

export const CartDrawer: React.FC = () => {
  const dispatch = useAppDispatch();
  const { t, language } = useTranslation();
  const { items, isCartOpen, couponCode, discountAmount } = useAppSelector((state) => state.cart);
  const [couponInput, setCouponInput] = useState('');

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalSavings = items.reduce(
    (sum, item) => sum + (item.originalPrice - item.price) * item.quantity,
    0
  );
  const finalTotal = Math.max(0, subtotal - discountAmount);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (couponInput.toUpperCase() === 'SGS7J8VT') {
      dispatch(applyCoupon('SGS7J8VT'));
      toast.success('Coupon SGS7J8VT applied! ₹20 Extra Discount');
    } else {
      toast.error(t('Invalid Coupon Code. Try "SGS7J8VT"'));
    }
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => dispatch(setCartOpen(false))}
            className="fixed inset-0 bg-navy-950/60 backdrop-blur-sm z-50"
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full sm:w-[450px] bg-white z-50 shadow-2xl flex flex-col justify-between"
          >
            {/* Drawer Header */}
            <div className="p-6 border-b border-amber-100 flex items-center justify-between bg-amber-50/50">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-yellow-400 text-navy-950 rounded-xl shadow-sm">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black font-heading text-navy-900">{t('Your Shopping Cart')}</h3>
                  <p className="text-xs text-slate-500">{items.length} {t('Items Selected')}</p>
                </div>
              </div>

              <button
                onClick={() => dispatch(setCartOpen(false))}
                className="p-2 text-slate-400 hover:text-navy-900 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {items.length === 0 ? (
                <div className="py-16 text-center space-y-4">
                  <div className="w-16 h-16 bg-yellow-100 text-amber-800 rounded-full flex items-center justify-center mx-auto">
                    <ShoppingBag className="w-8 h-8" />
                  </div>
                  <h4 className="text-base font-bold text-navy-900">{t('Your cart is empty')}</h4>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto">
                    {t('Explore our bestselling Brahmastra books to add them to your cart.')}
                  </p>
                  <Link
                    href="/books"
                    onClick={() => dispatch(setCartOpen(false))}
                    className="px-6 py-2.5 bg-yellow-400 hover:bg-yellow-500 text-navy-950 font-black rounded-xl text-xs shadow-sm transition-all inline-block"
                  >
                    {t('Browse Books')}
                  </Link>
                </div>
              ) : (
                items.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl border border-slate-200/80 bg-white shadow-sm flex items-start gap-4"
                  >
                    <div className="relative w-16 h-20 bg-slate-100 rounded-xl overflow-hidden shrink-0 border border-slate-200">
                      <Image src={item.image} alt={item.title} fill className="object-contain p-1" />
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-yellow-100 px-2 py-0.5 rounded-md">
                        {t('Book')}
                      </span>
                      <h4 className="text-xs font-bold text-navy-900 line-clamp-1">
                        {language === 'hi' ? BOOK_HI[item.id]?.title ?? item.title : item.title}
                      </h4>
                      
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black font-heading text-navy-900">₹{item.price}</span>
                        <span className="text-[11px] text-slate-400 line-through">₹{item.originalPrice}</span>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center justify-between pt-1">
                        <div className="flex items-center gap-2 bg-slate-100 rounded-lg p-1 border border-slate-200">
                          <button
                            onClick={() => dispatch(updateQuantity({ id: item.id, delta: -1 }))}
                            className="p-1 hover:bg-white rounded text-slate-600"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-bold px-1.5">{item.quantity}</span>
                          <button
                            onClick={() => dispatch(updateQuantity({ id: item.id, delta: 1 }))}
                            className="p-1 hover:bg-white rounded text-slate-600"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <button
                          onClick={() => dispatch(removeFromCart(item.id))}
                          className="p-1.5 text-slate-400 hover:text-red-600 transition-colors"
                          title={t('Remove item')}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Drawer Footer Summary */}
            {items.length > 0 && (
              <div className="p-6 border-t border-slate-200 bg-slate-50 space-y-4">
                {/* Coupon Input */}
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder={t('Coupon Code (Try SGS7J8VT)')}
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-yellow-500 uppercase font-bold text-navy-900"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-navy-900 hover:bg-black text-white text-xs font-bold rounded-xl shrink-0"
                  >
                    {t('Apply')}
                  </button>
                </form>

                {/* Calculation Breakdown */}
                <div className="space-y-1.5 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span>{t('Subtotal')}</span>
                    <span className="font-bold text-navy-900">₹{subtotal}</span>
                  </div>
                  <div className="flex justify-between text-emerald-600">
                    <span>{t('Total Discount Savings')}</span>
                    <span className="font-bold">-₹{totalSavings}</span>
                  </div>
                  {couponCode && (
                    <div className="flex justify-between text-emerald-600">
                      <span>{t('Coupon Discount')} ({couponCode})</span>
                      <span className="font-bold">-₹{discountAmount}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-navy-900 font-black text-base pt-2 border-t border-slate-200">
                    <span>{t('Total Payable')}</span>
                    <span className="text-amber-700">₹{finalTotal}</span>
                  </div>
                </div>

                {/* Checkout CTA */}
                <Link
                  href="/checkout"
                  onClick={() => dispatch(setCartOpen(false))}
                  className="w-full py-4 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-yellow-400 hover:to-amber-500 text-navy-950 font-black text-sm rounded-2xl shadow-button-glow transition-all flex items-center justify-center gap-2"
                >
                  <span>{t('Proceed to Secure Checkout')}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 font-medium pt-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>{t('100% Secure Payment & Doorstep Delivery')}</span>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
