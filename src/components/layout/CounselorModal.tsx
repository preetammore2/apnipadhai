'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Phone, CheckCircle2, User, Send, GraduationCap, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { setCounselorModalOpen } from '@/redux/features/ui/uiSlice';
import { useTranslation } from '@/i18n/useTranslation';
import { digitsOnly, isTenDigitPhone } from '@/lib/validation';

interface CounselorModalProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const CounselorModal: React.FC<CounselorModalProps> = ({ isOpen: propIsOpen, onClose: propOnClose }) => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
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

  const WHATSAPP_NUMBER = '917568716768';
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    `Hello Apni Padhai! ${studentName ? `I am ${studentName}. ` : ''}I would like to talk to a counselor${
      targetExam ? ` for ${targetExam}` : ''
    }.`,
  )}`;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName || !phone) {
      toast.error(t('Please enter name and phone number'));
      return;
    }
    if (!isTenDigitPhone(phone)) {
      toast.error(t('Please enter a valid 10-digit phone number'));
      return;
    }
    setIsSubmitted(true);
    toast.success(t('Counseling Callback Requested Successfully!'));
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
          <h3 className="text-xl font-bold font-heading text-navy-900">{t('Request Received!')}</h3>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            {t('Our Lead Academic Counselor will call you at')} <strong className="text-navy-900">{phone}</strong> {t('within 15 minutes.')}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-yellow-100 text-amber-800 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
              <Phone className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-black font-heading text-navy-900">{t('Talk to Academic Counselor')}</h3>
            <p className="text-xs text-slate-500">
              {t("Get personalized guidance on batch selection, exam strategy & Brahmastra books from Rohit Sir's team.")}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-navy-900 mb-1">{t('Your Full Name *')}</label>
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
              <label className="block text-xs font-bold text-navy-900 mb-1">{t('Phone Number (For Callback) *')}</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  pattern="[0-9]{10}"
                  required
                  placeholder="9876543210"
                  value={phone}
                  onChange={(e) => setPhone(digitsOnly(e.target.value, 10))}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-yellow-500 text-navy-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-navy-900 mb-1">{t('Target Exam')}</label>
              <div className="relative">
                <GraduationCap className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <select
                  value={targetExam}
                  onChange={(e) => setTargetExam(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-yellow-500 text-navy-900 font-medium"
                >
                  <option value="CET 2026">{t('Rajasthan CET 2026')}</option>
                  <option value="Sub Inspector">{t('Rajasthan Sub Inspector (SI)')}</option>
                  <option value="SSC GD">{t('SSC GD Foundation')}</option>
                  <option value="RAS Pre+Mains">{t('RAS Pre + Mains Integrated')}</option>
                  <option value="High Court LDC">{t('High Court LDC / Group D')}</option>
                  <option value="Rajasthan GK">{t('Rajasthan GK Brahmastra')}</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-yellow-400 hover:to-amber-500 text-navy-950 font-black text-xs rounded-xl shadow-button-glow transition-all flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>{t('Request Call Back Now')}</span>
            </button>

            <div className="relative py-3">
              <div className="border-t border-slate-200" />
              <span className="absolute left-1/2 -translate-x-1/2 -top-2.5 bg-white px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                {t('OR')}
              </span>
            </div>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              <span>{t('Chat with Counselor on WhatsApp')}</span>
            </a>
            <p className="text-[10px] font-semibold text-slate-400 text-center">
              {t('WhatsApp Helpline:')} <span className="text-emerald-600">+91 75687 16768</span>
            </p>
          </form>
        </div>
      )}
    </Modal>
  );
};
