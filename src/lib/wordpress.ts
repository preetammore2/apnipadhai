import { PYQ } from '@/types';

const WP_URL = process.env.WP_URL ?? 'https://apnipadhaipublication.com';
const WP_API = `${WP_URL}/wp-json/wp/v2`;

const WP_REVALIDATE_SECONDS = Number(process.env.WP_REVALIDATE_SECONDS ?? '60');

export interface WordPressPost {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  contentHtml: string;
  date: string;
  modified: string;
  link: string;
  author: string;
  categories: string[];
  categoryNames: string[];
  imageUrl: string;
  tags: string[];
}

export interface WordPressCategory {
  id: number;
  name: string;
  slug: string;
  count: number;
}

function stripHtml(html: string | undefined): string {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function extractFirstImage(html: string | undefined): string {
  if (!html) return '';
  const match = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  return match?.[1] ?? '';
}

interface EmbeddedTerm {
  taxonomy: string;
  name: string;
  slug: string;
}

interface RawPost {
  id: number;
  slug: string;
  link: string;
  date: string;
  modified: string;
  title: { rendered: string };
  excerpt: { rendered: string };
  content: { rendered: string };
  categories: number[];
  tags: number[];
  author: number;
  _embedded?: {
    author?: { name: string }[];
    'wp:featuredmedia'?: { source_url: string }[];
    'wp:term'?: EmbeddedTerm[][];
  };
}

const rawParams = (perPage: number): string =>
  new URLSearchParams({
    per_page: String(perPage),
    _embed: 'true',
  }).toString();

export async function getCategories(): Promise<WordPressCategory[]> {
  try {
    const params = new URLSearchParams({
      per_page: '100',
      _fields: ['id', 'name', 'slug', 'count'].join(','),
    });
    const res = await fetch(`${WP_API}/categories?${params.toString()}`, {
      next: { revalidate: WP_REVALIDATE_SECONDS },
    });
    if (!res.ok) return [];
    const raw = (await res.json()) as WordPressCategory[];
    return raw.filter((c) => c.count > 0);
  } catch {
    return [];
  }
}

export interface WordPressPdf {
  id: string;
  title: string;
  url: string;
  source: string;
}

export interface BookSample {
  keyword: string;
  title: string;
  pdfUrl: string;
}

async function getPageBySlug(slug: string): Promise<{ title: string; contentHtml: string } | undefined> {
  try {
    const params = new URLSearchParams({
      slug,
      _fields: ['id', 'title', 'content'].join(','),
    });
    const res = await fetch(`${WP_API}/pages?${params.toString()}`, {
      next: { revalidate: WP_REVALIDATE_SECONDS },
    });
    if (!res.ok) return undefined;
    const pages = (await res.json()) as {
      id: number;
      title: { rendered: string };
      content: { rendered: string };
    }[];
    const page = pages[0];
    if (!page) return undefined;
    return { title: stripHtml(page.title.rendered), contentHtml: page.content.rendered ?? '' };
  } catch {
    return undefined;
  }
}

function extractPdfLinks(contentHtml: string): string[] {
  const urls: string[] = [];
  const pattern = /href="([^"]+\.pdf(?:\?[^"]*)?)"/gi;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(contentHtml)) !== null) {
    urls.push(match[1]);
  }
  return [...new Set(urls)];
}

function pdfFileName(url: string): string {
  const clean = url.split('?')[0];
  const name = clean.split('/').pop() ?? '';
  return name.replace(/\.pdf$/i, '');
}

export async function getPdfLinks(pageSlug: string): Promise<WordPressPdf[]> {
  const page = await getPageBySlug(pageSlug);
  if (!page) return [];
  return extractPdfLinks(page.contentHtml).map((url, index) => ({
    id: `${pageSlug}-${index + 1}`,
    title: page.title || titleFromFileName(pdfFileName(url)),
    url,
    source: pageSlug,
  }));
}

function titleFromFileName(fileName: string): string {
  return fileName
    .replace(/[-_]+/g, ' ')
    .replace(/\b[a-z]/g, (c) => c.toUpperCase())
    .trim();
}

const PYQ_PAGE_SLUGS = ['ras-previous-year-papers', 'all-previous-year-paper'];

function derivePyq(link: WordPressPdf): PYQ {
  const fileName = pdfFileName(link.url);
  const year = Number(fileName.match(/(\d{4})/)?.[1] ?? 0);
  const isMains = /mains/i.test(fileName);
  const isRas = link.source === 'ras-previous-year-papers';

  let title: string;
  if (isRas) {
    title = isMains
      ? `RAS Mains Official Solved Question Paper ${year || ''}`.trim()
      : `RAS Prelims Official Solved Question Paper ${year || ''}`.trim();
  } else {
    const shiftMatch = fileName.match(/GK[-_]?(\d{1,2})$/i);
    const shift = shiftMatch ? ` - Shift ${shiftMatch[1]}` : '';
    title = `SI Official Solved Question Paper ${year || ''}${shift} (General Knowledge)`.trim();
  }

  const subject = isRas && isMains
    ? 'General Hindi, English, GK & Essay Papers'
    : 'General Knowledge & General Science';

  return {
    id: link.id,
    title,
    examName: isRas ? 'Rajasthan Administrative Service (RAS)' : 'Rajasthan Police Sub Inspector',
    category: isRas ? 'RAS' : 'Sub Inspector',
    year,
    state: 'Rajasthan',
    downloadUrl: link.url,
    hasSolution: true,
    subject,
  };
}

export async function getPyqs(): Promise<PYQ[]> {
  const results = await Promise.all(PYQ_PAGE_SLUGS.map((slug) => getPdfLinks(slug)));
  const links = results.flat();
  if (links.length === 0) {
    throw new Error('WordPress PYQ request failed');
  }
  return links.map(derivePyq);
}

const SAMPLE_TOPIC_PATTERNS: { pattern: RegExp; keyword: string }[] = [
  { pattern: /culture|art/i, keyword: 'art' },
  { pattern: /history/i, keyword: 'history' },
  { pattern: /geograph|geo/i, keyword: 'geo' },
  { pattern: /computer/i, keyword: 'computer' },
  { pattern: /हिन्दी|हिंदी|hindi/i, keyword: 'hindi' },
  { pattern: /english/i, keyword: 'english' },
  { pattern: /math|ganit|ankganit/i, keyword: 'ganit' },
  { pattern: /polity/i, keyword: 'polity' },
  { pattern: /science/i, keyword: 'science' },
  { pattern: /4th|fourth|iv-?th/i, keyword: '4th grade' },
];

async function getMediaPdfLinks(): Promise<string[]> {
  try {
    const urls: string[] = [];
    for (let page = 1; page <= 3; page++) {
      const params = new URLSearchParams({
        per_page: '100',
        page: String(page),
        media_type: 'application',
        _fields: 'source_url,mime_type',
      });
      const res = await fetch(`${WP_API}/media?${params.toString()}`, {
        next: { revalidate: WP_REVALIDATE_SECONDS },
      });
      if (!res.ok) break;
      const items = (await res.json()) as { source_url: string; mime_type?: string }[];
      if (!Array.isArray(items) || items.length === 0) break;
      for (const item of items) {
        if (item.source_url?.toLowerCase().endsWith('.pdf')) urls.push(item.source_url);
      }
      if (items.length < 100) break;
    }
    return [...new Set(urls)];
  } catch {
    return [];
  }
}

export async function getBookSamples(): Promise<BookSample[]> {
  const page = await getPageBySlug('book-sample-pdf');
  const pageLinks = page ? extractPdfLinks(page.contentHtml) : [];
  const mediaLinks = await getMediaPdfLinks();
  const links = [...new Set([...pageLinks, ...mediaLinks])];

  return links
    .map((url) => {
      const fileName = pdfFileName(url);
      const topic = SAMPLE_TOPIC_PATTERNS.find((p) => p.pattern.test(fileName));
      if (!topic) return null;
      return {
        keyword: topic.keyword,
        title: titleFromFileName(fileName),
        pdfUrl: url,
      };
    })
    .filter((sample): sample is BookSample => Boolean(sample));
}

export async function getPosts(perPage = 50): Promise<WordPressPost[]> {
  const [postRes, categories] = await Promise.all([
    fetch(`${WP_API}/posts?${rawParams(perPage)}`, {
      next: { revalidate: WP_REVALIDATE_SECONDS },
    }),
    getCategories(),
  ]);

  if (!postRes.ok) {
    throw new Error(`WordPress posts request failed (${postRes.status})`);
  }

  const posts = (await postRes.json()) as RawPost[];
  const categoryNameById = new Map(categories.map((c) => [c.id, c.name]));

  return posts.map((post) => {
    const author = post._embedded?.author?.[0]?.name ?? 'Apni Padhai';
    const imageUrl =
      post._embedded?.['wp:featuredmedia']?.[0]?.source_url ??
      extractFirstImage(post.content.rendered ?? '');
    const tags =
      post._embedded?.['wp:term']
        ?.flat()
        .filter((term) => term.taxonomy === 'post_tag')
        .map((term) => term.name) ?? [];
    const categoryNames = post.categories
      .map((id) => categoryNameById.get(id))
      .filter((name): name is string => Boolean(name));
    const contentHtml = post.content.rendered ?? '';

    return {
      id: post.id,
      slug: post.slug,
      link: post.link,
      date: post.date,
      modified: post.modified ?? post.date,
      title: stripHtml(post.title.rendered),
      excerpt: stripHtml(post.excerpt.rendered) || stripHtml(post.content.rendered).slice(0, 200),
      content: stripHtml(post.content.rendered),
      contentHtml,
      categories: post.categories.map((id) => String(id)),
      categoryNames: categoryNames.length > 0 ? categoryNames : ['Blog'],
      imageUrl,
      author,
      tags,
    };
  });
}
