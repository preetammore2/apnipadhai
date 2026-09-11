'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Download,
  ExternalLink,
  FileText,
  GraduationCap,
  ImageIcon,
  Images,
  LayoutTemplate,
  Loader2,
  MessageSquareQuote,
  Quote,
  Settings2,
  ShieldCheck,
} from 'lucide-react';
import LogoutButton from '@/app/admin/components/LogoutButton';

interface Tile {
  href: string;
  title: string;
  desc: string;
  icon: React.ReactNode;
  bg: string;
}

const TILE_ICON = 'w-6 h-6';

const ALL_TILES: Tile[] = [
  {
    href: '/admin/books',
    title: 'Books Management',
    desc: 'Add, edit or delete books — synced to your WooCommerce store and mirrored to Firebase.',
    icon: <BookOpen className={TILE_ICON} />,
    bg: 'bg-brand-100 text-brand-700',
  },
  {
    href: '/admin/content',
    title: 'Site Content',
    desc: 'Edit the hero, testimonials, FAQs and courses shown on the site. Saved to Firebase and picked up automatically.',
    icon: <Settings2 className={TILE_ICON} />,
    bg: 'bg-navy-100 text-navy-700',
  },
  {
    href: '/admin/updates',
    title: 'Updates & Blog',
    desc: 'Write and manage blog updates, published on the site.',
    icon: <FileText className={TILE_ICON} />,
    bg: 'bg-amber-100 text-amber-700',
  },
  {
    href: '/admin/feedback',
    title: 'Feedback',
    desc: 'Manage student feedback and reviews shown on the site.',
    icon: <MessageSquareQuote className={TILE_ICON} />,
    bg: 'bg-emerald-100 text-emerald-700',
  },
  {
    href: '/admin/results',
    title: 'Results & Selections',
    desc: 'Manage rankers and selections — Firebase entries merged with the WordPress photo-wall.',
    icon: <ImageIcon className={TILE_ICON} />,
    bg: 'bg-blue-100 text-blue-700',
  },
  {
    href: '/admin/pyqs',
    title: 'Previous Year Papers',
    desc: 'Add, edit or delete PYQ PDFs — Firebase entries merged with the WordPress download list.',
    icon: <Download className={TILE_ICON} />,
    bg: 'bg-rose-100 text-rose-700',
  },
  {
    href: '/admin/pages',
    title: 'Pages',
    desc: 'Edit the content of policies, careers, about and other info pages.',
    icon: <LayoutTemplate className={TILE_ICON} />,
    bg: 'bg-purple-100 text-purple-700',
  },
  {
    href: '/admin/hero-slider',
    title: 'Hero Slider',
    desc: 'Add, reorder or remove the homepage banner slides. Changes appear on the site within a minute.',
    icon: <Images className={TILE_ICON} />,
    bg: 'bg-orange-100 text-orange-700',
  },
  {
    href: '/admin/courses',
    title: 'Courses',
    desc: 'Manage the course cards on the homepage — title, description, link, tag and features.',
    icon: <GraduationCap className={TILE_ICON} />,
    bg: 'bg-teal-100 text-teal-700',
  },
  {
    href: '/admin/testimonials',
    title: 'Testimonials',
    desc: 'Manage student success stories shown on the homepage — add photos, reorder and delete.',
    icon: <Quote className={TILE_ICON} />,
    bg: 'bg-pink-100 text-pink-700',
  },
  {
    href: '/admin/sample-pdfs',
    title: 'Sample PDFs',
    desc: 'Attach or remove free sample chapter PDFs for each book on /book-sample-pdf.',
    icon: <FileText className={TILE_ICON} />,
    bg: 'bg-cyan-100 text-cyan-700',
  },
];

const MODERATOR_TILES: Tile[] = [
  {
    href: '/admin/books',
    title: 'Books Management',
    desc: 'Upload or change book cover images. All other book details and admin areas are read-only for you.',
    icon: <BookOpen className={TILE_ICON} />,
    bg: 'bg-brand-100 text-brand-700',
  },
];

export default function AdminDashboardPage() {
  const [role, setRole] = useState<'admin' | 'moderator' | null>(null);

  useEffect(() => {
    let ignore = false;
    fetch('/api/admin/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { role?: string } | null) => {
        if (ignore) return;
        setRole(data?.role === 'moderator' ? 'moderator' : 'admin');
      })
      .catch(() => {
        if (!ignore) setRole('admin');
      });
    return () => {
      ignore = true;
    };
  }, []);

  const isModerator = role === 'moderator';

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="bg-navy-900 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
              <Settings2 className="w-5 h-5" />
            </span>
            <div>
              <h1 className="text-lg font-black font-heading leading-none">Admin Dashboard</h1>
              <p className="text-xs text-white/60 mt-1">
                {isModerator ? 'Moderator — image access only' : 'Apni Padhai Publication'}
              </p>
            </div>
          </div>
          <LogoutButton />
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {role === null ? (
          <div className="flex items-center justify-center py-20 text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : (
          <>
            {isModerator && (
              <div className="flex items-start gap-3 bg-sky-50 border border-sky-200 rounded-2xl px-4 py-3 mb-6 text-sm text-sky-900">
                <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5" />
                <p>
                  You are signed in as a <strong>moderator</strong> and can only upload or change
                  book cover images. Editing books, prices, results, PYQs and other data requires an
                  admin account.
                </p>
              </div>
            )}
            <div className="grid sm:grid-cols-2 gap-4">
              {(isModerator ? MODERATOR_TILES : ALL_TILES).map((tile) => (
                <Link
                  key={tile.title}
                  href={tile.href}
                  className="group bg-white rounded-3xl border border-slate-100 shadow-sm p-6 hover:shadow-md hover:-translate-y-0.5 transition-all"
                >
                  <span
                    className={`w-12 h-12 ${tile.bg} rounded-2xl flex items-center justify-center mb-4`}
                  >
                    {tile.icon}
                  </span>
                  <h2 className="text-lg font-black font-heading text-navy-900 flex items-center gap-2">
                    {tile.title}
                    <ExternalLink className="w-4 h-4 text-slate-300 group-hover:text-brand-500 transition-colors" />
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">{tile.desc}</p>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}