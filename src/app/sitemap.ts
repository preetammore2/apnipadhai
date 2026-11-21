import type { MetadataRoute } from 'next';
import { getDiscountedBooks } from '@/lib/db-book-discount';
import { UPDATES_DATA } from '@/data/updates';
import { getSiteUrl } from '@/lib/site-url';

// Rebuild the sitemap at most once an hour so new books show up without a redeploy.
export const revalidate = 3600;

type Entry = MetadataRoute.Sitemap[number];

/** Public pages. Checkout, payment, wishlist and admin are left out on purpose. */
const STATIC_PAGES: { path: string; priority: number; changeFrequency: Entry['changeFrequency'] }[] = [
  { path: '', priority: 1, changeFrequency: 'daily' },
  { path: '/books', priority: 0.9, changeFrequency: 'daily' },
  { path: '/updates', priority: 0.8, changeFrequency: 'weekly' },
  { path: '/pyqs', priority: 0.8, changeFrequency: 'weekly' },
  { path: '/results', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/download-app', priority: 0.6, changeFrequency: 'monthly' },
  { path: '/about', priority: 0.5, changeFrequency: 'monthly' },
  { path: '/contact', priority: 0.5, changeFrequency: 'monthly' },
  { path: '/faq', priority: 0.5, changeFrequency: 'monthly' },
  { path: '/careers', priority: 0.4, changeFrequency: 'monthly' },
  { path: '/feedback', priority: 0.3, changeFrequency: 'yearly' },
  { path: '/track-order', priority: 0.3, changeFrequency: 'yearly' },
  { path: '/shipping-policy', priority: 0.2, changeFrequency: 'yearly' },
  { path: '/refund-policy', priority: 0.2, changeFrequency: 'yearly' },
  { path: '/privacy-policy', priority: 0.2, changeFrequency: 'yearly' },
  { path: '/terms-conditions', priority: 0.2, changeFrequency: 'yearly' },
];

function parseDate(value: string | undefined): Date | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  const now = new Date();

  const pages: MetadataRoute.Sitemap = STATIC_PAGES.map((page) => ({
    url: `${base}${page.path}`,
    lastModified: now,
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }));

  // If WooCommerce is unreachable, still serve the rest of the sitemap.
  let books: MetadataRoute.Sitemap = [];
  try {
    books = (await getDiscountedBooks()).map((book) => ({
      url: `${base}/books/${encodeURIComponent(book.id)}`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: book.inStock ? 0.8 : 0.5,
      ...(book.coverImage ? { images: [book.coverImage] } : {}),
    }));
  } catch (error) {
    console.error('[sitemap] could not load books', error);
  }

  const updates: MetadataRoute.Sitemap = UPDATES_DATA.map((article) => ({
    url: `${base}/updates/${encodeURIComponent(article.slug)}`,
    lastModified: parseDate(article.date) ?? now,
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  return [...pages, ...books, ...updates];
}
