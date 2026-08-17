'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { applyCoupon, clearCoupon } from '@/redux/features/cart/cartSlice';
import { ArrowRight, Loader2, ShoppingBag, Smartphone, Tag, X } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from '@/i18n/useTranslation';
import { BOOK_HI } from '@/i18n/data';
import { useStoreSettings } from '@/lib/use-store-settings';
import { computeCartTotals, findActiveCoupon } from '@/lib/pricing';
import { digitsOnly, isSixDigitPincode, isTenDigitPhone } from '@/lib/validation';

export default function CheckoutPage() {
  const { t, language } = useTranslation();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const cart = useAppSelector((state) => state.cart.items);
  const couponCode = useAppSelector((state) => state.cart.couponCode);
  const settings = useStoreSettings();
  const settingsLoaded = settings !== null;
  const totals = computeCartTotals(
    cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    settings,
    couponCode,
  );
  const [formData, setFormData] = useState({ name: '', phone: '', email: '', address: '', city: '', pincode: '' });
  const [isProcessing, setIsProcessing] = useState(false);
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');

  const reminderSent = useRef(false);

  useEffect(() => {
    return () => {
      if (reminderSent.current) return;
      if (cart.length === 0) return;

      const phone = formData.phone.trim();
      const email = formData.email.trim();
      if (!phone && !email) return;

      reminderSent.current = true;
      fetch('/api/notifications/cart-reminder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: { name: formData.name.trim(), phone, email },
          items: cart.map((item) => ({
            title: language === 'hi' ? BOOK_HI[item.id]?.title ?? item.title : item.title,
            quantity: item.quantity,
            price: item.price,
          })),
        }),
      }).catch(() => undefined);
    };
  }, [cart, formData, language]);

  const handleApplyCoupon = () => {
    const code = couponInput.trim();
    setCouponError('');
    if (!code) {
      setCouponError(t('Enter a coupon code'));
      return;
    }
    if (!settings) {
      setCouponError(t('Coupon codes are still loading. Please try again.'));
      return;
    }
    const coupon = findActiveCoupon(settings, code);
    if (!coupon) {
      setCouponError(t('Invalid or inactive coupon code'));
      return;
    }
    dispatch(applyCoupon(code));
    setCouponInput('');
    toast.success(`${t('Coupon applied')}: ${coupon.code}`);
  };

  const handleRemoveCoupon = () => {
    dispatch(clearCoupon());
    setCouponInput('');
    setCouponError('');
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.address) {
      toast.error(t('Please complete shipping details'));
      return;
    }
    if (!isTenDigitPhone(formData.phone.trim())) {
      toast.error(t('Please enter a valid 10-digit phone number'));
      return;
    }
    if (!formData.email.trim().match(/^\S+@\S+\.\S+$/)) {
      toast.error(t('Please enter a valid email address'));
      return;
    }
    if (!formData.city.trim()) {
      toast.error(t('Please enter your city'));
      return;
    }
    if (!isSixDigitPincode(formData.pincode.trim())) {
      toast.error(t('Please enter a valid 6-digit pincode'));
      return;
    }
    if (cart.length === 0) {
      toast.error(t('Your cart is empty'));
      return;
    }

    setIsProcessing(true);
    try {
      const payload = {
        items: cart.map((item) => ({ productId: Number(item.id), quantity: item.quantity })),
        couponCode,
        customer: {
          name: formData.name,
          firstName: formData.name,
          phone: formData.phone,
          email: formData.email,
          address: formData.address,
          city: formData.city,
          postcode: formData.pincode,
        },
      };

      const res = await fetch('/api/payments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok || !data.redirectUrl) {
        throw new Error(data.message || 'Could not start payment');
      }
      router.push('/payment');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('Could not create order. Please try again.'));
      setIsProcessing(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="py-20 bg-slate-50 min-h-screen flex items-center justify-center">
        <div className="bg-white p-10 rounded-3xl border border-slate-200 shadow-card max-w-md w-full text-center space-y-4">
          <div className="w-16 h-16 bg-yellow-100 text-amber-700 rounded-full flex items-center justify-center mx-auto">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-bold font-heading text-navy-900">{t('Your cart is empty')}</h1>
          <p className="text-xs text-slate-500">
            {t('Add books from the publication store to proceed with checkout.')}
          </p>
          <Link
            href="/books"
            className="inline-block px-6 py-3 bg-navy-900 hover:bg-brand-600 text-white text-xs font-bold rounded-xl transition-colors"
          >
            {t('Browse Books')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <h1 className="text-3xl font-black font-heading text-navy-900 mb-8">{t('Secure Checkout')}</h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Shipping Details */}
          <div className="lg:col-span-7">
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-card space-y-6">
              <h3 className="text-xl font-bold font-heading text-navy-900">{t('Shipping & Contact Details')}</h3>

              <form onSubmit={handlePlaceOrder} id="checkout-form" className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-navy-900 mb-1">{t('Full Name *')}</label>
                    <input
                      type="text"
                      required
                      placeholder="Rahul Sharma"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-500 text-navy-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-navy-900 mb-1">{t('Phone Number *')}</label>
                    <input
                      type="tel"
                      inputMode="numeric"
                      maxLength={10}
                      pattern="[0-9]{10}"
                      required
                      placeholder="9876543210"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: digitsOnly(e.target.value, 10) })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-500 text-navy-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-navy-900 mb-1">{t('Email *')}</label>
                  <input
                    type="email"
                    required
                    placeholder="rahul@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-500 text-navy-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-navy-900 mb-1">{t('Delivery Address *')}</label>
                  <textarea
                    rows={3}
                    required
                    placeholder={t('House / Flat No, Street, Landmark')}
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-500 text-navy-900"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-navy-900 mb-1">{t('City / District *')}</label>
                    <input
                      type="text"
                      required
                      placeholder="Jaipur / Bhilwara"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-500 text-navy-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-navy-900 mb-1">{t('Pincode *')}</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      pattern="[0-9]{6}"
                      required
                      placeholder="302001"
                      value={formData.pincode}
                      onChange={(e) => setFormData({ ...formData, pincode: digitsOnly(e.target.value, 6) })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-500 text-navy-900"
                    />
                  </div>
                </div>
              </form>
            </div>
          </div>

          {/* Summary & Payment */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-card space-y-4">
              <h3 className="text-lg font-bold font-heading text-navy-900">{t('Order Summary')} ({cart.length})</h3>

              <div className="space-y-3 max-h-60 overflow-y-auto">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-xs border-b border-slate-100 pb-2">
                    <span className="font-semibold text-navy-900 truncate max-w-[200px]">{language === 'hi' ? BOOK_HI[item.id]?.title ?? item.title : item.title} x {item.quantity}</span>
                    <span className="font-bold text-brand-600">₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>

              <div className="pt-2 space-y-1.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>{t('Subtotal')}</span>
                  <span className="font-bold text-navy-900">₹{totals.subtotal}</span>
                </div>
                {totals.discount > 0 && (
                  <div className="flex justify-between">
                    <span>{totals.discountLabel || t('Discount')}</span>
                    <span className="font-bold text-emerald-600">-₹{totals.discount}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>{settings?.shipping.label ?? t('Delivery Charges')}</span>
                  <span className="font-bold text-navy-900">
                    {!settingsLoaded ? (
                      <span className="inline-block h-3 w-10 animate-pulse rounded bg-slate-200 align-middle" />
                    ) : totals.shipping > 0 ? (
                      `₹${totals.shipping}`
                    ) : (
                      t('FREE')
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-navy-900 font-black text-base pt-2 border-t border-slate-200">
                  <span>{t('Total Payable')}</span>
                  <span className="text-brand-600">
                    {!settingsLoaded ? (
                      <span className="inline-block h-3.5 w-12 animate-pulse rounded bg-slate-200 align-middle" />
                    ) : (
                      `₹${totals.total}`
                    )}
                  </span>
                </div>
              </div>

              {/* Coupon */}
              <div className="pt-4 border-t border-slate-200">
                {couponCode ? (
                  <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-xl px-3.5 py-2.5">
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-emerald-600 shrink-0" />
                      <div>
                        <p className="text-xs font-black text-emerald-700">{couponCode}</p>
                        {totals.discount > 0 && (
                          <p className="text-[11px] text-emerald-600">-₹{totals.discount} applied</p>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="p-1.5 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-100 rounded-lg transition-colors"
                      aria-label={t('Remove coupon')}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div>
                    <p className="text-xs font-bold text-navy-900 mb-1.5">
                      {t('Have a coupon?')}
                    </p>
                    <div className="flex gap-2">
                      <input
                        value={couponInput}
                        onChange={(e) => {
                          setCouponInput(e.target.value.toUpperCase());
                          setCouponError('');
                        }}
                        placeholder="e.g. AP10"
                        className="flex-1 px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-bold uppercase focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500"
                      />
                      <button
                        type="button"
                        onClick={handleApplyCoupon}
                        disabled={!settingsLoaded}
                        className="px-4 py-2.5 bg-navy-900 enabled:hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl transition-colors"
                      >
                        {t('Apply')}
                      </button>
                    </div>
                    {couponError && (
                      <p className="text-[11px] font-semibold text-red-600 mt-1.5">{couponError}</p>
                    )}
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-slate-200 space-y-2.5">
                <h3 className="text-sm font-bold font-heading text-navy-900">{t('Payment Method')}</h3>

                <button
                  type="button"
                  className="w-full flex items-start gap-3 p-3.5 rounded-2xl border-2 border-brand-500 bg-brand-50 text-left"
                >
                  <Smartphone className="w-5 h-5 mt-0.5 shrink-0 text-brand-600" />
                  <span className="flex-1">
                    <span className="block text-xs font-bold text-navy-900">{t('PhonePe UPI / Cards / NetBanking')}</span>
                    <span className="block text-[11px] text-slate-500 mt-0.5">
                      {t('All UPI apps, Debit and Credit Cards, and NetBanking accepted')}
                    </span>
                  </span>
                  <span className="w-4 h-4 mt-1 rounded-full border-2 shrink-0 flex items-center justify-center border-brand-500">
                    <span className="w-2 h-2 rounded-full bg-brand-500" />
                  </span>
                </button>
              </div>

              <button
                type="submit"
                form="checkout-form"
                disabled={isProcessing}
                className="w-full py-4 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-sm rounded-2xl shadow-button-glow transition-all flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{t('Proceeding to Payment...')}</span>
                  </>
                ) : (
                  <>
                    <span>{t('Place Order & Pay via PhonePe')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
