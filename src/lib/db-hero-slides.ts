import { COLLECTIONS, getDb } from '@/lib/db';
import type { HeroSlide } from '@/lib/hero-slides';

const SECTION = 'hero-slides';

interface HeroSlidesDoc {
  section: string;
  value: HeroSlide[];
  updatedAt: Date;
}

/**
 * MongoDB-backed hero slider slides. Kept separate from the shared
 * `siteContent` sections so the WordPress sync route and site-content reader
 * are not affected. When MongoDB is unconfigured/unreachable, callers fall
 * back to the built-in slides shipped in the bundle.
 */
export async function getHeroSlides(): Promise<HeroSlide[] | null> {
  const db = await getDb();
  const doc = await db
    .collection<HeroSlidesDoc>(COLLECTIONS.content)
    .findOne({ section: SECTION }, { projection: { _id: 0, section: 1, value: 1 } });
  const value = doc?.value;
  return Array.isArray(value) && value.length > 0 ? value : null;
}

export async function setHeroSlides(slides: HeroSlide[]): Promise<void> {
  const db = await getDb();
  await db
    .collection<HeroSlidesDoc>(COLLECTIONS.content)
    .updateOne(
      { section: SECTION },
      { $set: { section: SECTION, value: slides, updatedAt: new Date() } },
      { upsert: true },
    );
}