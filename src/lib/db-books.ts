import type { Book } from '@/types';
import { COLLECTIONS, getDb } from '@/lib/db';

interface MirroredBookDoc extends Book {
  updatedAt: Date;
}

/**
 * Firestore mirror of the WooCommerce book catalog. WooCommerce stays the
 * authoritative source (orders/payments depend on it); this collection keeps a
 * snapshot for the admin portal. Mirror writes are fire-and-forget so a
 * Firestore outage never blocks the store.
 */

export async function replaceMirroredBooks(books: Book[]): Promise<void> {
  const col = getDb().collection(COLLECTIONS.books);
  const existing = await col.get();
  await Promise.all(existing.docs.map((doc) => doc.ref.delete()));
  const now = new Date();
  await Promise.all(
    books.map((book) => col.doc(String(book.id)).set({ ...book, updatedAt: now })),
  );
}

export async function upsertMirroredBook(book: Book): Promise<void> {
  await getDb()
    .collection(COLLECTIONS.books)
    .doc(String(book.id))
    .set({ ...book, updatedAt: new Date() });
}

export async function deleteMirroredBook(id: string): Promise<void> {
  await getDb().collection(COLLECTIONS.books).doc(String(id)).delete();
}

/** Never throws — mirrors are best-effort and must not break the WooCommerce flow. */
export async function mirrorBooksSafe(fn: () => Promise<void>): Promise<void> {
  try {
    await fn();
  } catch (error) {
    console.error('[db-books] Firestore mirror error', error);
  }
}