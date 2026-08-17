import { COLLECTIONS, getDb } from '@/lib/db';
import { getWordPressPage } from '@/lib/wordpress';

export interface ManagedPage {
  slug: string;
  title: string;
  contentHtml: string;
}

/** Read a managed page from MongoDB. */
export async function getManagedPage(slug: string): Promise<ManagedPage | null> {
  const db = await getDb();
  const doc = await db
    .collection<ManagedPage & { updatedAt?: Date }>(COLLECTIONS.pages)
    .findOne({ slug }, { projection: { _id: 0, slug: 1, title: 1, contentHtml: 1 } });
  return doc ?? null;
}

/**
 * Public reader: prefer MongoDB, fall back to the WordPress `ap-*` page so
 * existing WordPress-managed content keeps rendering until it is migrated.
 */
export async function getManagedPageOrWp(slug: string): Promise<ManagedPage | null> {
  try {
    const page = await getManagedPage(slug);
    if (page) return page;
  } catch (error) {
    console.error(`[db-pages] read error for "${slug}"`, error);
  }
  const wp = await getWordPressPage(slug);
  return wp ? { slug, ...wp } : null;
}

export async function upsertManagedPage(slug: string, title: string, contentHtml: string): Promise<ManagedPage> {
  const db = await getDb();
  await db.collection(COLLECTIONS.pages).updateOne(
    { slug },
    { $set: { slug, title, contentHtml, updatedAt: new Date() } },
    { upsert: true },
  );
  return { slug, title, contentHtml };
}

export async function deleteManagedPage(slug: string): Promise<boolean> {
  const db = await getDb();
  const result = await db.collection(COLLECTIONS.pages).deleteOne({ slug });
  return result.deletedCount > 0;
}
