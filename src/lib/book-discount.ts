import type { Book } from '@/types';

/**
 * Store-wide extra discount on every book's selling price, set in
 * /admin/book-discount. Applied on top of the WooCommerce prices — the
 * WooCommerce products themselves are never changed, so turning the discount
 * off (or letting it expire) restores the normal prices.
 */
export interface BookDiscount {
  enabled: boolean;
  /** percent = % off, flat = ₹ off each book. */
  type: 'percent' | 'flat';
  value: number;
  /** For percent: take the % of the MRP or of the current selling price. */
  base: 'mrp' | 'selling';
  /** YYYY-MM-DD, valid until the end of that day (IST); null = no expiry. */
  expiresAt: string | null;
}

export const BOOK_DISCOUNT_DEFAULTS: BookDiscount = {
  enabled: false,
  type: 'percent',
  value: 0,
  base: 'selling',
  expiresAt: null,
};

export function isBookDiscountActive(discount: BookDiscount | null, now = Date.now()): boolean {
  if (!discount || !discount.enabled || !(discount.value > 0)) return false;
  if (discount.expiresAt) {
    const end = new Date(`${discount.expiresAt}T23:59:59+05:30`).getTime();
    if (!Number.isFinite(end) || end < now) return false;
  }
  return true;
}

/** Selling price after the discount, in whole rupees, never below ₹0. */
export function discountedPrice(price: number, mrp: number, discount: BookDiscount): number {
  let off: number;
  if (discount.type === 'flat') {
    off = discount.value;
  } else {
    const base = discount.base === 'mrp' ? mrp || price : price;
    off = (base * discount.value) / 100;
  }
  return Math.max(0, Math.round(price - off));
}

function percentOff(price: number, mrp: number): number {
  return mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;
}

export function applyBookDiscount(book: Book, discount: BookDiscount | null): Book {
  if (!discount || !isBookDiscountActive(discount)) return book;
  const price = discountedPrice(book.price, book.originalPrice, discount);
  return {
    ...book,
    price,
    discountPercentage: percentOff(price, book.originalPrice),
    bundleItems: book.bundleItems?.map((item) => ({
      ...item,
      price: discountedPrice(item.price, item.originalPrice, discount),
    })),
  };
}
