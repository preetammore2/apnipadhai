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
  const snap = await getDb().collection(COLLECTIONS.results).orderBy('order', 'asc').get();
  return snap.docs.map((doc) => {
    const { order: _order, ...item } = doc.data() as StoredResult;
    return item;
  });
}

/** Replace the whole list (delete + re-insert) preserving order. */
export async function replaceResults(items: ResultInput[]): Promise<void> {
  const col = getDb().collection(COLLECTIONS.results);
  const existing = await col.get();
  await Promise.all(existing.docs.map((doc) => doc.ref.delete()));
  const docs: StoredResult[] = items.map((item, index) => ({ ...item, order: index + 1 }));
  await Promise.all(docs.map((doc) => col.add(doc)));
}