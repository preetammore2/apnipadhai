'use client';

import React, { useState } from 'react';
import { Send, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export const FeedbackForm: React.FC = () => {
  const [formState, setFormState] = useState({ name: '', exam: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.name || !formState.message) {
      toast.error('Please enter your name and feedback');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formState),
      });
      const data = await res.json().catch(() => ({ message: 'Something went wrong' }));
      if (!res.ok) {
        toast.error(data.message || 'Could not submit feedback');
        return;
      }
      setSubmitted(true);
      toast.success(data.message || 'Thank you for your feedback!');
    } catch {
      toast.error('Could not submit feedback. Please check your connection.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-white rounded-3xl border border-slate-100 shadow-card p-10 text-center max-w-2xl mx-auto">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-black font-heading text-navy-900">Thank You!</h2>
        <p className="text-sm text-slate-500 mt-2">
          Your feedback has been submitted. We review every message and will feature select reviews here.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-card p-8 max-w-2xl mx-auto">
      <h2 className="text-xl font-black font-heading text-navy-900 mb-1">
        Share Your Feedback
      </h2>
      <p className="text-sm text-slate-500 mb-6">
        Studied with Apni Padhai books, courses or mentorship? Tell us what you think.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-navy-900 mb-1.5 uppercase tracking-wider">
              Your Name *
            </label>
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
            <label className="block text-xs font-bold text-navy-900 mb-1.5 uppercase tracking-wider">
              Exam / Course
            </label>
            <input
              type="text"
              placeholder="RAS, REET, NEET..."
              value={formState.exam}
              onChange={(e) => setFormState({ ...formState, exam: e.target.value })}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-500 text-navy-900"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-navy-900 mb-1.5 uppercase tracking-wider">
            Your Feedback *
          </label>
          <textarea
            rows={4}
            required
            maxLength={2000}
            placeholder="Your experience with Apni Padhai..."
            value={formState.message}
            onChange={(e) => setFormState({ ...formState, message: e.target.value })}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-500 text-navy-900"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-4 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white font-bold rounded-2xl shadow-button-glow transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <Send className="w-4 h-4" />
          <span>{submitting ? 'Submitting...' : 'Submit Feedback'}</span>
        </button>
      </form>
    </div>
  );
};