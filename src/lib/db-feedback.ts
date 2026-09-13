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
  source?: 'admin' | 'website';
  createdAt?: Date;
}

export interface FeedbackItem extends FeedbackInput {
  id: string;
}

export async function listFeedback(): Promise<FeedbackItem[]> {
  const snap = await getDb().collection(COLLECTIONS.feedback).orderBy('order', 'asc').get();
  return snap.docs.map((doc, index) => ({
    ...(doc.data() as StoredFeedback),
    id: `fb-${index + 1}`,
  }));
}

/** Replace the whole list (delete + re-insert) preserving order. */
export async function replaceFeedback(items: FeedbackInput[]): Promise<void> {
  const col = getDb().collection(COLLECTIONS.feedback);
  const existing = await col.get();
  await Promise.all(existing.docs.map((doc) => doc.ref.delete()));
  const docs: StoredFeedback[] = items.map((item, index) => ({
    ...item,
    date: item.date || currentMonthYear(),
    order: index + 1,
  }));
  await Promise.all(docs.map((doc) => col.add(doc)));
}

/** Add a single feedback entry submitted from the public website. */
export async function addFeedback(item: FeedbackInput): Promise<void> {
  const col = getDb().collection(COLLECTIONS.feedback);
  const snap = await col.count().get();
  const doc: StoredFeedback = {
    ...item,
    date: item.date || currentMonthYear(),
    order: (snap.data().count as number) + 1,
    source: 'website',
    createdAt: new Date(),
  };
  await col.add(doc);
}

/** Current month + year, e.g. "Sep 2026", matching the curated feedback format. */
function currentMonthYear(): string {
  return new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}