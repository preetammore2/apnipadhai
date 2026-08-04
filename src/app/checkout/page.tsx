'use client';

import React, { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { ShieldCheck, Truck, ArrowRight, CheckCircle2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { toast } from 'sonner';

export default function CheckoutPage() {
  const { cart, totalAmount, totalSavings, clearCart } = useCart();
  const [formData, setFormData] = useState({ name: '', phone: '', email: '', address: '', city: '', pincode: '', paymentMethod: 'upi' });
  const [isOrdered, setIsOrdered] = useState(false);

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.address) {
      toast.error('Please complete shipping details');
      return;
    }
    setIsOrdered(true);
    toast.success('Order Placed Successfully! Order ID: AP-' + Math.floor(100000 + Math.random() * 900000));
    clearCart();
  };

  if (isOrdered) {
    return (
      <div className="py-20 bg-slate-50 min-h-screen flex items-center justify-center">
        <div className="bg-white p-10 rounded-3xl border border-slate-200 shadow-card text-center max-w-md mx-auto space-y-4">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold font-heading text-navy-900">Order Confirmed!</h2>
          <p className="text-xs text-slate-500">
            Thank you for ordering with Apni Padhai Publication. Tracking updates will be sent to your phone number <span className="font-bold text-navy-900">{formData.phone}</span>.
          </p>
          <Link href="/dashboard" className="inline-block px-6 py-3 bg-brand-500 text-white rounded-xl text-xs font-bold shadow-button-glow">
            Go to Student Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <h1 className="text-3xl font-black font-heading text-navy-900 mb-8">Secure Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Shipping Details */}
          <div className="lg:col-span-7">
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-card space-y-6">
              <h3 className="text-xl font-bold font-heading text-navy-900">Shipping & Contact Details</h3>

              <form onSubmit={handlePlaceOrder} id="checkout-form" className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-navy-900 mb-1">Full Name *</label>
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
                    <label className="block text-xs font-bold text-navy-900 mb-1">Phone Number *</label>
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
                  <label className="block text-xs font-bold text-navy-900 mb-1">Delivery Address *</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="House / Flat No, Street, Landmark"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-500 text-navy-900"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-navy-900 mb-1">City / District *</label>
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
                    <label className="block text-xs font-bold text-navy-900 mb-1">Pincode *</label>
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
              <h3 className="text-lg font-bold font-heading text-navy-900">Order Summary ({cart.length})</h3>

              <div className="space-y-3 max-h-60 overflow-y-auto">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-xs border-b border-slate-100 pb-2">
                    <span className="font-semibold text-navy-900 truncate max-w-[200px]">{item.title} x {item.quantity}</span>
                    <span className="font-bold text-brand-600">₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>

              <div className="pt-2 space-y-1.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Total Discount Savings</span>
                  <span className="font-bold text-emerald-600">-₹{totalSavings}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Charges</span>
                  <span className="font-bold text-emerald-600">FREE</span>
                </div>
                <div className="flex justify-between text-navy-900 font-black text-base pt-2 border-t border-slate-200">
                  <span>Total Payable</span>
                  <span className="text-brand-600">₹{totalAmount}</span>
                </div>
              </div>

              <button
                type="submit"
                form="checkout-form"
                className="w-full py-4 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white font-bold text-sm rounded-2xl shadow-button-glow transition-all flex items-center justify-center gap-2"
              >
                <span>Place Order Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
