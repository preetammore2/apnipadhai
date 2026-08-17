'use client';

import Link from 'next/link';
import {
  BookOpen,
  Download,
  ExternalLink,
  FileText,
  ImageIcon,
  LayoutTemplate,
  MessageSquareQuote,
  Settings2,
} from 'lucide-react';
import LogoutButton from '@/app/admin/components/LogoutButton';

export default function AdminDashboardPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <header className="bg-navy-900 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
              <Settings2 className="w-5 h-5" />
            </span>
            <div>
              <h1 className="text-lg font-black font-heading leading-none">
                Admin Dashboard
              </h1>
              <p className="text-xs text-white/60 mt-1">
                Apni Padhai Publication
              </p>
            </div>
          </div>
          <LogoutButton />
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid sm:grid-cols-2 gap-4">
          <Link
            href="/admin/books"
            className="group bg-white rounded-3xl border border-slate-100 shadow-sm p-6 hover:shadow-md hover:-translate-y-0.5 transition-all"
          >
            <span className="w-12 h-12 bg-brand-100 text-brand-700 rounded-2xl flex items-center justify-center mb-4">
              <BookOpen className="w-6 h-6" />
            </span>
            <h2 className="text-lg font-black font-heading text-navy-900 flex items-center gap-2">
              Books Management
              <ExternalLink className="w-4 h-4 text-slate-300 group-hover:text-brand-500 transition-colors" />
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Add, edit or delete books — synced to your WooCommerce store and mirrored to MongoDB.
            </p>
          </Link>

          <Link
            href="/admin/content"
            className="group bg-white rounded-3xl border border-slate-100 shadow-sm p-6 hover:shadow-md hover:-translate-y-0.5 transition-all"
          >
            <span className="w-12 h-12 bg-navy-100 text-navy-700 rounded-2xl flex items-center justify-center mb-4">
              <Settings2 className="w-6 h-6" />
            </span>
            <h2 className="text-lg font-black font-heading text-navy-900 flex items-center gap-2">
              Site Content
              <ExternalLink className="w-4 h-4 text-slate-300 group-hover:text-brand-500 transition-colors" />
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Edit the hero, testimonials, FAQs and courses shown on the site.
              Saved to MongoDB and picked up automatically.
            </p>
          </Link>

          <Link
            href="/admin/updates"
            className="group bg-white rounded-3xl border border-slate-100 shadow-sm p-6 hover:shadow-md hover:-translate-y-0.5 transition-all"
          >
            <span className="w-12 h-12 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center mb-4">
              <FileText className="w-6 h-6" />
            </span>
            <h2 className="text-lg font-black font-heading text-navy-900 flex items-center gap-2">
              Updates & Blog
              <ExternalLink className="w-4 h-4 text-slate-300 group-hover:text-brand-500 transition-colors" />
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Write and manage blog updates, published on the site.
            </p>
          </Link>

          <Link
            href="/admin/feedback"
            className="group bg-white rounded-3xl border border-slate-100 shadow-sm p-6 hover:shadow-md hover:-translate-y-0.5 transition-all"
          >
            <span className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center mb-4">
              <MessageSquareQuote className="w-6 h-6" />
            </span>
            <h2 className="text-lg font-black font-heading text-navy-900 flex items-center gap-2">
              Feedback
              <ExternalLink className="w-4 h-4 text-slate-300 group-hover:text-brand-500 transition-colors" />
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Manage student feedback and reviews shown on the site.
            </p>
          </Link>

          <Link
            href="/admin/results"
            className="group bg-white rounded-3xl border border-slate-100 shadow-sm p-6 hover:shadow-md hover:-translate-y-0.5 transition-all"
          >
            <span className="w-12 h-12 bg-blue-100 text-blue-700 rounded-2xl flex items-center justify-center mb-4">
              <ImageIcon className="w-6 h-6" />
            </span>
            <h2 className="text-lg font-black font-heading text-navy-900 flex items-center gap-2">
              Results & Selections
              <ExternalLink className="w-4 h-4 text-slate-300 group-hover:text-brand-500 transition-colors" />
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Manage rankers and selections — MongoDB entries merged with the WordPress photo-wall.
            </p>
          </Link>

          <Link
            href="/admin/pyqs"
            className="group bg-white rounded-3xl border border-slate-100 shadow-sm p-6 hover:shadow-md hover:-translate-y-0.5 transition-all"
          >
            <span className="w-12 h-12 bg-rose-100 text-rose-700 rounded-2xl flex items-center justify-center mb-4">
              <Download className="w-6 h-6" />
            </span>
            <h2 className="text-lg font-black font-heading text-navy-900 flex items-center gap-2">
              Previous Year Papers
              <ExternalLink className="w-4 h-4 text-slate-300 group-hover:text-brand-500 transition-colors" />
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Add, edit or delete PYQ PDFs — MongoDB entries merged with the WordPress download list.
            </p>
          </Link>

          <Link
            href="/admin/pages"
            className="group bg-white rounded-3xl border border-slate-100 shadow-sm p-6 hover:shadow-md hover:-translate-y-0.5 transition-all"
          >
            <span className="w-12 h-12 bg-purple-100 text-purple-700 rounded-2xl flex items-center justify-center mb-4">
              <LayoutTemplate className="w-6 h-6" />
            </span>
            <h2 className="text-lg font-black font-heading text-navy-900 flex items-center gap-2">
              Pages
              <ExternalLink className="w-4 h-4 text-slate-300 group-hover:text-brand-500 transition-colors" />
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Edit the content of policies, careers, about and other info pages.
            </p>
          </Link>
        </div>
      </div>
    </main>
  );
}
