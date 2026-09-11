const WP_URL = process.env.WP_URL ?? 'https://apnipadhaipublication.com';
const WP_API = `${WP_URL}/wp-json/wp/v2`;

const CONTENT_REVALIDATE_SECONDS = Number(process.env.WP_REVALIDATE_SECONDS ?? '60');

import { readAllSections, type FaqSectionValue, type TestimonialSectionValue, type CourseSectionValue } from '@/lib/db-content';

export interface SiteHero {
  title: string;
  highlight: string;
  subtitle: string;
}

export interface SiteTestimonial {
  id: string;
  name: string;
  exam: string;
  quote: string;
  rating: number;
  photo: string;
  city: string;
  rank?: string;
}

export interface SiteFaq {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export interface SiteCourse {
  id: string;
  title: string;
  description: string;
  url: string;
  image?: string;
  tag?: string;
  tagline?: string;
  type?: string;
  features?: string[];
}

export interface SiteContent {
  hero: SiteHero | null;
  testimonials: SiteTestimonial[] | null;
  faqs: SiteFaq[] | null;
  courses: SiteCourse[] | null;
}

function stripHtml(html: string): string {
  return (html ?? '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function decodeEntities(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&nbsp;/g, ' ');
}

const PLACEHOLDER_RE = /lorem\s+ipsum|aliquam non tincidunt|dolor sit amet|\bplaceholder\b/i;

/** True for empty or lorem-ipsum placeholder text (e.g. unbuilt WP templates). */
export function isPlaceholderText(value: string): boolean {
  const text = (value ?? '').trim();
  return text === '' || PLACEHOLDER_RE.test(text);
}

async function fetchPageHtml(slug: string): Promise<string | null> {
  try {
    const params = new URLSearchParams({ slug, _fields: 'content' });
    const res = await fetch(`${WP_API}/pages?${params.toString()}`, {
      next: { revalidate: CONTENT_REVALIDATE_SECONDS },
    });
    if (!res.ok) return null;
    const pages = (await res.json()) as { content?: { rendered?: string } }[];
    const html = pages[0]?.content?.rendered;
    return html && html.trim() ? html : null;
  } catch {
    return null;
  }
}

/**
 * Slugs to read each section from, in priority order. The admin content editor
 * writes to the `ap-*` pages; the legacy slugs are kept so pre-existing
 * hand-authored pages (home-hero, testimonials, faq, courses) still work.
 */
const CONTENT_PAGE_SLUGS: Record<keyof SiteContent, string[]> = {
  hero: ['ap-home-hero', 'home-hero'],
  testimonials: ['ap-testimonials', 'testimonials'],
  faqs: ['ap-faqs', 'faq'],
  courses: ['ap-courses', 'courses'],
};

async function fetchSectionHtml(section: keyof SiteContent): Promise<string | null> {
  for (const slug of CONTENT_PAGE_SLUGS[section]) {
    const html = await fetchPageHtml(slug);
    if (html) return html;
  }
  return null;
}

export function parseHero(html: string): SiteHero | null {
  const titleMatch = html.match(/<h([12])[^>]*>([\s\S]*?)<\/h\1>/i);
  if (!titleMatch) return null;
  const titleText = stripHtml(decodeEntities(titleMatch[2]));
  const highlightMatch = titleMatch[2].match(
    /<(strong|b|em|span|mark)[^>]*>([\s\S]*?)<\/\1>/i,
  );
  const highlight = highlightMatch
    ? stripHtml(decodeEntities(highlightMatch[2]))
    : '';
  const subtitleMatch = html.match(/<p[^>]*>([\s\S]*?)<\/p>/i);
  const subtitle = subtitleMatch
    ? stripHtml(decodeEntities(subtitleMatch[1]))
    : '';
  if (!titleText && !subtitle) return null;
  return { title: titleText, highlight, subtitle };
}

export function parseTestimonials(html: string): SiteTestimonial[] | null {
  const items: SiteTestimonial[] = [];
  const blockquoteRe = /<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi;
  let match: RegExpExecArray | null;
  while ((match = blockquoteRe.exec(html)) !== null && items.length < 60) {
    const inner = match[1];
    const quote = stripHtml(
      decodeEntities(
        inner
          .replace(/<(cite|figcaption|footer)[^>]*>[\s\S]*?<\/\1>/gi, '')
          .replace(/<img[^>]*>/gi, ''),
      ),
    );
    if (!quote) continue;

    const citeMatch = inner.match(
      /<(cite|figcaption|footer)[^>]*>([\s\S]*?)<\/\1>/i,
    );
    const citeText = citeMatch
      ? stripHtml(decodeEntities(citeMatch[2]))
      : '';
    const [name = '', exam = '', city = ''] = citeText
      .split(/[|•·–-]/)
      .map((part) => part.trim());

    const imgMatch = inner.match(/<img[^>]+src=["']([^"']+)["']/i);

    items.push({
      id: `wp-testimonial-${items.length + 1}`,
      name: name || 'Apni Padhai Student',
      exam: exam || 'Government Exam',
      city,
      quote,
      rating: 5,
      photo: imgMatch?.[1] ?? '',
    });
  }
  return items.length > 0 ? items : null;
}

const FAQ_CATEGORY_HINTS: { category: string; pattern: RegExp }[] = [
  {
    category: 'Courses & Test Series',
    pattern: /course|batch|class|test series|coaching|mentor|doubt/i,
  },
  {
    category: 'Payments & Refunds',
    pattern: /refund|return|cancel|pay|upi|price|payment|invoice/i,
  },
  {
    category: 'Books',
    pattern: /book|edition|pdf|sample|print/i,
  },
  {
    category: 'Account & App',
    pattern: /app|account|login|password|download|phone|whatsapp|support/i,
  },
  {
    category: 'Orders & Delivery',
    pattern: /order|delivery|track|tracking|ship|shipping|dispatch/i,
  },
];

function guessFaqCategory(question: string, answer: string): string {
  const text = `${question} ${answer}`.toLowerCase();
  for (const hint of FAQ_CATEGORY_HINTS) {
    if (hint.pattern.test(text)) return hint.category;
  }
  return 'Orders & Delivery';
}

export function parseFaqs(html: string): SiteFaq[] | null {
  const items: SiteFaq[] = [];
  const qaRe = /<h([23])[^>]*>([\s\S]*?)<\/h\1>\s*(?:<p[^>]*>([\s\S]*?)<\/p>)?/gi;
  let match: RegExpExecArray | null;
  while ((match = qaRe.exec(html)) !== null && items.length < 100) {
    const question = stripHtml(decodeEntities(match[2]));
    const answer = match[3] ? stripHtml(decodeEntities(match[3])) : '';
    if (!question || isPlaceholderText(question) || isPlaceholderText(answer)) continue;
    items.push({
      id: `wp-faq-${items.length + 1}`,
      question,
      answer,
      category: guessFaqCategory(question, answer),
    });
  }
  return items.length > 0 ? items : null;
}

export function parseCourses(html: string): SiteCourse[] | null {
  const items: SiteCourse[] = [];
  const sections = html.split(/<h[23][^>]*>/i).slice(1);
  for (const section of sections) {
    const head = section.split('</h')[0] ?? '';
    const title = stripHtml(decodeEntities(head));
    if (!title) continue;
    const rest = section.includes('</h') ? section.slice(section.indexOf('</h') + 4) : '';
    const pMatch = rest.match(/<p[^>]*>([\s\S]*?)<\/p>/i);
    const description = pMatch ? stripHtml(decodeEntities(pMatch[1])) : '';
    const aMatch = rest.match(/<a[^>]+href=["']([^"']+)["']/i);
    items.push({
      id: `wp-course-${items.length + 1}`,
      title,
      description,
      url: aMatch?.[1] ?? '',
    });
  }
  return items.length > 0 ? items : null;
}

// --- Structured content (Apni Padhai Site Content WordPress plugin) ---

interface WpContentItem {
  id: number;
  title?: { rendered?: string };
  content?: { rendered?: string };
  link?: string;
  content_fields?: Record<string, unknown>;
}

const STRUCTURED_BASE: Record<keyof SiteContent, string> = {
  hero: 'ap_hero',
  testimonials: 'ap_testimonial',
  faqs: 'ap_faq',
  courses: 'ap_course',
};

async function fetchStructuredItems(section: keyof SiteContent): Promise<WpContentItem[]> {
  try {
    const params = new URLSearchParams({
      per_page: '100',
      orderby: 'menu_order',
      order: 'asc',
      _fields: 'id,title,content,link,content_fields',
    });
    const res = await fetch(`${WP_API}/${STRUCTURED_BASE[section]}?${params.toString()}`, {
      next: { revalidate: CONTENT_REVALIDATE_SECONDS },
    });
    if (!res.ok) return [];
    const data = (await res.json()) as unknown;
    return Array.isArray(data) ? (data as WpContentItem[]) : [];
  } catch {
    return [];
  }
}

function textField(item: WpContentItem, key: string): string {
  const value = item.content_fields?.[key];
  return typeof value === 'string' ? decodeEntities(value).trim() : '';
}

function listField(item: WpContentItem, key: string): string[] {
  const value = item.content_fields?.[key];
  if (Array.isArray(value)) {
    return value
      .map((entry) => (typeof entry === 'string' ? entry.trim() : ''))
      .filter(Boolean);
  }
  if (typeof value === 'string') {
    return value
      .split('\n')
      .map((entry) => entry.trim())
      .filter(Boolean);
  }
  return [];
}

function renderedTitle(item: WpContentItem): string {
  return stripHtml(decodeEntities(item.title?.rendered ?? '')).trim();
}

function renderedContent(item: WpContentItem): string {
  return stripHtml(decodeEntities(item.content?.rendered ?? '')).trim();
}

export function mapStructuredHero(items: WpContentItem[]): SiteHero | null {
  const item = items[0];
  if (!item) return null;
  const title = renderedTitle(item);
  const subtitle = textField(item, 'subtitle');
  if (!title && !subtitle) return null;
  return {
    title,
    highlight: textField(item, 'highlight'),
    subtitle,
  };
}

export function mapStructuredTestimonials(items: WpContentItem[]): SiteTestimonial[] | null {
  const list: SiteTestimonial[] = [];
  for (const item of items) {
    const name = renderedTitle(item);
    const quote = renderedContent(item);
    if (!name || !quote) continue;
    const rating = Number(textField(item, 'rating'));
    const rank = textField(item, 'rank');
    list.push({
      id: `ap-testimonial-${item.id}`,
      name,
      exam: textField(item, 'exam') || 'Government Exam',
      city: textField(item, 'city'),
      quote,
      rating: Number.isFinite(rating) && rating >= 1 ? Math.min(5, Math.round(rating)) : 5,
      photo: textField(item, 'photo'),
      rank: rank || undefined,
    });
  }
  return list.length > 0 ? list : null;
}

export function mapStructuredFaqs(items: WpContentItem[]): SiteFaq[] | null {
  const list: SiteFaq[] = [];
  for (const item of items) {
    const question = renderedTitle(item);
    const answer = renderedContent(item);
    if (!question) continue;
    list.push({
      id: `ap-faq-${item.id}`,
      question,
      answer,
      category: textField(item, 'category') || guessFaqCategory(question, answer),
    });
  }
  return list.length > 0 ? list : null;
}

export function mapStructuredCourses(items: WpContentItem[]): SiteCourse[] | null {
  const list: SiteCourse[] = [];
  for (const item of items) {
    const title = renderedTitle(item);
    if (!title) continue;
    list.push({
      id: `ap-course-${item.id}`,
      title,
      description: renderedContent(item),
      url: textField(item, 'url') || '',
      image: textField(item, 'image') || undefined,
      tag: textField(item, 'tag') || undefined,
      tagline: textField(item, 'tagline') || undefined,
      type: textField(item, 'type') || undefined,
      features: listField(item, 'features'),
    });
  }
  return list.length > 0 ? list : null;
}

/** WordPress-only read for a single section (structured API first, then HTML parse). */
export async function computeWpSection(
  section: keyof SiteContent,
): Promise<SiteHero | SiteTestimonial[] | SiteFaq[] | SiteCourse[] | null> {
  const [structured, html] = await Promise.all([
    fetchStructuredItems(section),
    fetchSectionHtml(section),
  ]);
  switch (section) {
    case 'hero':
      return mapStructuredHero(structured) ?? (html ? parseHero(html) : null);
    case 'testimonials':
      return mapStructuredTestimonials(structured) ?? (html ? parseTestimonials(html) : null);
    case 'faqs':
      return mapStructuredFaqs(structured) ?? (html ? parseFaqs(html) : null);
    case 'courses':
      return mapStructuredCourses(structured) ?? (html ? parseCourses(html) : null);
  }
}

function normalizeManagedTestimonials(items: TestimonialSectionValue[] | null): SiteTestimonial[] | null {
  if (!items) return null;
  const list = items
    .filter((item) => (item.quote ?? '').trim())
    .map((item, index) => ({
      id: `managed-testimonial-${index + 1}`,
      name: (item.name ?? '').trim() || 'Apni Padhai Student',
      exam: (item.exam ?? '').trim() || 'Government Exam',
      city: (item.city ?? '').trim(),
      quote: (item.quote ?? '').trim(),
      rating: 5,
      photo: (item.photo ?? '').trim(),
    }));
  return list.length > 0 ? list : null;
}

function normalizeTestimonialName(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, ' ');
}

function mergeByKey<T>(
  managed: T[] | null,
  wp: T[] | null,
  keyOf: (item: T) => string,
): T[] | null {
  if (!managed) return wp;
  if (!wp) return managed;
  const seen = new Set(managed.map((item) => keyOf(item)));
  const extra = wp.filter((item) => !seen.has(keyOf(item)));
  return extra.length > 0 ? [...managed, ...extra] : managed;
}

/**
 * Merge Firebase-managed testimonials with the WordPress ap_testimonial items so
 * images come from BOTH stores. Firebase entries win; WordPress adds any
 * students not already present (matched by name).
 */
function normalizeManagedFaqs(items: FaqSectionValue[] | null): SiteFaq[] | null {
  if (!items) return null;
  const list = items
    .filter((item) => (item.question ?? '').trim())
    .map((item, index) => ({
      id: `managed-faq-${index + 1}`,
      question: (item.question ?? '').trim(),
      answer: (item.answer ?? '').trim(),
      category: guessFaqCategory(item.question ?? '', item.answer ?? ''),
    }));
  return list.length > 0 ? list : null;
}

function normalizeManagedCourses(items: CourseSectionValue[] | null): SiteCourse[] | null {
  if (!items) return null;
  const list = items
    .filter((item) => (item.title ?? '').trim())
    .map((item, index) => ({
      id: `managed-course-${index + 1}`,
      title: (item.title ?? '').trim(),
      description: (item.description ?? '').trim(),
      url: (item.url ?? '').trim(),
      image: item.image || undefined,
      tag: item.tag || undefined,
      tagline: item.tagline || undefined,
      type: item.type || undefined,
      features: Array.isArray(item.features) ? item.features.filter((f) => String(f).trim()) : undefined,
    }));
  return list.length > 0 ? list : null;
}

/**
 * Read site content. Sections edited through the admin portal (stored in
 * Firebase) win; any section with no managed content falls back to the
 * WordPress source so the site keeps showing existing content until it is
 * migrated.
 */
export async function getSiteContent(): Promise<SiteContent> {
  try {
    const managed = await readAllSections();
    const missing: (keyof SiteContent)[] = [];
    if (!managed.hero) missing.push('hero');

    // Testimonials, FAQs and courses are always fetched from WordPress as well
    // so they can be MERGED with the Firebase entries (both stores contribute).
    const wpSections: (keyof SiteContent)[] = [
      ...new Set<keyof SiteContent>(['testimonials', 'faqs', 'courses', ...missing]),
    ];
    const wpValues = await Promise.all(wpSections.map((section) => computeWpSection(section)));
    const wp = Object.fromEntries(wpSections.map((section, index) => [section, wpValues[index]])) as Partial<
      Record<keyof SiteContent, SiteHero | SiteTestimonial[] | SiteFaq[] | SiteCourse[] | null>
    >;

    return {
      hero:
        (managed.hero as SiteHero) ??
        ((wp.hero as SiteHero | null) ?? null),
      testimonials: mergeByKey(
        normalizeManagedTestimonials(managed.testimonials),
        (wp.testimonials as SiteTestimonial[] | null) ?? null,
        (item) => normalizeTestimonialName(item.name),
      ),
      faqs: mergeByKey(
        normalizeManagedFaqs(managed.faqs),
        (wp.faqs as SiteFaq[] | null) ?? null,
        (item) => normalizeTestimonialName(item.question),
      ),
      courses: mergeByKey(
        normalizeManagedCourses(managed.courses),
        (wp.courses as SiteCourse[] | null) ?? null,
        (item) => normalizeTestimonialName(item.title),
      ),
    };
  } catch (error) {
    console.error('[site-content] Firebase unavailable, using WordPress', error);
    const [hero, testimonials, faqs, courses] = await Promise.all([
      computeWpSection('hero'),
      computeWpSection('testimonials'),
      computeWpSection('faqs'),
      computeWpSection('courses'),
    ]);
    return {
      hero: (hero as SiteHero | null) ?? null,
      testimonials: (testimonials as SiteTestimonial[] | null) ?? null,
      faqs: (faqs as SiteFaq[] | null) ?? null,
      courses: (courses as SiteCourse[] | null) ?? null,
    };
  }
}
