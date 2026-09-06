'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { PlayCircle, Radio, Clock, RefreshCw, WifiOff, Video, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { FaYoutube } from 'react-icons/fa';
import { useTranslation } from '@/i18n/useTranslation';
import { YouTubeVideo } from '@/types';

const INITIAL_VIDEO_COUNT = 8; // 2 rows on desktop (4 cols)
const VIDEOS_PER_LOAD = 8; // 2 more rows added per "View More" click

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
  const [playingVideo, setPlayingVideo] = useState<YouTubeVideo | null>(null);
  const [visibleCount, setVisibleCount] = useState(INITIAL_VIDEO_COUNT);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 639px)');
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

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

  const channel = feed?.channel ?? { url: 'https://www.youtube.com/@AapniPadhai', handle: '@AapniPadhai' };

  const videos = useCallback((): YouTubeVideo[] => {
    const list = feed?.videos ?? [];
    return [...list].sort((a, b) => {
      const ta = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
      const tb = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
      return tb - ta;
    });
  }, [feed]);

  const sortedVideos = videos();
  const allVideos = sortedVideos;
  const showAll = visibleCount >= allVideos.length;
  // On phone show every video in the horizontal scroll without any button; on
  // tablet/desktop keep the incremental 2-rows-per-click behavior.
  const visibleVideos = isMobile ? allVideos : allVideos.slice(0, visibleCount);

  useEffect(() => {
    if (playingVideo === null && allVideos.length > 0) {
      setPlayingVideo(allVideos[0]);
    }
  }, [allVideos, playingVideo]);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      return new Date(dateStr).toLocaleDateString(undefined, {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return '';
    }
  };

  const renderVideoCard = (video: YouTubeVideo) => (
    <motion.button
      key={video.id}
      type="button"
      onClick={() => setPlayingVideo(video)}
      whileHover={{ y: -6 }}
      className="text-left w-full bg-white rounded-3xl border-2 border-slate-100 hover:border-red-200 shadow-card hover:shadow-card-hover transition-all overflow-hidden flex flex-col group cursor-pointer"
    >
      {/* Thumbnail */}
      <div className="relative aspect-video bg-slate-900 overflow-hidden">
        {video.thumbnail ? (
          <Image
            src={video.thumbnail}
            alt={video.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 100vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-slate-800">
            <PlayCircle className="w-12 h-12 text-red-500" />
          </div>
        )}

        <div className="absolute inset-0 bg-navy-950/30 group-hover:bg-navy-950/10 transition-colors flex items-center justify-center">
          <div className="w-14 h-14 bg-red-600 rounded-full flex items-center justify-center shadow-xl opacity-90 group-hover:scale-110 group-hover:opacity-100 transition-all">
            <PlayCircle className="w-7 h-7 text-white ml-0.5" />
          </div>
        </div>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex items-center gap-2">
          {video.type === 'live' ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-600 text-white text-[10px] font-black uppercase rounded-md shadow-sm">
              <Radio className="w-3 h-3 animate-pulse" /> LIVE
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-navy-950/80 text-white text-[10px] font-black uppercase rounded-md backdrop-blur-sm">
              <FaYoutube className="w-3 h-3 text-red-500" /> {t('Lecture')}
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
            <FaYoutube className="w-3.5 h-3.5 text-red-600" /> {channel.handle}
          </span>
          {video.publishedAt && (
            <span className="text-[11px] font-bold text-slate-400">{formatDate(video.publishedAt)}</span>
          )}
        </div>
      </div>
    </motion.button>
  );

  return (
    <section className="py-12 bg-white relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-red-50/60 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div className="max-w-2xl">
            <span className="text-xs font-black text-red-700 uppercase tracking-widest bg-red-50 px-3.5 py-1.5 rounded-full border border-red-200 inline-flex items-center gap-1.5">
              <FaYoutube className="w-3.5 h-3.5" /> {t('FREE LECTURES ON YOUTUBE')}
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
            <FaYoutube className="w-4 h-4" />
            <span>{t('Subscribe on YouTube')}</span>
          </a>
        </div>

        {/* Loading */}
        {isLoading ? (
          <div className="py-8 text-center">
            <LoaderSpinner />
            <p className="text-xs text-slate-500 mt-2">{t('Loading videos from our YouTube channel...')}</p>
          </div>
        ) : isError ? (
          <div className="py-8 text-center">
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
        ) : sortedVideos.length === 0 ? (
          <div className="py-8 text-center">
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
              <FaYoutube className="w-4 h-4" />
              <span>{t('Visit Our Channel')}</span>
            </a>
          </div>
        ) : (
          <>
            {/* Top Player Frame */}
            {playingVideo && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4 }}
                className="mb-8"
              >
                <div className="rounded-3xl overflow-hidden bg-navy-950 border border-slate-800 shadow-2xl">
                  {playingVideo.videoId ? (
                    <div className="relative aspect-video bg-black">
                      <iframe
                        src={`https://www.youtube.com/embed/${playingVideo.videoId}?autoplay=1&rel=0`}
                        title={playingVideo.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="absolute inset-0 w-full h-full"
                      />
                    </div>
                  ) : (
                    <div className="relative aspect-video bg-slate-800 flex items-center justify-center">
                      <PlayCircle className="w-16 h-16 text-red-500" />
                    </div>
                  )}

                  <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="text-sm sm:text-base font-bold font-heading text-white line-clamp-2">
                        {playingVideo.title}
                      </h3>
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 mt-1">
                        <FaYoutube className="w-3.5 h-3.5 text-red-500" /> {channel.handle}
                        {playingVideo.publishedAt && <> · {formatDate(playingVideo.publishedAt)}</>}
                      </span>
                    </div>
                    <a
                      href={playingVideo.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-black rounded-xl shadow-sm transition-all flex-shrink-0"
                    >
                      <FaYoutube className="w-3.5 h-3.5" />
                      <span>{t('Watch on YouTube')}</span>
                    </a>
                  </div>
                </div>
              </motion.div>
            )}

            {/* All Videos — horizontal scroll on phone, grid on tablet/desktop */}
            {allVideos.length > 0 && (
              <>
                <div className="mb-6">
                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
                    {t('All Videos')}
                  </span>
                </div>

                <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide sm:grid sm:grid-cols-2 sm:gap-5 sm:overflow-visible sm:pb-0 sm:snap-none lg:grid-cols-4">
                  {visibleVideos.map((video, index) => (
                    <motion.div
                      key={video.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: index * 0.05 }}
                      className="snap-start shrink-0 w-[78%] sm:w-auto"
                    >
                      {renderVideoCard(video)}
                    </motion.div>
                  ))}
                </div>
              </>
            )}

            {/* Channel CTA + View More / Show Less */}
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              {!isMobile && allVideos.length > INITIAL_VIDEO_COUNT && (
                <button
                  type="button"
                  onClick={() =>
                    setVisibleCount((prev) =>
                      showAll ? INITIAL_VIDEO_COUNT : Math.min(allVideos.length, prev + VIDEOS_PER_LOAD),
                    )
                  }
                  className="inline-flex items-center gap-2 px-8 py-3.5 bg-navy-900 hover:bg-brand-600 text-white text-sm font-black rounded-2xl shadow-sm transition-all hover:-translate-y-0.5"
                >
                  <span>{showAll ? t('Show Less') : t('View More')}</span>
                  {showAll ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              )}
              <a
                href={channel.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-red-600 hover:bg-red-700 text-white text-sm font-black rounded-2xl shadow-sm transition-all hover:-translate-y-0.5"
              >
                <FaYoutube className="w-4 h-4" />
                <span>{t('View All Videos on YouTube')}</span>
              </a>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

const LoaderSpinner: React.FC = () => (
  <div className="w-16 h-16 mx-auto relative">
    <Loader2 className="w-16 h-16 text-red-600 animate-spin" />
  </div>
);