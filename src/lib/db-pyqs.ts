import { COLLECTIONS, getDb, toJsDate } from '@/lib/db';
import type { PYQ } from '@/types';

export const PYQ_CATEGORIES = [
  'RAS',
  'Sub Inspector',
  'CET',
  'LDC',
  'SSC GD',
  'Rajasthan GK',
  'Teacher Exams',
] as const;

export const PYQ_STATES = ['Rajasthan', 'All India'] as const;

export interface PyqDoc extends Omit<PYQ, 'id'> {
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface StoredPyq extends PyqDoc {
  id: string;
}

export interface PyqInput {
  title: string;
  examName: string;
  category: (typeof PYQ_CATEGORIES)[number];
  year: number;
  state: (typeof PYQ_STATES)[number];
  questionsCount?: number;
  pdfSize?: string;
  downloadUrl: string;
  hasSolution: boolean;
  subject: string;
}

function toStoredPyq(id: string, doc: PyqDoc): StoredPyq {
  return {
    ...doc,
    id,
    createdAt: toJsDate(doc.createdAt),
    updatedAt: toJsDate(doc.updatedAt),
  };
}

export async function listPyqs(): Promise<StoredPyq[]> {
  const snap = await getDb().collection(COLLECTIONS.pyqs).orderBy('order', 'asc').get();
  return snap.docs.map((doc) => toStoredPyq(doc.id, doc.data() as PyqDoc));
}

export async function getPyq(id: string): Promise<StoredPyq | null> {
  const doc = await getDb().collection(COLLECTIONS.pyqs).doc(id).get();
  return doc.exists ? toStoredPyq(doc.id, doc.data() as PyqDoc) : null;
}

export async function replacePyqs(items: PyqInput[]): Promise<StoredPyq[]> {
  const col = getDb().collection(COLLECTIONS.pyqs);
  const existing = await col.get();
  await Promise.all(existing.docs.map((doc) => doc.ref.delete()));

  const now = new Date();
  await Promise.all(
    items.map((item, index) =>
      col.add({
        ...item,
        order: index + 1,
        createdAt: now,
        updatedAt: now,
      }),
    ),
  );
  return listPyqs();
}

/** Add WordPress-sourced papers that are not already present (by download URL). */
export async function importPyqs(items: PyqInput[]): Promise<{ added: number; skipped: number }> {
  const col = getDb().collection(COLLECTIONS.pyqs);
  const snap = await col.get();
  const existing = snap.docs.map((doc) => doc.data() as PyqDoc);
  const seen = new Set(existing.map((doc) => doc.downloadUrl));
  const toAdd = items.filter((item) => !seen.has(item.downloadUrl));
  if (toAdd.length === 0) return { added: 0, skipped: existing.length };

  const lastOrder = existing.reduce((max, doc) => Math.max(max, doc.order ?? 0), 0);
  const now = new Date();
  await Promise.all(
    toAdd.map((item, index) =>
      col.add({
        ...item,
        order: lastOrder + index + 1,
        createdAt: now,
        updatedAt: now,
      }),
    ),
  );
  return { added: toAdd.length, skipped: seen.size };
}