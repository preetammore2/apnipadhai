import { NextRequest, NextResponse } from 'next/server';
import { getSectionValue, type CourseSectionValue } from '@/lib/db-content';

export const runtime = 'nodejs';

// Legacy WordPress source. Kept as a secondary/fallback feed; the live catalog
// below comes from the apnipadhai.org (ClassX) platform.
const WP_BASE = 'https://www.apnipadhai.org/wp-json/wp/v2';

const FEATURED_URLS = [
  'https://apnipadhai.org/new-courses/75-reet-pre-complete-online-batch-sst-level-ii',
  'https://apnipadhai.org/new-courses/74-reet-pre-complete-online-batch-math-science-level-ii',
  'https://apnipadhai.org/new-courses/73-reet-pre-complete-online-batch-level-i',
  'https://apnipadhai.org/new-courses/61-ssc-gd-foundation-complete-online-course-30',
  'https://apnipadhai.org/new-courses/50-si-sub-inspector-2026-complete-online-batch-3-0',
  'https://apnipadhai.org/new-courses/59-bsf-constable-tradesman-2026-complete-online-course-30',
  'https://apnipadhai.org/new-courses/41-rajasthan-gk-complete-online-batch-20',
];

const CATALOG_URL = 'https://apnipadhai.org/new-courses';

interface WpItem {
  id: number;
  title?: { rendered?: string };
  content?: { rendered?: string };
  link?: string;
  content_fields?: Record<string, unknown>;
}

interface ClassxCourse {
  id: number;
  course_name: string;
  course_slug: string;
  course_description: string;
  exam_name: string;
  course_thumbnail?: string;
  image?: string;
  small_course_logo?: string;
  price?: string;
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
  return html.replace(/<[^>]*>/g, ' ');
}

function stripHtml(text: string): string {
  return strip(decode(text)).replace(/\s+/g, ' ').trim();
}

// --- ClassX / apnipadhai.org catalog (SSR JSON embedded in the page) ---

async function fetchHtml(url: string): Promise<string> {
  const res = await fetch(url, { next: { revalidate: 60 } });
  if (!res.ok) return '';
  return res.text();
}

/** Extract every JSON object literal that contains a `"course_slug"` key. */
function extractCourseObjects(html: string): ClassxCourse[] {
  const out: ClassxCourse[] = [];
  const slugRe = /"course_slug"\s*:\s*"([^"]+)"/g;
  let match: RegExpExecArray | null;
  while ((match = slugRe.exec(html)) !== null) {
    const slugIdx = match.index;
    let open = -1;
    for (let cand = slugIdx - 1; cand >= Math.max(0, slugIdx - 6000); cand -= 1) {
      if (html[cand] !== '{') continue;
      let depth = 0;
      let inString = false;
      let escaped = false;
      let close = -1;
      for (let k = cand; k < html.length; k += 1) {
        const ch = html[k];
        if (inString) {
          if (escaped) escaped = false;
          else if (ch === '\\') escaped = true;
          else if (ch === '"') inString = false;
          continue;
        }
        if (ch === '"') {
          inString = true;
        } else if (ch === '{') {
          depth += 1;
        } else if (ch === '}') {
          depth -= 1;
          if (depth === 0) {
            close = k;
            break;
          }
        }
      }
      if (close !== -1 && close >= slugIdx) {
        open = cand;
        break;
      }
    }
    if (open === -1) continue;
    let depth = 0;
    let inString = false;
    let escaped = false;
    let close = -1;
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
        if (depth === 0) {
          close = k;
          break;
        }
      }
    }
    if (close === -1) continue;
    try {
      const obj = JSON.parse(html.slice(open, close + 1)) as Partial<ClassxCourse>;
      if (!obj.course_slug) continue;
      out.push({
        id: Number(obj.id ?? 0) || 0,
        course_name: obj.course_name ?? '',
        course_slug: obj.course_slug,
        course_description: obj.course_description ?? '',
        exam_name: obj.exam_name ?? '',
        course_thumbnail:
          obj.course_thumbnail ?? obj.image ?? obj.small_course_logo ?? '',
        price: obj.price ?? '',
      });
    } catch {
      // malformed object; skip
    }
  }
  return out;
}

function mapClassx(item: ClassxCourse) {
  const description = stripHtml(item.course_description).slice(0, 220);
  const image =
    item.course_thumbnail ||
    item.image ||
    item.small_course_logo ||
    undefined;
  return {
    id: `classx-${item.id}`,
    title: decode(item.course_name).trim(),
    description,
    url: item.id
      ? `https://apnipadhai.org/new-courses/${item.id}-${item.course_slug}`
      : '',
    image: image ? decode(image) : undefined,
    tag: item.exam_name ? item.exam_name.trim() : undefined,
    tagline: undefined,
    type: 'Online Batch',
    features: [],
  };
}

async function fetchClassxCatalog(): Promise<ReturnType<typeof mapClassx>[]> {
  const [catalogHtml, ...featuredHtml] = await Promise.all([
    fetchHtml(CATALOG_URL),
    ...FEATURED_URLS.map((url) => fetchHtml(url)),
  ]);

const seen = new Set<number>();
  const courses: { course: ReturnType<typeof mapClassx>; order: number }[] = [];
  const pushAll = (html: string, index: number) => {
    for (const obj of extractCourseObjects(html)) {
      if (!obj.id || seen.has(obj.id)) continue;
      seen.add(obj.id);
      courses.push({ course: mapClassx(obj), order: index });
    }
  };
  featuredHtml.forEach((html, i) => pushAll(html, i));
  pushAll(catalogHtml, Number.MAX_SAFE_INTEGER);

  return courses
    .sort((a, b) => a.order - b.order)
    .map(({ course }) => course);
}

// --- Legacy WordPress fallback ---

async function fetchCourses(
  params: URLSearchParams,
): Promise<{ items: WpItem[]; totalPages: number; total: number }> {
  const res = await fetch(`${WP_BASE}/ap_course?${params}`, { next: { revalidate: 60 } });
  if (!res.ok) return { items: [], totalPages: 0, total: 0 };
  const totalPages = parseInt(res.headers.get('X-WP-TotalPages') ?? '1', 10);
  const total = parseInt(res.headers.get('X-WP-Total') ?? '0', 10);
  const data = (await res.json()) as unknown;
  return {
    items: Array.isArray(data) ? (data as WpItem[]) : [],
    totalPages,
    total,
  };
}

function wpField(item: WpItem, key: string): string {
  const v = item.content_fields?.[key];
  return typeof v === 'string' ? decode(v).trim() : '';
}

function wpListField(item: WpItem, key: string): string[] {
  const v = item.content_fields?.[key];
  if (Array.isArray(v)) return v.map((e) => (typeof e === 'string' ? e.trim() : '')).filter(Boolean);
  if (typeof v === 'string') return v.split('\n').map((e) => e.trim()).filter(Boolean);
  return [];
}

function mapWpCourse(item: WpItem) {
  return {
    id: `ap-course-${item.id}`,
    title: stripHtml(item.title?.rendered ?? ''),
    description: stripHtml(item.content?.rendered ?? '').slice(0, 220),
    url: wpField(item, 'url') || item.link || '',
    image: wpField(item, 'image') || undefined,
    tag: wpField(item, 'tag') || undefined,
    tagline: wpField(item, 'tagline') || undefined,
    type: wpField(item, 'type') || undefined,
    features: wpListField(item, 'features'),
  };
}

function mapManagedCourse(item: CourseSectionValue, index: number) {
  return {
    id: `managed-course-${index + 1}`,
    title: decode(item.title ?? '').trim(),
    description: stripHtml(item.description ?? '').slice(0, 220),
    url: (item.url ?? '').trim(),
    image: item.image?.trim() || undefined,
    tag: item.tag?.trim() || undefined,
    tagline: item.tagline?.trim() || undefined,
    type: item.type?.trim() || undefined,
    features: Array.isArray(item.features)
      ? item.features.map((f) => String(f).trim()).filter(Boolean)
      : [],
  };
}

/** MongoDB-managed courses (edited via the admin portal / seeded defaults). */
async function fetchManagedCourses(): Promise<ReturnType<typeof mapManagedCourse>[]> {
  try {
    const value = await getSectionValue<CourseSectionValue[]>('courses');
    if (!Array.isArray(value)) return [];
    return value
      .filter((item) => (item.title ?? '').trim())
      .map(mapManagedCourse);
  } catch {
    return [];
  }
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

    const [classxCatalog, managedCourses, wpPage] = await Promise.all([
      fetchClassxCatalog(),
      fetchManagedCourses(),
      fetchCourses(params).catch(() => ({ items: [] as WpItem[], totalPages: 0, total: 0 })),
    ]);

    const seen = new Set<string>();
    const courses = [
      ...managedCourses,
      ...classxCatalog,
      ...wpPage.items.map(mapWpCourse),
    ].filter((c) =>
      c.title && !seen.has(c.id) ? (seen.add(c.id), true) : false,
    );

    const totalPages = managedCourses.length > 0 || classxCatalog.length > 0 ? 1 : wpPage.totalPages;
    return NextResponse.json({ courses, totalPages, total: courses.length, page }, {
      headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120' },
    });
  } catch (error) {
    console.error('[api/courses]', error);
    return NextResponse.json({ courses: [], totalPages: 0, page });
  }
}