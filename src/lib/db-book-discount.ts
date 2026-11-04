import { COLLECTIONS, getDb, isDbConfigured } from '@/lib/db';
import { applyBookDiscount, BOOK_DISCOUNT_DEFAULTS, type BookDiscount } from '@/lib/book-discount';
import { getBookById, getBooks } from '@/lib/woocommerce';
import type { Book } from '@/types';

/**
 * The store-wide book discount, stored in Firestore as
 * `storeSettings/bookDiscount`. Server-only.
 */
const DISCOUNT_DOC = 'bookDiscount';
const CACHE_MS = 30 * 1000;

let cached: { value: BookDiscount | null; at: number } | null = null;

function parse(data: Record<string, unknown>): BookDiscount {
  const value = Number(data.value);
  return {
    enabled: data.enabled === true,
    type: data.type === 'flat' ? 'flat' : 'percent',
    value: Number.isFinite(value) && value > 0 ? value : 0,
    base: data.base === 'mrp' ? 'mrp' : 'selling',
    expiresAt:
      typeof data.expiresAt === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(data.expiresAt)
        ? data.expiresAt
        : null,
  };
}

export async function getBookDiscount(): Promise<BookDiscount | null> {
  if (!isDbConfigured()) return null;
  const doc = await getDb().collection(COLLECTIONS.storeSettings).doc(DISCOUNT_DOC).get();
  return doc.exists ? parse(doc.data() ?? {}) : null;
}

export async function setBookDiscount(value: BookDiscount): Promise<void> {
  await getDb()
    .collection(COLLECTIONS.storeSettings)
    .doc(DISCOUNT_DOC)
    .set({ ...value, updatedAt: new Date() });
  cached = { value, at: Date.now() };
}

/**
 * Discount used for pricing. Cached for 30s (every page load reads book
 * prices). A Firebase failure means "no discount", never a broken shop.
 */
async function getDiscountForPricing(): Promise<BookDiscount | null> {
  if (cached && Date.now() - cached.at < CACHE_MS) return cached.value;
  const value = await getBookDiscount().catch((error) => {
    console.error('[book-discount] could not read discount from Firebase', error);
    return null;
  });
  cached = { value, at: Date.now() };
  return value;
}

/** Apply the store-wide discount to books already loaded from WooCommerce. */
export async function withBookDiscount(books: Book[]): Promise<Book[]> {
  const discount = await getDiscountForPricing();
  return books.map((book) => applyBookDiscount(book, discount));
}

/** Books with the store-wide discount applied — what customers see and pay. */
export async function getDiscountedBooks(): Promise<Book[]> {
  return withBookDiscount(await getBooks());
}

export async function getDiscountedBookById(id: string): Promise<Book | undefined> {
  const [book, discount] = await Promise.all([getBookById(id), getDiscountForPricing()]);
  return book ? applyBookDiscount(book, discount) : undefined;
}

export { BOOK_DISCOUNT_DEFAULTS };
