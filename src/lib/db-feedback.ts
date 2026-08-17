import { COLLECTIONS, getDb } from '@/lib/db';

export interface FeedbackInput {
  name: string;
  exam: string;
  date: string;
  message: string;
  photo: string;
}

export interface StoredFeedback extends FeedbackInput {
  order: number;
}

export interface FeedbackItem extends FeedbackInput {
  id: string;
}

export async function listFeedback(): Promise<FeedbackItem[]> {
  const db = await getDb();
  const docs = await db
    .collection<StoredFeedback>(COLLECTIONS.feedback)
    .find({}, { projection: { _id: 0, order: 1, name: 1, exam: 1, date: 1, message: 1, photo: 1 } })
    .sort({ order: 1 })
    .toArray();
  return docs.map((doc, index) => ({ ...doc, id: `fb-${index + 1}` }));
}

/** Replace the whole list (delete + re-insert) in a single ordered write. */
export async function replaceFeedback(items: FeedbackInput[]): Promise<void> {
  const db = await getDb();
  const docs: StoredFeedback[] = items.map((item, index) => ({ ...item, order: index + 1 }));
  await db.collection<StoredFeedback>(COLLECTIONS.feedback).deleteMany({});
  if (docs.length > 0) {
    await db.collection<StoredFeedback>(COLLECTIONS.feedback).insertMany(docs);
  }
}
