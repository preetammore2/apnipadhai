'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { UPDATES_DATA } from '@/data/updates';
import { UPDATE_HI } from '@/i18n/data';
import { useTranslation } from '@/i18n/useTranslation';
import Image from 'next/image';
import Link from 'next/link';
import { Clock, ArrowRight, Loader2, RefreshCw, WifiOff, Newspaper, CalendarDays, User, BookOpen } from 'lucide-react';
import { WordPressPost } from '@/lib/wordpress';
import { BlogReaderModal } from '@/components/blog/BlogReaderModal';

const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=800&q=80',
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

export default function UpdatesPage() {
  const { t, language } = useTranslation();
  const [posts, setPosts] = useState<WordPressPost[] | null>(null);
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
    } catch (error) {
      console.error('[UpdatesPage] load error', error);
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
    (posts ?? []).forEach((post) => post.categoryNames.forEach((c) => set.add(c)));
    return Array.from(set);
  }, [posts]);

  const filteredPosts = useMemo(() => {
    if (!posts) return [];
    if (activeCategory === 'All') return posts;
    return posts.filter((post) => post.categoryNames.includes(activeCategory));
  }, [posts, activeCategory]);

  return (
    <div className="py-12 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">

        {/* Banner */}
        <div className="text-center max-w-3xl mx-auto">
          <span className="text-xs font-bold text-brand-600 uppercase tracking-widest bg-brand-100/80 px-3.5 py-1.5 rounded-full">
            {t('EXAM NEWS & STUDY ARTICLES')}
          </span>
          <h1 className="text-3xl sm:text-5xl font-black font-heading text-navy-900 mt-3">
            {t('Latest Updates & Blogs')}
          </h1>
          <p className="text-slate-600 text-sm sm:text-base mt-2">
            {t('Stay informed with official recruitment notifications, exam pattern changes, and expert preparation strategies from the Apni Padhai blog.')}
          </p>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="py-16 text-center">
            <Loader2 className="w-8 h-8 text-amber-600 animate-spin mx-auto" />
            <p className="text-xs text-slate-500 mt-2">{t('Loading blog posts from WordPress...')}</p>
          </div>
        )}

        {/* Error -> fall back to local curated articles */}
        {!isLoading && (isError || (posts !== null && posts.length === 0)) && (
          <>
            <div className="py-10 text-center">
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <WifiOff className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold font-heading text-navy-900">{t('Failed to load live blog posts')}</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                {t('Showing curated study articles instead. Please try again later.')}
              </p>
              <button
                onClick={loadPosts}
                className="mt-5 px-6 py-3 bg-navy-900 hover:bg-brand-600 text-white text-xs font-bold rounded-xl transition-colors inline-flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>{t('Retry Now')}</span>
              </button>
            </div>

            {/* Local curated articles grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {UPDATES_DATA.map((article) => (
                <div
                  key={article.id}
                  className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
                      <Image src={article.image} alt={article.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                      <span className="absolute top-3 left-3 px-3 py-1 bg-navy-900/90 text-white text-xs font-bold rounded-full">
                        {t(article.category)}
                      </span>
                    </div>

                    <div className="p-6">
                      <div className="flex items-center gap-3 text-[11px] text-slate-400 mb-2">
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {article.date}</span>
                        <span>•</span>
                        <span>{article.readTime}</span>
                      </div>

                      <Link href={`/updates/${article.slug}`}>
                        <h3 className="text-lg font-bold font-heading text-navy-900 group-hover:text-brand-600 transition-colors line-clamp-2 mb-2">
                          {language === 'hi' ? UPDATE_HI[article.slug]?.title ?? article.title : article.title}
                        </h3>
                      </Link>
                      <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">
                        {language === 'hi' ? UPDATE_HI[article.slug]?.excerpt ?? article.excerpt : article.excerpt}
                      </p>
                    </div>
                  </div>

                  <div className="px-6 pb-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-600">{t('By')} {article.author}</span>
                    <Link
                      href={`/updates/${article.slug}`}
                      className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
                    >
                      {t('Read Article')} <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* WordPress blog posts (all) */}
        {!isLoading && !isError && posts !== null && posts.length > 0 && (
          <>
            {/* Category Tabs */}
            {categories.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
                {categories.map((category) => {
                  const isActive = activeCategory === category;
                  const count =
                    category === 'All'
                      ? posts.length
                      : posts.filter((post) => post.categoryNames.includes(category)).length;
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
                      <span
                        className={`ml-1.5 text-[10px] font-black rounded-full px-1.5 py-0.5 ${
                          isActive ? 'bg-yellow-400 text-navy-950' : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Posts Grid */}
            {filteredPosts.length === 0 ? (
              <div className="py-16 text-center">
                <div className="w-16 h-16 bg-slate-100 text-slate-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold font-heading text-navy-900">{t('No posts in this category yet')}</h3>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredPosts.map((post, idx) => (
                  <button
                    key={post.id}
                    onClick={() => setSelectedPost(post)}
                    className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between group text-left cursor-pointer hover:border-amber-300"
                  >
                    <div>
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
                        <span className="absolute top-3 left-3 px-3 py-1 bg-navy-900/90 text-white text-xs font-bold rounded-full">
                          {post.categoryNames[0] ?? t('Blog')}
                        </span>
                      </div>

                      <div className="p-6">
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[11px] text-slate-400 mb-2">
                          <span className="flex items-center gap-1"><CalendarDays className="w-3 h-3" /> {formatDate(post.date, language)}</span>
                          <span className="flex items-center gap-1"><User className="w-3 h-3" /> {post.author}</span>
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {estimateReadTime(post.content)}</span>
                        </div>

                        <h3 className="text-lg font-bold font-heading text-navy-900 group-hover:text-amber-700 transition-colors line-clamp-2 mb-2">
                          {post.title}
                        </h3>
                        <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">
                          {post.excerpt}
                        </p>
                      </div>
                    </div>

                    <div className="px-6 pb-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 text-xs font-black text-amber-700 group-hover:gap-2.5 transition-all">
                        <Newspaper className="w-3.5 h-3.5" /> {t('Read in App')}
                      </span>
                      <ArrowRight className="w-4 h-4 text-amber-600" />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <BlogReaderModal post={selectedPost} onClose={() => setSelectedPost(null)} />
    </div>
  );
}
