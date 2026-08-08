'use client';

import React, { useEffect, useMemo } from 'react';
import { Modal } from '@/components/ui/Modal';
import Image from 'next/image';
import { CalendarDays, User, Clock, BookOpen, X, Newspaper } from 'lucide-react';
import { useTranslation } from '@/i18n/useTranslation';
import { WordPressPost } from '@/lib/wordpress';

interface BlogReaderModalProps {
  post: WordPressPost | null;
  onClose: () => void;
}

function formatDate(iso: string, locale: 'en' | 'hi'): string {
  try {
    return new Date(iso).toLocaleDateString(locale === 'hi' ? 'hi-IN' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return iso;
  }
}

function estimateReadTime(content: string): number {
  const words = content.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

export const BlogReaderModal: React.FC<BlogReaderModalProps> = ({ post, onClose }) => {
  const { t, language } = useTranslation();

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (post) {
      window.addEventListener('keydown', handleKey);
      return () => window.removeEventListener('keydown', handleKey);
    }
  }, [post, onClose]);

  // Neutralize external links inside the article so the reader never redirects away.
  const safeHtml = useMemo(() => {
    if (!post?.contentHtml) return '';
    return post.contentHtml
      .replace(/<a\s+[^>]*href=["'][^"']*["'][^>]*>/gi, '<span>')
      .replace(/<\/a>/gi, '</span>');
  }, [post]);

  if (!post) return null;

  return (
    <Modal isOpen={!!post} onClose={onClose} maxWidth="4xl" title={t('Read Blog Article')}>
      <div className="max-h-[75vh] overflow-y-auto -m-6 sm:-m-6">
        {/* Cover */}
        <div className="relative h-52 sm:h-72 w-full bg-gradient-to-br from-amber-100 via-yellow-50 to-amber-200 overflow-hidden">
          {post.imageUrl ? (
            <Image
              src={post.imageUrl}
              alt={post.title}
              fill
              className="object-cover"
              unoptimized
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <Newspaper className="w-16 h-16 text-amber-400/70" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-navy-950/70 via-transparent to-transparent" />
          <span className="absolute bottom-4 left-4 px-3 py-1 bg-yellow-400 text-navy-950 text-[10px] font-black rounded-full uppercase tracking-wider">
            {post.categoryNames[0] ?? t('Blog')}
          </span>
        </div>

        <div className="p-6 sm:p-8">
          {/* Title */}
          <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-navy-900 leading-tight">
            {post.title}
          </h2>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-500 mt-4 pb-5 border-b border-slate-100">
            <span className="flex items-center gap-1.5 font-bold text-navy-900">
              <User className="w-3.5 h-3.5 text-amber-600" /> {post.author}
            </span>
            <span className="flex items-center gap-1.5">
              <CalendarDays className="w-3.5 h-3.5 text-amber-600" /> {formatDate(post.date, language)}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-600" /> {t('{0} min read', estimateReadTime(post.content))}
            </span>
            <span className="flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-amber-600" /> {post.categoryNames.join(', ')}
            </span>
          </div>

          {/* Body */}
          {safeHtml ? (
            <div
              className="blog-prose mt-6 text-sm sm:text-base leading-relaxed text-slate-700"
              dangerouslySetInnerHTML={{ __html: safeHtml }}
            />
          ) : (
            <div className="mt-6 text-sm sm:text-base leading-relaxed text-slate-700 whitespace-pre-line">
              {post.content}
            </div>
          )}

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-full flex items-center justify-center text-white font-black text-sm shrink-0">
                AP
              </div>
              <div>
                <p className="text-xs font-bold text-navy-900">Apni Padhai Publication</p>
                <p className="text-[10px] text-slate-500">{t('India\'s Smart Learning Platform')}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-navy-900 hover:bg-brand-600 text-white text-xs font-black rounded-xl transition-colors"
            >
              <X className="w-4 h-4" />
              <span>{t('Close Article')}</span>
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
