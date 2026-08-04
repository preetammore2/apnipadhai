'use client';

import React, { useState } from 'react';
import { CAREERS_DATA } from '@/data/careers';
import { CareerOpening } from '@/types';
import { Briefcase, MapPin, Clock, CheckCircle2, Send, Building } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { toast } from 'sonner';

export default function CareersPage() {
  const [selectedJob, setSelectedJob] = useState<CareerOpening | null>(null);
  const [applicantName, setApplicantName] = useState('');
  const [applicantPhone, setApplicantPhone] = useState('');
  const [isApplied, setIsApplied] = useState(false);

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!applicantName || !applicantPhone) {
      toast.error('Please enter name and phone');
      return;
    }
    setIsApplied(true);
    toast.success('Application Submitted Successfully!');
    setTimeout(() => {
      setIsApplied(false);
      setSelectedJob(null);
    }, 2000);
  };

  return (
    <div className="py-12 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Banner */}
        <div className="text-center max-w-3xl mx-auto">
          <span className="text-xs font-bold text-brand-600 uppercase tracking-widest bg-brand-100/80 px-3.5 py-1.5 rounded-full">
            JOIN OUR TEAM
          </span>
          <h1 className="text-3xl sm:text-5xl font-black font-heading text-navy-900 mt-3">
            Careers at Apni Padhai
          </h1>
          <p className="text-slate-600 text-sm sm:text-base mt-2">
            Build the future of EdTech with us. We are looking for passionate subject experts, content writers, video editors, and layout designers.
          </p>
        </div>

        {/* Job Cards List */}
        <div className="space-y-6 max-w-4xl mx-auto">
          {CAREERS_DATA.map((job) => (
            <div
              key={job.id}
              className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-card hover:shadow-card-hover transition-all space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="px-3 py-1 bg-brand-50 text-brand-700 text-xs font-bold rounded-full">
                    {job.department}
                  </span>
                  <h3 className="text-xl font-bold font-heading text-navy-900 mt-2">{job.title}</h3>
                  <div className="flex items-center gap-4 text-xs text-slate-500 mt-1">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-brand-500" /> {job.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-blue-500" /> {job.type} • {job.experience} Exp
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedJob(job)}
                  className="px-6 py-3 bg-navy-900 hover:bg-brand-600 text-white font-bold text-xs rounded-xl transition-colors shrink-0 shadow-sm"
                >
                  Apply Now
                </button>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{job.description}</p>

              <div className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
                {job.responsibilities.map((resp, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{resp}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Job Application Modal */}
      <Modal
        isOpen={!!selectedJob}
        onClose={() => setSelectedJob(null)}
        maxWidth="md"
        title={selectedJob ? `Apply: ${selectedJob.title}` : ''}
      >
        {isApplied ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-bold text-navy-900">Application Submitted!</h4>
            <p className="text-xs text-slate-500">Our HR team will contact you shortly.</p>
          </div>
        ) : (
          <form onSubmit={handleApply} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-navy-900 mb-1">Full Name *</label>
              <input
                type="text"
                required
                placeholder="Rahul Sharma"
                value={applicantName}
                onChange={(e) => setApplicantName(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-500 text-navy-900"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-navy-900 mb-1">Phone Number *</label>
              <input
                type="tel"
                required
                placeholder="9876543210"
                value={applicantPhone}
                onChange={(e) => setApplicantPhone(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-500 text-navy-900"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3.5 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl text-xs shadow-button-glow transition-all"
            >
              Submit Application
            </button>
          </form>
        )}
      </Modal>
    </div>
  );
}
