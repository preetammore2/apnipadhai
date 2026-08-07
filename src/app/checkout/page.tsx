'use client';

import React, { useState } from 'react';
import { useAppSelector } from '@/redux/hooks';
import { ArrowRight, Loader2, Tag } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from '@/i18n/useTranslation';
import { COURSE_HI, BOOK_HI } from '@/i18n/data';

export default function CheckoutPage() {
  const { t, language } = useTranslation();
  const cart = useAppSelector((state) => state.cart.items);
  const couponCode = useAppSelector((state) => state.cart.couponCode);
  const discountAmount = useAppSelector((state) => state.cart.discountAmount);
  const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalPayable = Math.max(0, totalAmount - discountAmount);
  const totalSavings = cart.reduce(
    (sum, item) => sum + (item.originalPrice - item.price) * item.quantity,
    0
  );
  const [formData, setFormData] = useState({ name: '', phone: '', email: '', address: '', city: '', pincode: '' });
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.address) {
      toast.error(t('Please complete shipping details'));
      return;
    }
    if (!formData.phone.trim().match(/^[0-9]{10}$/)) {
      toast.error(t('Please enter a valid 10-digit phone number'));
      return;
    }
    if (cart.length === 0) {
      toast.error(t('Your cart is empty'));
      return;
    }

    setIsProcessing(true);
    try {
      const res = await fetch('/api/payments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart.map((item) => ({ id: item.id, type: item.type, quantity: item.quantity })),
          couponCode,
          customer: {
            name: formData.name,
            phone: formData.phone,
            email: formData.email,
            address: formData.address,
            city: formData.city,
            pincode: formData.pincode,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.redirectUrl) {
        throw new Error(data.message || 'Payment initiation failed');
      }
      window.location.href = data.redirectUrl;
    } catch (error) {
      console.error('[checkout] payment initiation error', error);
      toast.error(t('Could not start payment. Please try again.'));
      setIsProcessing(false);
    }
  };

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
                      required
                      placeholder="9876543210"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-500 text-navy-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-navy-900 mb-1">{t('Email (optional)')}</label>
                  <input
                    type="email"
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
                      required
                      placeholder="302001"
                      value={formData.pincode}
                      onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
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
                    <span className="font-semibold text-navy-900 truncate max-w-[200px]">{language === 'hi' ? (item.type === 'course' ? COURSE_HI[item.id]?.title ?? item.title : BOOK_HI[item.id]?.title ?? item.title) : item.title} x {item.quantity}</span>
                    <span className="font-bold text-brand-600">₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>

              <div className="pt-2 space-y-1.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>{t('Total Discount Savings')}</span>
                  <span className="font-bold text-emerald-600">-₹{totalSavings}</span>
                </div>
                {couponCode && (
                  <div className="flex justify-between">
                    <span className="flex items-center gap-1">
                      <Tag className="w-3.5 h-3.5" /> {t('Coupon Discount')} ({couponCode})
                    </span>
                    <span className="font-bold text-emerald-600">-₹{discountAmount}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>{t('Delivery Charges')}</span>
                  <span className="font-bold text-emerald-600">{t('FREE')}</span>
                </div>
                <div className="flex justify-between text-navy-900 font-black text-base pt-2 border-t border-slate-200">
                  <span>{t('Total Payable')}</span>
                  <span className="text-brand-600">₹{totalPayable}</span>
                </div>
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
                    <span>{t('Redirecting to Payment...')}</span>
                  </>
                ) : (
                  <>
                    <span>{t('Place Order Now')}</span>
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
