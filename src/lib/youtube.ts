import { YouTubeVideo } from '@/types';

export const CHANNEL_URL = 'https://www.youtube.com/@AapniPadhai';
export const CHANNEL_ID = 'UC0IC3GyhT2wYyG_36FLbkYA';
export const CHANNEL_HANDLE = '@AapniPadhai';

// The channel "Videos" tab HTML is a stale popular-videos snapshot, so the full
// upload history (newest first) is read from the channel's uploads playlist.
const PLAYLIST_URL = `https://www.youtube.com/playlist?list=UU${CHANNEL_ID.slice(2)}`;
const RSS_URL = `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`;
const CACHE_TTL_MS = 30 * 60 * 1000;

const API_KEY = process.env.YOUTUBE_API_KEY ?? '';

const SCRAPE_HEADERS: Record<string, string> = {
  'user-agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36',
  'accept-language': 'en-US,en;q=0.9',
  'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
};

interface CachedFeed {
  data: YouTubeVideo[];
  fetchedAt: number;
}

let cachedFeed: CachedFeed | null = null;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

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

    const publishedAt = extractText(entry, 'published') || undefined;

    videos.push({
      id: parsed.id,
      videoId: parsed.id,
      type: parsed.type,
      title,
      thumbnail,
      publishedAt,
      url:
        parsed.type === 'live'
          ? `https://www.youtube.com/live/${parsed.id}`
          : `https://www.youtube.com/watch?v=${parsed.id}`,
    });
  }

  return videos;
}

async function fetchFromApi(): Promise<YouTubeVideo[]> {
  const g = 'https://www.googleapis.com/youtube/v3';

  // 1. Resolve the channel's uploads playlist id
  const chanRes = await fetch(`${g}/channels?part=contentDetails&id=${CHANNEL_ID}&key=${API_KEY}`, {
    next: { revalidate: 1800 },
  });
  if (!chanRes.ok) throw new Error(`YouTube channels API returned ${chanRes.status}`);
  const chanData = (await chanRes.json()) as {
    items?: { contentDetails?: { relatedPlaylists?: { uploads?: string } } }[];
  };
  const playlistId = chanData.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;
  if (!playlistId) throw new Error('YouTube uploads playlist not found');

  // 2. Paginate through every video in the uploads playlist (newest first)
  const videos: YouTubeVideo[] = [];
  let nextPageToken = '';
  const seen = new Set<string>();

  do {
    const params = new URLSearchParams({
      part: 'snippet',
      playlistId,
      maxResults: '50',
      key: API_KEY,
    });
    if (nextPageToken) params.set('pageToken', nextPageToken);

    const res = await fetch(`${g}/playlistItems?${params.toString()}`);
    if (!res.ok) throw new Error(`YouTube playlistItems API returned ${res.status}`);
    const data = (await res.json()) as {
      items?: {
        contentDetails?: { videoId?: string };
        snippet?: { title?: string; publishedAt?: string; thumbnails?: { maxres?: { url?: string }; high?: { url?: string }; default?: { url?: string } } };
      }[];
      nextPageToken?: string;
    };

    const items = data.items ?? [];
    for (const item of items) {
      const videoId = item.contentDetails?.videoId;
      if (!videoId) continue;
      if (seen.has(videoId)) continue;
      seen.add(videoId);
      const thumbs = item.snippet?.thumbnails;
      videos.push({
        id: videoId,
        videoId,
        type: 'video',
        title: item.snippet?.title ?? '',
        thumbnail: thumbs?.maxres?.url || thumbs?.high?.url || thumbs?.default?.url || '',
        publishedAt: item.snippet?.publishedAt,
        url: `https://www.youtube.com/watch?v=${videoId}`,
      });
    }

    nextPageToken = data.nextPageToken ?? '';
  } while (nextPageToken);

  return videos;
}

// --- Channel "videos" tab scraping (no API key required, full catalog) ---

/** Extract the `var ytInitialData = {...}` JSON object from the channel page HTML. */
function extractInitialData(html: string): string | null {
  const marker = 'var ytInitialData = ';
  const start = html.indexOf(marker);
  if (start === -1) return null;
  const open = html.indexOf('{', start);
  if (open === -1) return null;
  let inString = false;
  let escaped = false;
  let depth = 0;
  for (let k = open; k < html.length; k += 1) {
    const ch = html[k];
    if (inString) {
      if (escaped) escaped = false;
      else if (ch === '\\') escaped = true;
      else if (ch === '"') inString = false;
      continue;
    }
    if (ch === '"') inString = true;
    else if (ch === '{') depth += 1;
    else if (ch === '}') {
      depth -= 1;
      if (depth === 0) return html.slice(open, k + 1);
    }
  }
  return null;
}

/**
 * Walk the innertube response and collect video entries (new `lockupViewModel`
 * layout) plus the next continuation token.
 */
function collectFromResponse(
  node: unknown,
  videos: Map<string, { id: string; title: string; thumb: string; dateText: string }>,
  tokens: string[],
): void {
  if (!node || typeof node !== 'object') return;
  const obj = node as Record<string, unknown>;

  const lock = obj.lockupViewModel as
    | {
        contentId?: string;
        contentImage?: { thumbnailViewModel?: { image?: { sources?: { url?: string }[] } } };
        metadata?: {
          lockupMetadataViewModel?: {
            title?: { content?: string };
            metadata?: {
              contentMetadataViewModel?: {
                metadataRows?: { metadataParts?: { text?: { content?: string } }[] }[];
              };
            };
          };
        };
      }
    | undefined;

  if (lock?.contentId && lock.metadata?.lockupMetadataViewModel?.title?.content) {
    const meta = lock.metadata.lockupMetadataViewModel;
    const rows = meta.metadata?.contentMetadataViewModel?.metadataRows ?? [];
    const rowTexts = rows
      .flatMap((row) => (row.metadataParts ?? []).map((part) => part.text?.content ?? ''))
      .filter(Boolean);
    const dateText =
      rowTexts.find((text) => /ago|yesterday|streamed|premiered|latest/i.test(text)) ??
      rowTexts[rowTexts.length - 1] ??
      '';
    const thumb = lock.contentImage?.thumbnailViewModel?.image?.sources?.[0]?.url ?? '';
    videos.set(lock.contentId, {
      id: lock.contentId,
      title: meta.title?.content ?? '',
      thumb: thumb.split('?')[0],
      dateText,
    });
  }

  const continuation = obj.continuationCommand as { token?: string } | undefined;
  if (continuation?.token && typeof continuation.token === 'string') {
    tokens.push(continuation.token);
  }

  // Playlists use continuationItemViewModel.continuationCommand.innertubeCommand.token
  const playlistContinuation = obj.continuationItemViewModel as
    | {
        continuationCommand?: {
          innertubeCommand?: { token?: string };
        };
      }
    | undefined;
  const playlistToken = playlistContinuation?.continuationCommand?.innertubeCommand?.token;
  if (playlistToken && typeof playlistToken === 'string') {
    tokens.push(playlistToken);
  }

  for (const value of Object.values(obj)) {
    if (value && typeof value === 'object') collectFromResponse(value, videos, tokens);
  }
}

/** Convert a date label ("N years ago", "Streamed 3 weeks ago", "Sep 4, 2026") to ISO. */
function relativeToIso(dateText: string): string | undefined {
  if (!dateText) return undefined;
  const now = new Date();
  const cleaned = dateText.toLowerCase().replace(/^(streamed|premiered|uploaded)\s+/i, '');
  if (cleaned.includes('yesterday')) return new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();

  const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
  const exact = cleaned.match(/^([a-z]{3})\s+(\d{1,2}),\s+(\d{4})$/i);
  if (exact) {
    const month = months.indexOf(exact[1].toLowerCase());
    if (month !== -1) {
      return new Date(Date.UTC(parseInt(exact[3], 10), month, parseInt(exact[2], 10))).toISOString();
    }
  }

  const n = cleaned.match(/(\d+)\s*(year|month|week|day|hour|minute)s?\s*ago/);
  if (!n) return undefined;
  const amount = parseInt(n[1], 10);
  const unit = n[2];
  const ms =
    unit === 'year' ? amount * 365 * 24 * 60 * 60 * 1000
    : unit === 'month' ? amount * 30 * 24 * 60 * 60 * 1000
    : unit === 'week' ? amount * 7 * 24 * 60 * 60 * 1000
    : unit === 'day' ? amount * 24 * 60 * 60 * 1000
    : unit === 'hour' ? amount * 60 * 60 * 1000
    : amount * 60 * 1000;
  return new Date(now.getTime() - ms).toISOString();
}

/**
 * Scrape the channel's uploads playlist and follow continuations until the whole
 * upload history is collected (newest first, ~1.2k videos). No API key required.
 * A playlist is used because the channel's "Videos" tab HTML is a stale
 * popular-videos snapshot that omits recent uploads.
 */
async function fetchFromPlaylist(): Promise<YouTubeVideo[]> {
  const pageRes = await fetch(PLAYLIST_URL, {
    next: { revalidate: 1800 },
    headers: SCRAPE_HEADERS,
  });
  if (!pageRes.ok) throw new Error(`YouTube playlist page returned ${pageRes.status}`);
  const html = await pageRes.text();
  const initialJson = extractInitialData(html);
  if (!initialJson) throw new Error('Could not locate ytInitialData on playlist page');

  const videos = new Map<string, { id: string; title: string; thumb: string; dateText: string }>();
  const tokens: string[] = [];

  const firstResponse = JSON.parse(initialJson) as unknown;
  collectFromResponse(firstResponse, videos, tokens);

  const clientVersion =
    (initialJson.match(/"clientVersion":"([^"]+)"/)?.[1] as string) ?? '2.20260902.07.00';
  let token = tokens[0] ?? '';

  // Follow continuations up to a safety cap (channel has ~1.2k videos; ~13 pages of 100).
  for (let round = 0; token && round < 40; round += 1) {
    await sleep(250);
    const res = await fetch('https://www.youtube.com/youtubei/v1/browse', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        ...SCRAPE_HEADERS,
      },
      body: JSON.stringify({
        context: { client: { clientName: 'WEB', clientVersion, hl: 'en', gl: 'IN' } },
        continuation: token,
      }),
    });
    if (!res.ok) {
      console.error(`[youtube] browse returned ${res.status} at page ${round + 1}; keeping what we have`);
      break;
    }
    const data = (await res.json()) as unknown;
    const nextTokens: string[] = [];
    const before = videos.size;
    collectFromResponse(data, videos, nextTokens);
    token = nextTokens[0] ?? '';
    // If a continuation round yielded no new videos, stop.
    if (videos.size === before) break;
  }

  return [...videos.values()].map((video) => ({
    id: video.id,
    videoId: video.id,
    type: 'video' as const,
    title: video.title,
    thumbnail: video.thumb,
    publishedAt: relativeToIso(video.dateText),
    url: `https://www.youtube.com/watch?v=${video.id}`,
  }));
}

export async function getChannelVideos(): Promise<YouTubeVideo[]> {
  if (cachedFeed && Date.now() - cachedFeed.fetchedAt < CACHE_TTL_MS) {
    return cachedFeed.data;
  }

  // Prefer the official API when a key is configured; otherwise scrape the full
  // channel catalog (uploads playlist) without a key. RSS stays as a last-resort
  // fallback feed.
  try {
    let videos: YouTubeVideo[];
    if (API_KEY) {
      videos = await fetchFromApi();
    } else {
      videos = await fetchFromPlaylist();
    }
    if (videos.length > 0) {
      cachedFeed = { data: videos, fetchedAt: Date.now() };
      return videos;
    }
  } catch (error) {
    console.error('[youtube] scraper/API fetch failed', error);
    if (cachedFeed) return cachedFeed.data;
  }

  try {
    const videos = await fetchFromRss();
    if (videos.length > 0) {
      cachedFeed = { data: videos, fetchedAt: Date.now() };
    }
    return videos;
  } catch (rssError) {
    console.error('[youtube] RSS fallback failed', rssError);
    return cachedFeed?.data ?? [];
  }
}