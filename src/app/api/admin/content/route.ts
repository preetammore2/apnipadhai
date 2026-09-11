import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { isDbConfigured } from '@/lib/db';
import {
  CONTENT_SECTIONS,
  getSectionValue,
  setSectionValue,
  type ContentSection,
  type CourseSectionValue,
  type FaqSectionValue,
  type HeroSectionValue,
  type TestimonialSectionValue,
} from '@/lib/db-content';
import { hasAdminAccess } from '@/lib/auth';
import { getClientIp, rateLimitResponse } from '@/lib/rate-limit';
import { denyIfCrossOrigin, readJsonBody } from '@/lib/request-security';

export const runtime = 'nodejs';

function cleanHero(value: unknown): HeroSectionValue | null {
  const raw = (value ?? {}) as Record<string, unknown>;
  const title = typeof raw.title === 'string' ? raw.title.trim().slice(0, 500) : '';
  const highlight = typeof raw.highlight === 'string' ? raw.highlight.trim().slice(0, 200) : '';
  const subtitle = typeof raw.subtitle === 'string' ? raw.subtitle.trim().slice(0, 2000) : '';
  if (!title && !subtitle) return null;
  return { title, highlight, subtitle };
}

function cleanTestimonials(value: unknown): TestimonialSectionValue[] | null {
  if (!Array.isArray(value)) return null;
  const items: TestimonialSectionValue[] = value
    .map((raw) => {
      const item = (raw ?? {}) as Record<string, unknown>;
      return {
        name: typeof item.name === 'string' ? item.name.trim().slice(0, 200) : '',
        exam: typeof item.exam === 'string' ? item.exam.trim().slice(0, 200) : '',
        city: typeof item.city === 'string' ? item.city.trim().slice(0, 200) : '',
        quote: typeof item.quote === 'string' ? item.quote.trim().slice(0, 5000) : '',
        photo: typeof item.photo === 'string' ? item.photo.trim() : '',
      };
    })
    .filter((item) => item.quote);
  return items.length > 0 ? items : null;
}

function cleanFaqs(value: unknown): FaqSectionValue[] | null {
  if (!Array.isArray(value)) return null;
  const items: FaqSectionValue[] = value
    .map((raw) => {
      const item = (raw ?? {}) as Record<string, unknown>;
      return {
        question: typeof item.question === 'string' ? item.question.trim().slice(0, 500) : '',
        answer: typeof item.answer === 'string' ? item.answer.trim().slice(0, 5000) : '',
      };
    })
    .filter((item) => item.question);
  return items.length > 0 ? items : null;
}

function cleanCourses(value: unknown): CourseSectionValue[] | null {
  if (!Array.isArray(value)) return null;
  const items: CourseSectionValue[] = value
    .map((raw) => {
      const item = (raw ?? {}) as Record<string, unknown>;
      const features = Array.isArray(item.features)
        ? item.features
            .map((f) => (typeof f === 'string' ? f.trim() : ''))
            .filter(Boolean)
            .slice(0, 20)
        : undefined;
      return {
        title: typeof item.title === 'string' ? item.title.trim().slice(0, 300) : '',
        description: typeof item.description === 'string' ? item.description.trim().slice(0, 2000) : '',
        url: typeof item.url === 'string' ? item.url.trim() : '',
        image: typeof item.image === 'string' ? item.image.trim() : undefined,
        tag: typeof item.tag === 'string' ? item.tag.trim().slice(0, 100) : undefined,
        tagline: typeof item.tagline === 'string' ? item.tagline.trim().slice(0, 300) : undefined,
        type: typeof item.type === 'string' ? item.type.trim().slice(0, 100) : undefined,
        features: features && features.length > 0 ? features : undefined,
      };
    })
    .filter((item) => item.title);
  return items.length > 0 ? items : null;
}

function cleanValue(section: ContentSection, value: unknown): unknown | null {
  switch (section) {
    case 'hero':
      return cleanHero(value);
    case 'testimonials':
      return cleanTestimonials(value);
    case 'faqs':
      return cleanFaqs(value);
    case 'courses':
      return cleanCourses(value);
  }
}

async function readSection(section: ContentSection) {
  const value = await getSectionValue(section);
  return { exists: value != null, value: value ?? null };
}

export async function GET(request: NextRequest) {
  if (!hasAdminAccess(request)) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const configured = isDbConfigured();
    if (!configured) {
      return NextResponse.json({ success: true, configured: false, sections: {} });
    }
    const entries = await Promise.all(CONTENT_SECTIONS.map((section) => readSection(section)));
    const sections = Object.fromEntries(CONTENT_SECTIONS.map((section, index) => [section, entries[index]]));
    return NextResponse.json({ success: true, configured, sections });
  } catch (error) {
    console.error('[api/admin/content] list error', error);
    return NextResponse.json(
      { success: false, message: 'Failed to load site content from Firebase' },
      { status: 502 },
    );
  }
}

export async function PUT(request: NextRequest) {
  const crossOrigin = denyIfCrossOrigin(request);
  if (crossOrigin) return crossOrigin;

  if (!hasAdminAccess(request)) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  const throttled = rateLimitResponse(request, {
    limit: 30,
    windowMs: 15 * 60 * 1000,
    key: `admin-content-write:${getClientIp(request)}`,
  });
  if (throttled) return throttled;

  try {
    const body = await readJsonBody<{ section?: unknown; value?: unknown }>(request);
    if (!body || typeof body.section !== 'string' || !CONTENT_SECTIONS.includes(body.section as ContentSection)) {
      return NextResponse.json(
        { success: false, message: 'Invalid content section' },
        { status: 400 },
      );
    }
    const section = body.section as ContentSection;
    const value = cleanValue(section, body.value);

    if (value === null) {
      return NextResponse.json(
        { success: false, message: 'Section content is empty' },
        { status: 400 },
      );
    }

    await setSectionValue(section, value);

    revalidatePath('/api/site-content');
    revalidatePath('/');

    const saved = await readSection(section);
    return NextResponse.json({ success: true, section: saved });
  } catch (error) {
    console.error('[api/admin/content] save error', error);
    return NextResponse.json({ success: false, message: 'Failed to save content to Firebase' }, { status: 502 });
  }
}
