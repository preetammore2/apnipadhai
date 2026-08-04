'use client';

import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send, MessageSquare, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export default function ContactPage() {
  const [formState, setFormState] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.name || !formState.phone || !formState.message) {
      toast.error('Please fill in required fields');
      return;
    }
    setSubmitted(true);
    toast.success('Your message has been sent successfully!');
  };

  return (
    <div className="py-12 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto">
          <span className="text-xs font-bold text-brand-600 uppercase tracking-widest bg-brand-100/80 px-3.5 py-1.5 rounded-full">
            NEED ASSISTANCE?
          </span>
          <h1 className="text-3xl sm:text-5xl font-black font-heading text-navy-900 mt-3">
            Contact & Support Center
          </h1>
          <p className="text-slate-600 text-sm sm:text-base mt-2">
            Have questions regarding online courses, book order tracking, or counseling? We are here to help!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Contact Details Column */}
          <div className="lg:col-span-5 space-y-6">
            
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-card space-y-6">
              <h3 className="text-xl font-bold font-heading text-navy-900">Head Office Information</h3>

              <div className="space-y-4 text-xs sm:text-sm text-slate-600">
                <div className="flex items-start gap-3">
                  <div className="p-3 bg-brand-50 text-brand-600 rounded-2xl shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-navy-900">Office Address</h4>
                    <p className="text-slate-500 mt-0.5">
                      House No.214, Ward No.20, Balla Niwas, Chittor Road, Behind Dangi Factory, Azad Nagar, Bhilwara, Rajasthan, 311001
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-navy-900">Helpline Phone & WhatsApp</h4>
                    <a href="tel:+917568716768" className="text-brand-600 font-bold block mt-0.5">
                      +91 7568716768
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-navy-900">Support Email</h4>
                    <a href="mailto:support@apnipadhaipublication.com" className="text-slate-600 block mt-0.5">
                      support@apnipadhaipublication.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-navy-900">Working Hours</h4>
                    <p className="text-slate-500 mt-0.5">Monday to Saturday: 9:00 AM – 7:00 PM IST</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Action WhatsApp Banner */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-6 rounded-3xl shadow-xl flex items-center justify-between gap-4">
              <div>
                <h4 className="font-bold text-base">Instant WhatsApp Support</h4>
                <p className="text-xs text-emerald-100 mt-0.5">Get quick answers regarding course admissions</p>
              </div>
              <a
                href="https://wa.me/917568716768"
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2.5 bg-white text-emerald-800 font-bold text-xs rounded-xl hover:bg-emerald-50 transition-colors shrink-0"
              >
                Chat on WhatsApp
              </a>
            </div>

          </div>

          {/* Contact Form Column */}
          <div className="lg:col-span-7">
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-card">
              <h3 className="text-xl font-bold font-heading text-navy-900 mb-6">Send Us a Message</h3>

              {submitted ? (
                <div className="py-12 text-center space-y-4">
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h4 className="text-xl font-bold text-navy-900">Message Sent Successfully!</h4>
                  <p className="text-sm text-slate-500 max-w-sm mx-auto">
                    Thank you for reaching out. Our support team will get back to you within 24 business hours.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-navy-900 mb-1.5 uppercase tracking-wider">Your Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="Rahul Sharma"
                        value={formState.name}
                        onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-500 text-navy-900"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-navy-900 mb-1.5 uppercase tracking-wider">Phone Number *</label>
                      <input
                        type="tel"
                        required
                        placeholder="9876543210"
                        value={formState.phone}
                        onChange={(e) => setFormState({ ...formState, phone: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-500 text-navy-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-navy-900 mb-1.5 uppercase tracking-wider">Email Address</label>
                    <input
                      type="email"
                      placeholder="rahul@example.com"
                      value={formState.email}
                      onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-500 text-navy-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-navy-900 mb-1.5 uppercase tracking-wider">Subject</label>
                    <input
                      type="text"
                      placeholder="Book Delivery / Course Access Query"
                      value={formState.subject}
                      onChange={(e) => setFormState({ ...formState, subject: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-500 text-navy-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-navy-900 mb-1.5 uppercase tracking-wider">Message *</label>
                    <textarea
                      rows={4}
                      required
                      placeholder="Write your query in detail..."
                      value={formState.message}
                      onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-500 text-navy-900"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-4 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white font-bold rounded-2xl shadow-button-glow transition-all flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>Submit Query</span>
                  </button>
                </form>
              )}
            </div>
          </div>

        </div>

        {/* Embedded Google Map */}
        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-card overflow-hidden">
          <h3 className="text-base font-bold font-heading text-navy-900 p-2 mb-2">Our Office Location (Bhilwara, Rajasthan)</h3>
          <div className="relative h-80 w-full rounded-2xl overflow-hidden border border-slate-200">
            <iframe
              title="Apni Padhai Office Map Location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14500.0!2d74.6!3d25.35!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjXCsDIxJzAwLjAiTiA3NMKwMzYnMDAuMCJF!5e0!3m2!1sen!2sin!4v1600000000000!5m2!1sen!2sin"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
            />
          </div>
        </div>

      </div>
    </div>
  );
}
