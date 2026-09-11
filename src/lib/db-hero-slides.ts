import { COLLECTIONS, getDb } from '@/lib/db';
import type { HeroSlide } from '@/lib/hero-slides';

const SECTION = 'hero-slides';

/**
 * Firestore-backed hero slider slides. Kept separate from the shared
 * `siteContent` sections so the WordPress sync route and site-content reader
 * are not affected. When Firebase is unconfigured/unreachable, callers fall
 * back to the built-in slides shipped in the bundle.
 */
export async function getHeroSlides(): Promise<HeroSlide[] | null> {
  const doc = await getDb().collection(COLLECTIONS.content).doc(SECTION).get();
  const value = doc.data()?.value;
  return Array.isArray(value) && value.length > 0 ? value : null;
}

export async function setHeroSlides(slides: HeroSlide[]): Promise<void> {
  await getDb()
    .collection(COLLECTIONS.content)
    .doc(SECTION)
    .set({ section: SECTION, value: slides, updatedAt: new Date() }, { merge: true });
}