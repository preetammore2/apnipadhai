import { COURSES_DATA } from '@/data/courses';
import { BOOKS_DATA } from '@/data/books';

export interface OrderLineInput {
  id: string;
  type: 'course' | 'book';
  quantity: number;
}

const CATALOG_PRICES = new Map<string, number>();
for (const course of COURSES_DATA) CATALOG_PRICES.set(`course:${course.id}`, course.price);
for (const book of BOOKS_DATA) {
  CATALOG_PRICES.set(`book:${book.id}`, book.price);
}

const BOOK_STOCK = new Map<string, boolean>();
for (const book of BOOKS_DATA) BOOK_STOCK.set(book.id, book.inStock);

export const COUPONS: Record<string, number> = {
  APNI10: 100,
};

export const MAX_LINE_QUANTITY = 50;

export function computeOrderTotal(
  items: OrderLineInput[],
  couponCode?: string | null,
): number | null {
  if (!Array.isArray(items) || items.length === 0) return null;

  let total = 0;
  for (const item of items) {
    const quantity = Math.floor(item.quantity);
    if (!Number.isFinite(quantity) || quantity < 1 || quantity > MAX_LINE_QUANTITY) return null;

    if (item.type === 'book') {
      if (BOOK_STOCK.get(item.id) === false) return null;
    }

    const unitPrice = CATALOG_PRICES.get(`${item.type}:${item.id}`);
    if (unitPrice === undefined) return null;

    total += unitPrice * quantity;
  }

  const discount =
    typeof couponCode === 'string' && couponCode.trim()
      ? COUPONS[couponCode.trim().toUpperCase()] ?? 0
      : 0;

  return Math.max(0, total - discount);
}
