import { getDb } from '@/lib/db';

const COVER_COLLECTION = 'bookCovers';

export interface BookCover {
  data: Buffer;
  contentType: string;
}

export interface BookCoverDoc {
  id: string;
  dataBase64: string;
  contentType: string;
  updatedAt: Date;
}

/**
 * Stores moderator-uploaded book cover images that are not hosted elsewhere.
 * The image is stored as base64 in Firestore and served back through
 * /api/book-covers/:id so WooCommerce can reference a real https URL.
 */
export async function setBookCover(id: string, data: Buffer, contentType: string): Promise<void> {
  await getDb().collection(COVER_COLLECTION).doc(id).set({
    id,
    dataBase64: data.toString('base64'),
    contentType,
    updatedAt: new Date(),
  });
}

export async function getBookCover(id: string): Promise<BookCover | null> {
  const doc = await getDb().collection(COVER_COLLECTION).doc(id).get();
  if (!doc.exists) return null;
  const data = doc.data() as BookCoverDoc | undefined;
  if (!data?.dataBase64) return null;
  return { data: Buffer.from(data.dataBase64, 'base64'), contentType: data.contentType };
}

export async function deleteBookCover(id: string): Promise<void> {
  await getDb().collection(COVER_COLLECTION).doc(id).delete();
}