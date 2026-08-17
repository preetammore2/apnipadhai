import { MessageSquareQuote } from 'lucide-react';
import { getApprovedFeedback } from '@/lib/feedback';
import { FeedbackWall } from './FeedbackWall';

export const metadata = {
  title: 'Student Feedback — Apni Padhai',
  description:
    'What students say about Apni Padhai books, courses and mentorship. Reviews and feedback from exam aspirants across Rajasthan and India.',
};

export default async function FeedbackPage() {
  const items = await getApprovedFeedback();

  return (
    <div className="py-12 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center max-w-3xl mx-auto">
          <span className="text-xs font-bold text-brand-600 uppercase tracking-widest bg-brand-100/80 px-3.5 py-1.5 rounded-full inline-flex items-center gap-1.5">
            <MessageSquareQuote className="w-3.5 h-3.5" /> STUDENT REVIEWS
          </span>
          <h1 className="text-3xl sm:text-5xl font-black font-heading text-navy-900 mt-3">
            Feedback from Our Students
          </h1>
          <p className="text-slate-600 text-sm sm:text-base mt-2">
            Real words from the aspirants who study, buy and learn with Apni Padhai.
          </p>
        </div>

        <FeedbackWall items={items} />
      </div>
    </div>
  );
}
