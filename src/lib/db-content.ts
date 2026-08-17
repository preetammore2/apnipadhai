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

interface ContentDoc {
  section: string;
  value: unknown;
  updatedAt: Date;
}

export const CONTENT_SECTIONS: ContentSection[] = ['hero', 'testimonials', 'faqs', 'courses'];

export async function getSectionValue<T>(section: ContentSection): Promise<T | null> {
  const db = await getDb();
  const doc = await db
    .collection<ContentDoc>(COLLECTIONS.content)
    .findOne({ section }, { projection: { _id: 0, section: 1, value: 1 } });
  return doc && doc.value != null ? (doc.value as T) : null;
}

export async function setSectionValue(section: ContentSection, value: unknown): Promise<void> {
  const db = await getDb();
  await db.collection<ContentDoc>(COLLECTIONS.content).updateOne(
    { section },
    { $set: { section, value, updatedAt: new Date() } },
    { upsert: true },
  );
}

export type ReadAllSections = {
  hero: HeroSectionValue | null;
  testimonials: TestimonialSectionValue[] | null;
  faqs: FaqSectionValue[] | null;
  courses: CourseSectionValue[] | null;
};

/** Read every section at once (used by the public site-content reader). */
export async function readAllSections(): Promise<ReadAllSections> {
  const db = await getDb();
  const docs = await db
    .collection<ContentDoc>(COLLECTIONS.content)
    .find({ section: { $in: CONTENT_SECTIONS } }, { projection: { _id: 0, section: 1, value: 1 } })
    .toArray();

  const bySection = new Map(docs.map((doc) => [doc.section, doc.value]));
  return {
    hero: (bySection.get('hero') as HeroSectionValue | undefined) ?? null,
    testimonials: (bySection.get('testimonials') as TestimonialSectionValue[] | undefined) ?? null,
    faqs: (bySection.get('faqs') as FaqSectionValue[] | undefined) ?? null,
    courses: (bySection.get('courses') as CourseSectionValue[] | undefined) ?? null,
  };
}
