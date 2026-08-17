import type { Book } from '@/types';
import { COLLECTIONS, getDb } from '@/lib/db';

interface MirroredBookDoc extends Book {
  updatedAt: Date;
}

/**
 * MongoDB mirror of the WooCommerce book catalog. WooCommerce stays the
 * authoritative source (orders/payments depend on it); this collection keeps a
 * snapshot for the admin portal. Mirror writes are fire-and-forget so a Mongo
 * outage never blocks the store.
 */

export async function replaceMirroredBooks(books: Book[]): Promise<void> {
  const db = await getDb();
  const coll = db.collection<MirroredBookDoc>(COLLECTIONS.books);
  const now = new Date();
  await coll.deleteMany({});
  if (books.length > 0) {
    await coll.insertMany(books.map((book) => ({ ...book, updatedAt: now })));
  }
}

export async function upsertMirroredBook(book: Book): Promise<void> {
  const db = await getDb();
  await db
    .collection<MirroredBookDoc>(COLLECTIONS.books)
    .updateOne({ id: book.id }, { $set: { ...book, updatedAt: new Date() } }, { upsert: true });
}

export async function deleteMirroredBook(id: string): Promise<void> {
  const db = await getDb();
  await db.collection<MirroredBookDoc>(COLLECTIONS.books).deleteOne({ id });
}

/** Never throws — mirrors are best-effort and must not break the WooCommerce flow. */
export async function mirrorBooksSafe(fn: () => Promise<void>): Promise<void> {
  try {
    await fn();
  } catch (error) {
    console.error('[db-books] MongoDB mirror error', error);
  }
}
