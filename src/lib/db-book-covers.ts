import { getDb } from '@/lib/db';

const COVER_COLLECTION = 'bookCovers';

export interface BookCover {
  data: Buffer;
  contentType: string;
}

export interface BookCoverDoc {
  id: string;
  data: Buffer;
  contentType: string;
  updatedAt: Date;
}

/**
 * Stores moderator-uploaded book cover images that are not hosted elsewhere.
 * The image is stored raw in MongoDB and served back through
 * /api/book-covers/:id so WooCommerce can reference a real https URL.
 */
export async function setBookCover(id: string, data: Buffer, contentType: string): Promise<void> {
  const db = await getDb();
  await db.collection<BookCoverDoc>(COVER_COLLECTION).updateOne(
    { id },
    { $set: { id, data, contentType, updatedAt: new Date() } },
    { upsert: true },
  );
}

export async function getBookCover(id: string): Promise<BookCover | null> {
  const db = await getDb();
  const doc = await db
    .collection<BookCoverDoc>(COVER_COLLECTION)
    .findOne({ id }, { projection: { _id: 0, data: 1, contentType: 1 } });
  if (!doc || !doc.data) return null;
  return { data: Buffer.from(doc.data as unknown as Uint8Array), contentType: doc.contentType };
}

export async function deleteBookCover(id: string): Promise<void> {
  const db = await getDb();
  await db.collection<BookCoverDoc>(COVER_COLLECTION).deleteOne({ id });
}