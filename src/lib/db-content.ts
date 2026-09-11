import { COLLECTIONS, getDb } from '@/lib/db';

export type ContentSection = 'hero' | 'testimonials' | 'faqs' | 'courses';

export interface HeroSectionValue {
  title: string;
  highlight: string;
  subtitle: string;
}

export interface TestimonialSectionValue {
  name: string;
  exam: string;
  city: string;
  quote: string;
  photo: string;
}

export interface FaqSectionValue {
  question: string;
  answer: string;
}

export interface CourseSectionValue {
  title: string;
  description: string;
  url: string;
  image?: string;
  tag?: string;
  tagline?: string;
  type?: string;
  features?: string[];
}

export type SectionValueMap = {
  hero: HeroSectionValue;
  testimonials: TestimonialSectionValue[];
  faqs: FaqSectionValue[];
  courses: CourseSectionValue[];
};

export const CONTENT_SECTIONS: ContentSection[] = ['hero', 'testimonials', 'faqs', 'courses'];

/**
 * Site content lives in the `siteContent` collection with one document per
 * section (doc ID = section name). Each doc stores `{ section, value, updatedAt }`.
 */
export async function getSectionValue<T>(section: ContentSection): Promise<T | null> {
  const doc = await getDb().collection(COLLECTIONS.content).doc(section).get();
  if (!doc.exists) return null;
  const value = doc.data()?.value;
  return value != null ? (value as T) : null;
}

export async function setSectionValue(section: ContentSection, value: unknown): Promise<void> {
  await getDb()
    .collection(COLLECTIONS.content)
    .doc(section)
    .set({ section, value, updatedAt: new Date() }, { merge: true });
}

export type ReadAllSections = {
  hero: HeroSectionValue | null;
  testimonials: TestimonialSectionValue[] | null;
  faqs: FaqSectionValue[] | null;
  courses: CourseSectionValue[] | null;
};

/** Read every section at once (used by the public site-content reader). */
export async function readAllSections(): Promise<ReadAllSections> {
  const refs = CONTENT_SECTIONS.map((section) =>
    getDb().collection(COLLECTIONS.content).doc(section),
  );
  const docs = await getDb().getAll(...refs);
  const bySection = new Map<string, unknown>();
  for (const doc of docs) {
    if (doc.exists) bySection.set(doc.id, doc.data()?.value);
  }

  return {
    hero: (bySection.get('hero') as HeroSectionValue | undefined) ?? null,
    testimonials: (bySection.get('testimonials') as TestimonialSectionValue[] | undefined) ?? null,
    faqs: (bySection.get('faqs') as FaqSectionValue[] | undefined) ?? null,
    courses: (bySection.get('courses') as CourseSectionValue[] | undefined) ?? null,
  };
}