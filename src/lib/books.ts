import { Book } from '@/types';

export function isComboBook(book: Book): boolean {
  return (
    (book.category ?? '').toLowerCase() === 'combo' ||
    (book.categories ?? []).some((c) => c.toLowerCase() === 'combo')
  );
}

const comboRank = (book: Book): number => {
  if (isComboBook(book)) return 0;
  if (/^rajasthan gk combo/i.test(book.title)) return 1;
  return 2;
};

/** Stable-sort combo products to the front (Combo first, then Rajasthan GK Combo). */
export function sortComboFirst(books: Book[]): Book[] {
  return [...books].sort((a, b) => comboRank(a) - comboRank(b));
}