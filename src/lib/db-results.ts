import { COLLECTIONS, getDb } from '@/lib/db';

export type ResultCategory = 'Rajasthan Police' | 'REET L1/L2';

export const RESULT_CATEGORIES: ResultCategory[] = ['Rajasthan Police', 'REET L1/L2'];

export interface ResultInput {
  name: string;
  district: string;
  photo: string;
  category: ResultCategory;
}

export interface StoredResult extends ResultInput {
  order: number;
}

export async function listResults(): Promise<ResultInput[]> {
  const db = await getDb();
  const docs = await db
    .collection<StoredResult>(COLLECTIONS.results)
    .find({}, { projection: { _id: 0, order: 1, name: 1, district: 1, photo: 1, category: 1 } })
    .sort({ order: 1 })
    .toArray();
  return docs.map(({ order: _order, ...item }) => item);
}

/** Replace the whole list (delete + re-insert) in a single ordered write. */
export async function replaceResults(items: ResultInput[]): Promise<void> {
  const db = await getDb();
  const docs: StoredResult[] = items.map((item, index) => ({ ...item, order: index + 1 }));
  await db.collection<StoredResult>(COLLECTIONS.results).deleteMany({});
  if (docs.length > 0) {
    await db.collection<StoredResult>(COLLECTIONS.results).insertMany(docs);
  }
}
