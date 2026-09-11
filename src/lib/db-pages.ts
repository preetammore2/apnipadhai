import { COLLECTIONS, getDb } from '@/lib/db';
import { getWordPressPage } from '@/lib/wordpress';

export interface ManagedPage {
  slug: string;
  title: string;
  contentHtml: string;
}

/** Read a managed page from Firestore (doc ID = slug). */
export async function getManagedPage(slug: string): Promise<ManagedPage | null> {
  const doc = await getDb().collection(COLLECTIONS.pages).doc(slug).get();
  if (!doc.exists) return null;
  const data = doc.data();
  if (!data) return null;
  return {
    slug: data.slug,
    title: data.title,
    contentHtml: data.contentHtml,
  };
}

/**
 * Public reader: prefer Firestore, fall back to the WordPress `ap-*` page so
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
  await getDb().collection(COLLECTIONS.pages).doc(slug).set(
    { slug, title, contentHtml, updatedAt: new Date() },
    { merge: true },
  );
  return { slug, title, contentHtml };
}

export async function deleteManagedPage(slug: string): Promise<boolean> {
  const doc = await getDb().collection(COLLECTIONS.pages).doc(slug).get();
  if (!doc.exists) return false;
  await doc.ref.delete();
  return true;
}