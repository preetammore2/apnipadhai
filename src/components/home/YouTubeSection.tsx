'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Youtube, PlayCircle, Radio, Clock, ArrowRight, ExternalLink, Loader2, RefreshCw, WifiOff, Video } from 'lucide-react';
import { useTranslation } from '@/i18n/useTranslation';
import { YouTubeVideo } from '@/types';

interface ChannelInfo {
  id: string;
  url: string;
  handle: string;
}

interface YouTubeFeed {
  channel: ChannelInfo;
  videos: YouTubeVideo[];
}

export const YouTubeSection: React.FC = () => {
  const { t } = useTranslation();
  const [feed, setFeed] = useState<YouTubeFeed | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  const loadVideos = async () => {
    setIsLoading(true);
    setIsError(false);
    try {
      const res = await fetch('/api/youtube');
      if (!res.ok) throw new Error('Failed to load videos');
      const data = (await res.json()) as YouTubeFeed;
      setFeed(data);
    } catch {
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadVideos();
  }, []);

  const videos = feed?.videos ?? [];
  const channel = feed?.channel ?? { url: 'https://www.youtube.com/@AapniPadhai', handle: '@AapniPadhai' };

  const renderVideoCard = (video: YouTubeVideo) => (
    <motion.a
      key={video.id}
      href={video.url}
      target="_blank"
      rel="noreferrer"
      whileHover={{ y: -8 }}
      className="w-[280px] sm:w-[320px] flex-shrink-0 bg-white rounded-3xl border-2 border-slate-100 hover:border-red-200 shadow-card hover:shadow-card-hover transition-all overflow-hidden flex flex-col group"
    >
      {/* Thumbnail */}
      <div className="relative aspect-video bg-slate-900 overflow-hidden">
        {video.thumbnail ? (
          <Image
            src={video.thumbnail}
            alt={video.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 280px, 320px"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-slate-800">
            <PlayCircle className="w-12 h-12 text-red-500" />
          </div>
        )}

        <div className="absolute inset-0 bg-navy-950/30 group-hover:bg-navy-950/10 transition-colors flex items-center justify-center">
          <PlayCircle className="w-14 h-14 text-white drop-shadow-lg opacity-90 group-hover:scale-110 group-hover:opacity-100 transition-all" />
        </div>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex items-center gap-2">
          {video.type === 'live' ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-600 text-white text-[10px] font-black uppercase rounded-md shadow-sm">
              <Radio className="w-3 h-3 animate-pulse" /> LIVE
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-navy-950/80 text-white text-[10px] font-black uppercase rounded-md backdrop-blur-sm">
              <Youtube className="w-3 h-3 text-red-500" /> {t('Lecture')}
            </span>
          )}
        </div>

        {video.duration && (
          <span className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-navy-950/85 text-white text-[10px] font-bold rounded-md backdrop-blur-sm inline-flex items-center gap-1">
            <Clock className="w-3 h-3" /> {video.duration}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="text-sm font-bold font-heading text-navy-900 line-clamp-2 group-hover:text-red-700 transition-colors leading-snug">
          {video.title}
        </h3>
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-500">
            <Youtube className="w-3.5 h-3.5 text-red-600" /> {channel.handle}
          </span>
          <span className="inline-flex items-center gap-1 text-[11px] font-black text-navy-900 group-hover:text-red-700 transition-colors">
            {t('Watch')} <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </span>
        </div>
      </div>
    </motion.a>
  );

  return (
    <section className="py-20 bg-white relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-red-50/60 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="max-w-2xl">
            <span className="text-xs font-black text-red-700 uppercase tracking-widest bg-red-50 px-3.5 py-1.5 rounded-full border border-red-200 inline-flex items-center gap-1.5">
              <Youtube className="w-3.5 h-3.5" /> {t('FREE LECTURES ON YOUTUBE')}
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold font-heading text-navy-900 mt-3">
              {t('Watch Free Exam-Oriented Lectures')}
            </h2>
            <p className="text-slate-600 text-sm sm:text-base mt-2">
              {t('Answer keys, exam analysis, and topic-wise tricks by Rohit Sir & the Apni Padhai faculty — pulled straight from our YouTube channel.')}
            </p>
          </div>

          <a
            href={channel.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white text-sm font-black rounded-2xl shadow-sm transition-all hover:-translate-y-0.5"
          >
            <Youtube className="w-4 h-4" />
            <span>{t('Subscribe on YouTube')}</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-70" />
          </a>
        </div>

        {/* Loading */}
        {isLoading ? (
          <div className="py-16 text-center">
            <Loader2 className="w-8 h-8 text-red-600 animate-spin mx-auto" />
            <p className="text-xs text-slate-500 mt-2">{t('Loading videos from our YouTube channel...')}</p>
          </div>
        ) : isError ? (
          <div className="py-16 text-center">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <WifiOff className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold font-heading text-navy-900">{t('Failed to load videos')}</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {t('Something went wrong while fetching the latest lectures. Please try again.')}
            </p>
            <button
              onClick={() => loadVideos()}
              className="mt-5 px-6 py-3 bg-navy-900 hover:bg-brand-600 text-white text-xs font-bold rounded-xl transition-colors inline-flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>{t('Retry Now')}</span>
            </button>
          </div>
        ) : videos.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-16 h-16 bg-yellow-100 text-amber-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Video className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold font-heading text-navy-900">{t('No videos available right now')}</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {t('New lecture uploads are on the way. Subscribe to stay notified.')}
            </p>
            <a
              href={channel.url}
              target="_blank"
              rel="noreferrer"
              className="mt-5 px-6 py-3 bg-red-600 hover:bg-red-700 text-white text-xs font-black rounded-xl transition-all inline-flex items-center gap-2"
            >
              <Youtube className="w-4 h-4" />
              <span>{t('Visit Our Channel')}</span>
            </a>
          </div>
        ) : (
          <>
            {/* Infinite Marquee Scroller */}
            <div className="marquee-scroller relative overflow-hidden" style={{ '--marquee-duration': `${Math.max(videos.length * 3, 30)}s` } as React.CSSProperties}>
              {/* Edge Fades */}
              <div className="absolute left-0 top-0 bottom-0 w-10 sm:w-24 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
              <div className="absolute right-0 top-0 bottom-0 w-10 sm:w-24 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

              {/* Track (videos duplicated for seamless loop) */}
              <div className="marquee-track flex gap-6 w-max py-2">
                {[...videos, ...videos].map((video, index) => (
                  <div key={`${video.id}-${index}`}>{renderVideoCard(video)}</div>
                ))}
              </div>
            </div>

            {/* Channel CTA */}
            <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/books"
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-navy-900 hover:bg-brand-600 text-white text-sm font-black rounded-2xl shadow-sm transition-all hover:-translate-y-0.5"
              >
                <span>{t('Explore Brahmastra Books')}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href={channel.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-red-600 hover:bg-red-700 text-white text-sm font-black rounded-2xl shadow-sm transition-all hover:-translate-y-0.5"
              >
                <Youtube className="w-4 h-4" />
                <span>{t('View All Videos on YouTube')}</span>
              </a>
            </div>
          </>
        )}
      </div>
    </section>
  );
};
