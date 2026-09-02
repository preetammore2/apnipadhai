import { Book } from '@/types';

export function isComboBook(book: Book): boolean {
  return (
    (book.category ?? '').toLowerCase() === 'combo' ||
    (book.categories ?? []).some((c) => c.toLowerCase() === 'combo')
  );
}