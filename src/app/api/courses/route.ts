import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

const WP_BASE = 'https://www.apnipadhai.org/wp-json/wp/v2';

interface WpItem {
  id: number;
  title?: { rendered?: string };
  content?: { rendered?: string };
  link?: string;
  content_fields?: Record<string, unknown>;
}

function decode(s: string): string {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#039;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&#8211;/g, '\u2013')
    .replace(/&#8212;/g, '\u2014')
    .replace(/&#8216;/g, '\u2018')
    .replace(/&#8217;/g, '\u2019')
    .replace(/&#8220;/g, '\u201c')
    .replace(/&#8221;/g, '\u201d');
}

function strip(html: string): string {
  return html.replace(/<[^>]*>/g, '');
}

function field(item: WpItem, key: string): string {
  const v = item.content_fields?.[key];
  return typeof v === 'string' ? decode(v).trim() : '';
}

function listField(item: WpItem, key: string): string[] {
  const v = item.content_fields?.[key];
  if (Array.isArray(v)) return v.map((e) => (typeof e === 'string' ? e.trim() : '')).filter(Boolean);
  if (typeof v === 'string') return v.split('\n').map((e) => e.trim()).filter(Boolean);
  return [];
}

function mapCourse(item: WpItem) {
  return {
    id: `ap-course-${item.id}`,
    title: strip(decode(item.title?.rendered ?? '')).trim(),
    description: strip(decode(item.content?.rendered ?? '')).trim(),
    url: field(item, 'url') || item.link || '',
    image: field(item, 'image') || undefined,
    tag: field(item, 'tag') || undefined,
    tagline: field(item, 'tagline') || undefined,
    type: field(item, 'type') || undefined,
    features: listField(item, 'features'),
  };
}

export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  const page = Math.max(1, parseInt(sp.get('page') ?? '1', 10));
  const perPage = Math.min(50, Math.max(1, parseInt(sp.get('per_page') ?? '50', 10)));

  try {
    const params = new URLSearchParams({
      page: String(page),
      per_page: String(perPage),
      orderby: 'menu_order',
      order: 'asc',
      _fields: 'id,title,content,link,content_fields',
    });

    const res = await fetch(`${WP_BASE}/ap_course?${params}`, { next: { revalidate: 60 } });

    if (!res.ok) {
      return NextResponse.json({ courses: [], totalPages: 0, page });
    }

    const totalPages = parseInt(res.headers.get('X-WP-TotalPages') ?? '1', 10);
    const total = parseInt(res.headers.get('X-WP-Total') ?? '0', 10);
    const data = (await res.json()) as unknown;
    const courses = Array.isArray(data)
      ? (data as WpItem[]).map(mapCourse).filter((c) => c.title)
      : [];

    return NextResponse.json({ courses, totalPages, total, page }, {
      headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120' },
    });
  } catch (error) {
    console.error('[api/courses]', error);
    return NextResponse.json({ courses: [], totalPages: 0, page });
  }
}
