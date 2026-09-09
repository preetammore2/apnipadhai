'use client';

import React, { useState } from 'react';
import {
  User,
  Phone,
  Mail,
  FileText,
  Briefcase,
  Send,
  CheckCircle2,
  UploadCloud,
  PencilLine,
} from 'lucide-react';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { digitsOnly, isTenDigitPhone } from '@/lib/validation';

const APPLY_ROLES = [
  'Subject Expert / Faculty',
  'Content Writer / Curriculum Developer',
  'Video Editor',
  'Graphic / Layout Designer',
  'Social Media / Digital Marketing',
  'Sales / Counselling Executive',
  'Customer Support Executive',
  'Other',
];

const RESUME_MAX_MB = 5;
const RESUME_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

export default function CareersPage() {
  const [formState, setFormState] = useState({
    name: '',
    phone: '',
    email: '',
    appliedFor: '',
    otherRole: '',
  });
  const [resume, setResume] = useState<File | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleResumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!RESUME_TYPES.includes(file.type)) {
      toast.error('Please upload your resume as a PDF or DOCX file.');
      e.target.value = '';
      return;
    }
    if (file.size > RESUME_MAX_MB * 1024 * 1024) {
      toast.error(`Resume must be under ${RESUME_MAX_MB} MB.`);
      e.target.value = '';
      return;
    }
    setResume(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.name.trim()) {
      toast.error('Please enter your full name');
      return;
    }
    if (!isTenDigitPhone(formState.phone)) {
      toast.error('Please enter a valid 10-digit phone number');
      return;
    }
    if (formState.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formState.email)) {
      toast.error('Please enter a valid email address');
      return;
    }
    if (!formState.appliedFor) {
      toast.error('Please select the position you are applying for');
      return;
    }
    if (formState.appliedFor === 'Other' && !formState.otherRole.trim()) {
      toast.error('Please type the role you are applying for');
      return;
    }
    if (!resume) {
      toast.error('Please upload your resume');
      return;
    }

    setSubmitting(true);
    try {
      const form = new FormData();
      form.append('name', formState.name.trim());
      form.append('phone', formState.phone);
      form.append('email', formState.email.trim());
      form.append(
        'appliedFor',
        formState.appliedFor === 'Other' ? 'Other' : formState.appliedFor,
      );
      form.append('otherRole', formState.appliedFor === 'Other' ? formState.otherRole.trim() : '');
      form.append('resume', resume);

      const res = await fetch('/api/careers/apply', { method: 'POST', body: form });
      const data = (await res.json().catch(() => ({}))) as { error?: string };

      if (!res.ok) {
        toast.error(data.error ?? 'Something went wrong. Please try again.');
        return;
      }

      setSubmitted(true);
      toast.success('Your application has been submitted successfully!');
    } catch (error) {
      console.error('[careers] submit failed', error);
      toast.error('Network error. Please check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const inputClassName =
    'w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-500 text-navy-900';

  return (
    <div className="py-12 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto">
          <span className="text-xs font-bold text-brand-600 uppercase tracking-widest bg-brand-100/80 px-3.5 py-1.5 rounded-full">
            JOIN OUR TEAM
          </span>
          <h1 className="text-3xl sm:text-5xl font-black font-heading text-navy-900 mt-3">
            Careers at Apni Padhai
          </h1>
          <p className="text-slate-600 text-sm sm:text-base mt-2">
            Build the future of EdTech with us. We are looking for passionate subject experts,
            content writers, video editors, and layout designers.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {submitted ? (
            <div className="bg-white p-10 sm:p-14 rounded-3xl border border-slate-200 shadow-card text-center space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold font-heading text-navy-900">
                Application Submitted Successfully!
              </h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto">
                Thank you for applying at Apni Padhai. Our HR team will review your resume and get
                back to you within a few business days.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-card">
              <div className="mb-8">
                <h3 className="text-xl font-bold font-heading text-navy-900">Apply Now</h3>
                <p className="text-sm text-slate-500 mt-1">
                  Fill in your details below and attach your resume (PDF or DOCX). Fields marked *
                  are required.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Name */}
                <div>
                  <label className="block text-xs font-bold text-navy-900 mb-1.5 uppercase tracking-wider">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="Rahul Sharma"
                      value={formState.name}
                      onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                      className={inputClassName}
                    />
                  </div>
                </div>

                {/* Phone + Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-navy-900 mb-1.5 uppercase tracking-wider">
                      Phone Number *
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="tel"
                        inputMode="numeric"
                        maxLength={10}
                        pattern="[0-9]{10}"
                        required
                        placeholder="9876543210"
                        value={formState.phone}
                        onChange={(e) => setFormState({ ...formState, phone: digitsOnly(e.target.value, 10) })}
                        className={inputClassName}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-navy-900 mb-1.5 uppercase tracking-wider">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="email"
                        placeholder="rahul@example.com"
                        value={formState.email}
                        onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                        className={inputClassName}
                      />
                    </div>
                  </div>
                </div>

                {/* Applied For */}
                <div>
                  <label className="block text-xs font-bold text-navy-900 mb-1.5 uppercase tracking-wider">
                    Applied For *
                  </label>
                  <div className="relative">
                    <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <select
                      required
                      value={formState.appliedFor}
                      onChange={(e) => setFormState({ ...formState, appliedFor: e.target.value })}
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-500 text-navy-900 appearance-none"
                    >
                      <option value="">Select a position</option>
                      {APPLY_ROLES.map((role) => (
                        <option key={role} value={role}>
                          {role}
                        </option>
                      ))}
                    </select>
                  </div>
                  {formState.appliedFor === 'Other' && (
                    <div className="relative mt-3">
                      <PencilLine className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Type the role you are applying for"
                        value={formState.otherRole}
                        onChange={(e) => setFormState({ ...formState, otherRole: e.target.value })}
                        className={inputClassName}
                      />
                    </div>
                  )}
                </div>

                {/* Resume Upload */}
                <div>
                  <label className="block text-xs font-bold text-navy-900 mb-1.5 uppercase tracking-wider">
                    Resume Upload * (PDF / DOCX, max {RESUME_MAX_MB} MB)
                  </label>
                  <label
                    className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-2xl px-6 py-8 cursor-pointer transition-colors ${
                      resume
                        ? 'border-emerald-400 bg-emerald-50/60'
                        : 'border-slate-300 bg-slate-50 hover:border-brand-400 hover:bg-brand-50/50'
                    }`}
                  >
                    {resume ? (
                      <>
                        <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center">
                          <FileText className="w-6 h-6" />
                        </div>
                        <span className="text-sm font-bold text-emerald-700">{resume.name}</span>
                        <span className="text-xs text-slate-400">
                          {(resume.size / 1024).toFixed(0)} KB — click to choose another file
                        </span>
                      </>
                    ) : (
                      <>
                        <div className="w-12 h-12 bg-brand-100 text-brand-600 rounded-2xl flex items-center justify-center">
                          <UploadCloud className="w-6 h-6" />
                        </div>
                        <span className="text-sm font-bold text-navy-900">
                          Click to upload your resume
                        </span>
                        <span className="text-xs text-slate-400">PDF or DOCX, up to {RESUME_MAX_MB} MB</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept=".pdf,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      onChange={handleResumeChange}
                      className="hidden"
                    />
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-4 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white font-bold rounded-2xl shadow-button-glow transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Sending Application...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Submit Application</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}