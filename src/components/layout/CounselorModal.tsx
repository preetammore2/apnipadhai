'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Phone, CheckCircle2, User, Send, GraduationCap } from 'lucide-react';
import { toast } from 'sonner';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { setCounselorModalOpen } from '@/redux/features/ui/uiSlice';

interface CounselorModalProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const CounselorModal: React.FC<CounselorModalProps> = ({ isOpen: propIsOpen, onClose: propOnClose }) => {
  const dispatch = useAppDispatch();
  const reduxIsOpen = useAppSelector((state) => state.ui.isCounselorModalOpen);
  const isOpen = propIsOpen !== undefined ? propIsOpen : reduxIsOpen;

  const handleClose = () => {
    dispatch(setCounselorModalOpen(false));
    if (propOnClose) propOnClose();
  };

  const [studentName, setStudentName] = useState('');
  const [phone, setPhone] = useState('');
  const [targetExam, setTargetExam] = useState('CET 2026');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName || !phone) {
      toast.error('Please enter name and phone number');
      return;
    }
    setIsSubmitted(true);
    toast.success('Counseling Callback Requested Successfully!');
    setTimeout(() => {
      setIsSubmitted(false);
      handleClose();
    }, 2200);
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} maxWidth="md">
      {isSubmitted ? (
        <div className="py-8 text-center space-y-3">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-bold font-heading text-navy-900">Request Received!</h3>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            Our Lead Academic Counselor will call you at <strong className="text-navy-900">{phone}</strong> within 15 minutes.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-yellow-100 text-amber-800 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
              <Phone className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-black font-heading text-navy-900">Talk to Academic Counselor</h3>
            <p className="text-xs text-slate-500">
              Get personalized guidance on batch selection, exam strategy & Brahmastra books from Rohit Sir's team.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-navy-900 mb-1">Your Full Name *</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="Rahul Sharma"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-yellow-500 text-navy-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-navy-900 mb-1">Phone Number (For Callback) *</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  required
                  placeholder="9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-yellow-500 text-navy-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-navy-900 mb-1">Target Exam</label>
              <div className="relative">
                <GraduationCap className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <select
                  value={targetExam}
                  onChange={(e) => setTargetExam(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-yellow-500 text-navy-900 font-medium"
                >
                  <option value="CET 2026">Rajasthan CET 2026</option>
                  <option value="Sub Inspector">Rajasthan Sub Inspector (SI)</option>
                  <option value="SSC GD">SSC GD Foundation</option>
                  <option value="RAS Pre+Mains">RAS Pre + Mains Integrated</option>
                  <option value="High Court LDC">High Court LDC / Group D</option>
                  <option value="Rajasthan GK">Rajasthan GK Brahmastra</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-yellow-400 hover:to-amber-500 text-navy-950 font-black text-xs rounded-xl shadow-button-glow transition-all flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>Request Call Back Now</span>
            </button>
          </form>
        </div>
      )}
    </Modal>
  );
};
