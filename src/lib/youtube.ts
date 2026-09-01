import { YouTubeVideo } from '@/types';

export const CHANNEL_URL = 'https://www.youtube.com/@AapniPadhai';
export const CHANNEL_ID = 'UC0IC3GyhT2wYyG_36FLbkYA';

const RSS_URL = `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`;
const CACHE_TTL_MS = 30 * 60 * 1000;

interface CachedFeed {
  data: YouTubeVideo[];
  fetchedAt: number;
}

let cachedFeed: CachedFeed | null = null;

function extractText(xml: string, tag: string): string {
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`);
  const m = xml.match(re);
  return m ? m[1].trim() : '';
}

function extractAttr(xml: string, tag: string, attr: string): string {
  const re = new RegExp(`<${tag}[^>]*\\s${attr}="([^"]*)"`);
  const m = xml.match(re);
  return m ? m[1] : '';
}

function parseVideoId(entry: string): { id: string; type: 'video' | 'live' } | null {
  const watch = entry.match(/watch\?v=([A-Za-z0-9_-]{11})/);
  if (watch) return { id: watch[1], type: 'video' };
  const live = entry.match(/youtube\.com\/live\/([A-Za-z0-9_-]{11})/);
  if (live) return { id: live[1], type: 'live' };
  const ytVideo = entry.match(/yt:video:([A-Za-z0-9_-]{11})/);
  if (ytVideo) return { id: ytVideo[1], type: 'video' };
  const standalone = entry.match(/\b([A-Za-z0-9_-]{11})\b/);
  if (standalone) return { id: standalone[1], type: 'video' };
  return null;
}

async function fetchFromRss(): Promise<YouTubeVideo[]> {
  const res = await fetch(RSS_URL, {
    next: { revalidate: 1800 },
    headers: { 'user-agent': 'Mozilla/5.0 (compatible; ApniPadhaiApp/1.0)' },
  });
  if (!res.ok) throw new Error(`YouTube RSS returned ${res.status}`);

  const xml = await res.text();

  // Split into individual <entry> blocks
  const entries = xml.split(/<entry>/g).slice(1);
  const videos: YouTubeVideo[] = [];

  for (const entry of entries) {
    const idUrl = extractText(entry, 'id');
    const parsed = parseVideoId(idUrl);
    if (!parsed) continue;

    const title = extractText(entry, 'title');
    // YouTube RSS uses media:thumbnail with url attribute
    const thumbnail =
      extractAttr(entry, 'media:thumbnail', 'url') ||
      extractAttr(entry, 'thumbnail', 'url') ||
      '';

    videos.push({
      id: parsed.id,
      videoId: parsed.id,
      type: parsed.type,
      title,
      thumbnail,
      url:
        parsed.type === 'live'
          ? `https://www.youtube.com/live/${parsed.id}`
          : `https://www.youtube.com/watch?v=${parsed.id}`,
    });
  }

  return videos;
}

export async function getChannelVideos(): Promise<YouTubeVideo[]> {
  if (cachedFeed && Date.now() - cachedFeed.fetchedAt < CACHE_TTL_MS) {
    return cachedFeed.data;
  }

  try {
    const videos = await fetchFromRss();
    cachedFeed = { data: videos, fetchedAt: Date.now() };
    return videos;
  } catch (error) {
    console.error('[youtube] RSS fetch failed', error);
    if (cachedFeed) return cachedFeed.data;
    return [];
  }
}
