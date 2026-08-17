'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { CalendarDays, User, ArrowRight, Loader2, RefreshCw, WifiOff, Newspaper, Clock, BookOpen } from 'lucide-react';
import { useTranslation } from '@/i18n/useTranslation';
import { WordPressPost } from '@/lib/wordpress';
import { BlogReaderModal } from '@/components/blog/BlogReaderModal';

const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=800&q=80',
];

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

function estimateReadTime(content: string): string {
  const words = content.split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.round(words / 200));
  return `${minutes} min read`;
}

export const UpdatesSection: React.FC = () => {
  const { t, language } = useTranslation();
  const [posts, setPosts] = useState<WordPressPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedPost, setSelectedPost] = useState<WordPressPost | null>(null);

  const loadPosts = async () => {
    setIsLoading(true);
    setIsError(false);
    try {
      const res = await fetch('/api/posts');
      if (!res.ok) throw new Error('Failed to load posts');
      const data = (await res.json()) as WordPressPost[];
      setPosts(data);
    } catch {
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const categories = useMemo(() => {
    const set = new Set<string>(['All']);
    posts.forEach((post) => post.categoryNames.forEach((c) => set.add(c)));
    return Array.from(set);
  }, [posts]);

  const filteredPosts = useMemo(() => {
    if (activeCategory === 'All') return posts;
    return posts.filter((post) => post.categoryNames.includes(activeCategory));
  }, [posts, activeCategory]);

  return (
    <section className="py-20 bg-slate-50/80 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div>
            <span className="text-xs font-black text-amber-800 uppercase tracking-widest bg-yellow-100 px-3.5 py-1.5 rounded-full border border-yellow-300">
              {t('EXAM NEWS & STUDY ARTICLES')}
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold font-heading text-navy-900 mt-3">
              {t('Latest Updates & Blogs')}
            </h2>
            <p className="text-slate-600 text-sm sm:text-base mt-2">
              {t('Exam notifications, preparation strategies, and expert guidance - fresh from the official Apni Padhai blog.')}
            </p>
          </div>
          <Link
            href="/updates"
            className="group inline-flex items-center gap-2 px-6 py-3 bg-white border-2 border-slate-200 hover:border-amber-300 text-navy-900 text-xs font-black rounded-xl transition-all hover:-translate-y-0.5"
          >
            <span>{t('View All Updates')}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="py-16 text-center">
            <Loader2 className="w-8 h-8 text-amber-600 animate-spin mx-auto" />
            <p className="text-xs text-slate-500 mt-2">{t('Loading blog posts from WordPress...')}</p>
          </div>
        )}

        {/* Error */}
        {!isLoading && isError && (
          <div className="py-16 text-center">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <WifiOff className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold font-heading text-navy-900">{t('Failed to load updates')}</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {t('Something went wrong while fetching the latest articles. Please try again.')}
            </p>
            <button
              onClick={loadPosts}
              className="mt-5 px-6 py-3 bg-navy-900 hover:bg-brand-600 text-white text-xs font-bold rounded-xl transition-colors inline-flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>{t('Retry Now')}</span>
            </button>
          </div>
        )}

        {/* Empty */}
        {!isLoading && !isError && posts.length === 0 && (
          <div className="py-16 text-center">
            <div className="w-16 h-16 bg-yellow-100 text-amber-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Newspaper className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold font-heading text-navy-900">{t('No updates published yet')}</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {t('New articles are on the way. Check the updates page soon.')}
            </p>
          </div>
        )}

        {!isLoading && !isError && posts.length > 0 && (
          <>
            {/* Category Tabs */}
            {categories.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2 mb-8 -mx-4 px-4 sm:mx-0 sm:px-0">
                {categories.map((category) => {
                  const isActive = activeCategory === category;
                  return (
                    <button
                      key={category}
                      onClick={() => setActiveCategory(category)}
                      className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-bold transition-all border ${
                        isActive
                          ? 'bg-navy-900 text-white border-navy-900 shadow-md'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-amber-300 hover:text-amber-800'
                      }`}
                    >
                      {t(category)}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Cards */}
            {filteredPosts.length === 0 ? (
              <div className="py-16 text-center">
                <div className="w-16 h-16 bg-slate-100 text-slate-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold font-heading text-navy-900">{t('No posts in this category yet')}</h3>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPosts.map((post, idx) => (
                  <motion.button
                    key={post.id}
                    onClick={() => setSelectedPost(post)}
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: idx * 0.06 }}
                    whileHover={{ y: -8 }}
                    className="bg-white rounded-3xl border-2 border-slate-100 hover:border-amber-300 shadow-card hover:shadow-card-hover transition-all overflow-hidden flex flex-col group text-left cursor-pointer"
                  >
                    <div className="relative h-48 w-full bg-gradient-to-br from-amber-100 via-yellow-50 to-amber-200 overflow-hidden">
                      {post.imageUrl ? (
                        <Image
                          src={post.imageUrl}
                          alt={post.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                          unoptimized
                        />
                      ) : (
                        <Image
                          src={FALLBACK_IMAGES[idx % FALLBACK_IMAGES.length]}
                          alt={post.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      )}
                      <span className="absolute top-3 left-3 px-2.5 py-1 bg-navy-900/90 text-white text-[10px] font-black rounded-full">
                        {post.categoryNames[0] ?? t('Blog')}
                      </span>
                    </div>

                    <div className="p-6 flex flex-col flex-grow">
                      <div className="flex items-center gap-4 text-[11px] text-slate-500 font-semibold mb-3">
                        <span className="flex items-center gap-1">
                          <CalendarDays className="w-3.5 h-3.5 text-amber-600" />
                          {formatDate(post.date, language)}
                        </span>
                        <span className="flex items-center gap-1">
                          <User className="w-3.5 h-3.5 text-amber-600" />
                          {post.author}
                        </span>
                      </div>

                      <h3 className="text-base font-extrabold font-heading text-navy-900 leading-snug line-clamp-2 group-hover:text-amber-700 transition-colors">
                        {post.title}
                      </h3>
                      <p className="text-xs text-slate-500 leading-relaxed mt-2 line-clamp-3 flex-grow">
                        {post.excerpt}
                      </p>

                      <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-[11px] text-slate-400 font-semibold flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> {estimateReadTime(post.content)}
                        </span>
                        <span className="inline-flex items-center gap-1 text-xs font-black text-amber-700 group-hover:gap-2 transition-all">
                          {t('Read More')}
                          <ArrowRight className="w-4 h-4" />
                        </span>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            )}

            {/* CTA */}
            <div className="mt-12 text-center">
              <Link
                href="/updates"
                className="group inline-flex items-center gap-2 px-8 py-3.5 bg-yellow-400 hover:bg-yellow-500 text-navy-950 text-sm font-black rounded-xl shadow-sm transition-all hover:-translate-y-0.5 active:scale-[0.97]"
              >
                <Newspaper className="w-4 h-4" />
                <span>{t('Read All Blogs & Updates')}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </>
        )}
      </div>

      <BlogReaderModal post={selectedPost} onClose={() => setSelectedPost(null)} />
    </section>
  );
};
