import { YouTubeVideo } from '@/types';

export const CHANNEL_URL = 'https://www.youtube.com/@AapniPadhai';
export const CHANNEL_ID = 'UC0IC3GyhT2wYyG_36FLbkYA';

const WP_HOME_URL = 'https://apnipadhaipublication.com';
const CACHE_TTL_MS = 60 * 60 * 1000;
const ENTITY_MAP: Record<string, string> = {
  '&quot;': '"',
  '&amp;': '&',
  '&#39;': "'",
  '&apos;': "'",
  '&lt;': '<',
  '&gt;': '>',
};

interface CachedFeed {
  data: YouTubeVideo[];
  fetchedAt: number;
}

let cachedFeed: CachedFeed | null = null;

function decodeEntities(value: string): string {
  return value.replace(/&(?:quot|amp|#39|apos|lt|gt);/g, (m) => ENTITY_MAP[m] ?? m);
}

function decodeUnicodeEscapes(value: string): string {
  return value.replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
}

function parseVideoId(youtubeUrl: string): { id: string; type: 'video' | 'live' } | null {
  const watch = youtubeUrl.match(/watch\?v=([A-Za-z0-9_-]{11})/);
  if (watch) return { id: watch[1], type: 'video' };
  const live = youtubeUrl.match(/youtube\.com\/live\/([A-Za-z0-9_-]{11})/);
  if (live) return { id: live[1], type: 'live' };
  return null;
}

async function fetchWordPressHome(): Promise<string> {
  const res = await fetch(WP_HOME_URL, {
    next: { revalidate: 3600 },
    headers: { 'user-agent': 'Mozilla/5.0 (compatible; ApniPadhaiApp/1.0)' },
  });
  if (!res.ok) throw new Error(`WordPress home returned ${res.status}`);
  return res.text();
}

function parsePlaylistWidget(html: string): YouTubeVideo[] {
  const videos: YouTubeVideo[] = [];
  const seen = new Set<string>();
  const regex = /data-settings="(\{&quot;playlist_title[^"]*)"/g;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(html)) !== null) {
    const jsonRaw = decodeEntities(match[1]);
    try {
      const parsed = JSON.parse(jsonRaw) as {
        playlist_title?: string;
        tabs?: Array<{
          title?: string;
          youtube_url?: string;
          duration?: string;
          thumbnail?: { url?: string };
        }>;
      };
      for (const tab of parsed.tabs ?? []) {
        if (!tab.youtube_url) continue;
        const video = parseVideoId(tab.youtube_url);
        if (!video || seen.has(video.id)) continue;
        seen.add(video.id);
        videos.push({
          id: video.id,
          videoId: video.id,
          type: video.type,
          title: decodeUnicodeEscapes(tab.title ?? ''),
          duration: tab.duration,
          thumbnail: tab.thumbnail?.url?.replace(/\\\//g, '/') ?? '',
          url:
            video.type === 'live'
              ? `https://www.youtube.com/live/${video.id}`
              : `https://www.youtube.com/watch?v=${video.id}`,
        });
      }
    } catch (error) {
      console.error('[youtube] failed to parse playlist widget', error);
    }
  }

  return videos;
}

function parseVideoIdsFromHtml(html: string): Array<{ id: string; type: 'video' | 'live' }> {
  const ids: Array<{ id: string; type: 'video' | 'live' }> = [];
  const seen = new Set<string>();

  for (const m of html.matchAll(/watch\?v=([A-Za-z0-9_-]{11})/g)) {
    if (!seen.has(m[1])) {
      seen.add(m[1]);
      ids.push({ id: m[1], type: 'video' });
    }
  }
  for (const m of html.matchAll(/youtube\.com\/live\/([A-Za-z0-9_-]{11})/g)) {
    if (!seen.has(m[1])) {
      seen.add(m[1]);
      ids.push({ id: m[1], type: 'live' });
    }
  }

  return ids;
}

async function enrichWithOEmbed(video: YouTubeVideo): Promise<YouTubeVideo> {
  const url = `https://www.youtube.com/oembed?url=${encodeURIComponent(
    video.type === 'live' ? `https://www.youtube.com/live/${video.id}` : `https://www.youtube.com/watch?v=${video.id}`,
  )}&format=json`;

  try {
    const res = await fetch(url, { next: { revalidate: 86400 } });
    if (!res.ok) throw new Error(`oEmbed returned ${res.status}`);
    const data = (await res.json()) as { title?: string; thumbnail_url?: string };
    return {
      ...video,
      title: data.title || video.title,
      thumbnail: data.thumbnail_url || video.thumbnail,
    };
  } catch (error) {
    console.error(`[youtube] oEmbed failed for ${video.id}`, error);
    return video;
  }
}

export async function getChannelVideos(): Promise<YouTubeVideo[]> {
  if (cachedFeed && Date.now() - cachedFeed.fetchedAt < CACHE_TTL_MS) {
    return cachedFeed.data;
  }

  let html: string;
  try {
    html = await fetchWordPressHome();
  } catch (error) {
    console.error('[youtube] failed to fetch WordPress home', error);
    if (cachedFeed) return cachedFeed.data;
    return [];
  }

  const playlistVideos = parsePlaylistWidget(html);
  const playlistIds = new Set(playlistVideos.map((v) => v.id));
  const pageVideos = parseVideoIdsFromHtml(html)
    .filter(({ id }) => !playlistIds.has(id))
    .map(({ id, type }) => ({
      id,
      videoId: id,
      type,
      title: '',
      thumbnail: '',
      url: type === 'live' ? `https://www.youtube.com/live/${id}` : `https://www.youtube.com/watch?v=${id}`,
    }));

  const combined = [...playlistVideos, ...pageVideos];
  const enriched = await Promise.all(combined.map((video) => enrichWithOEmbed(video)));

  cachedFeed = { data: enriched, fetchedAt: Date.now() };
  return enriched;
}
