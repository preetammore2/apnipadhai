import { ObjectId } from 'mongodb';
import { COLLECTIONS, getDb } from '@/lib/db';
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

type PyqWithId = PyqDoc & { _id: ObjectId };

function toStoredPyq(doc: PyqWithId): StoredPyq {
  const { _id, ...rest } = doc;
  return { ...rest, id: _id.toString() };
}

export async function listPyqs(): Promise<StoredPyq[]> {
  const db = await getDb();
  const docs = await db
    .collection<PyqDoc>(COLLECTIONS.pyqs)
    .find({})
    .sort({ order: 1 })
    .toArray();
  return docs.map((doc) => toStoredPyq(doc as PyqWithId));
}

export async function getPyq(id: string): Promise<StoredPyq | null> {
  const db = await getDb();
  const doc = await db
    .collection<PyqDoc>(COLLECTIONS.pyqs)
    .findOne({ _id: new ObjectId(id) });
  return doc ? toStoredPyq(doc as PyqWithId) : null;
}

export async function replacePyqs(items: PyqInput[]): Promise<StoredPyq[]> {
  const db = await getDb();
  const coll = db.collection<PyqDoc>(COLLECTIONS.pyqs);
  const now = new Date();
  await coll.deleteMany({});
  if (items.length > 0) {
    await coll.insertMany(
      items.map((item, index) => ({
        ...item,
        order: index + 1,
        createdAt: now,
        updatedAt: now,
      })),
    );
  }
  return listPyqs();
}

/** Add WordPress-sourced papers that are not already present (by download URL). */
export async function importPyqs(items: PyqInput[]): Promise<{ added: number; skipped: number }> {
  const db = await getDb();
  const coll = db.collection<PyqDoc>(COLLECTIONS.pyqs);
  const existing = await coll.find({}, { projection: { downloadUrl: 1 } }).toArray();
  const seen = new Set(existing.map((doc) => doc.downloadUrl));
  const toAdd = items.filter((item) => !seen.has(item.downloadUrl));
  if (toAdd.length === 0) return { added: 0, skipped: existing.length };

  const last = await coll.find({}).sort({ order: -1 }).limit(1).toArray();
  let order = last[0]?.order ?? 0;
  const now = new Date();
  await coll.insertMany(
    toAdd.map((item) => ({
      ...item,
      order: ++order,
      createdAt: now,
      updatedAt: now,
    })),
  );
  return { added: toAdd.length, skipped: seen.size };
}
