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
import { getPostBySlug, upsertImportedPost } from '@/lib/db-updates';
import {
  computeWpSection,
  isPlaceholderText,
  type SiteCourse,
  type SiteFaq,
  type SiteHero,
  type SiteTestimonial,
} from '@/lib/site-content';
import { getPosts, getPyqs } from '@/lib/wordpress';
import { importPyqs } from '@/lib/db-pyqs';
import { hasAdminAccess } from '@/lib/auth';
import { getClientIp, rateLimitResponse } from '@/lib/rate-limit';
import { denyIfCrossOrigin } from '@/lib/request-security';

export const runtime = 'nodejs';

function normalizeKey(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, ' ');
}

interface SectionReport {
  wp: number;
  added: number;
  skipped: number;
}

type ReportSections = ContentSection | 'updates' | 'pyqs';

/**
 * Import content from WordPress into Firebase so both stores stay in sync.
 *
 * This is additive only: WordPress items that are already present in Firebase
 * (matched by name / question / title) are skipped, so admin edits are never
 * overwritten. The public readers merge both stores, so anything WordPress-only
 * is still visible even before this import runs.
 */
export async function POST(request: NextRequest) {
  const crossOrigin = denyIfCrossOrigin(request);
  if (crossOrigin) return crossOrigin;

  if (!hasAdminAccess(request)) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  const throttled = rateLimitResponse(request, {
    limit: 20,
    windowMs: 15 * 60 * 1000,
    key: `admin-sync-wp:${getClientIp(request)}`,
  });
  if (throttled) return throttled;

  if (!isDbConfigured()) {
    return NextResponse.json(
      { success: false, message: 'Firebase is not configured on this server' },
      { status: 502 },
    );
  }

  const report: Partial<Record<ReportSections, SectionReport>> = {};

  try {
    for (const section of CONTENT_SECTIONS) {
      const wpValue = await computeWpSection(section);
      let wpCount = 0;
      let added = 0;
      let skipped = 0;

      if (wpValue) {
        switch (section) {
          case 'hero': {
            const wpHero = wpValue as SiteHero;
            wpCount = 1;
            const existing = await getSectionValue<HeroSectionValue>('hero');
            if (existing) {
              skipped = 1;
            } else {
              await setSectionValue('hero', {
                title: wpHero.title ?? '',
                highlight: wpHero.highlight ?? '',
                subtitle: wpHero.subtitle ?? '',
              });
              added = 1;
            }
            break;
          }
          case 'testimonials': {
            const wpItems = wpValue as SiteTestimonial[];
            wpCount = wpItems.length;
            const existing = (await getSectionValue<TestimonialSectionValue[]>('testimonials')) ?? [];
            const seen = new Set(existing.map((item) => normalizeKey(item.name)));
            const toAdd = wpItems
              .filter(
                (item) =>
                  !seen.has(normalizeKey(item.name)) &&
                  !isPlaceholderText(item.name) &&
                  !isPlaceholderText(item.quote),
              )
              .map((item) => ({
                name: item.name,
                exam: item.exam ?? '',
                city: item.city ?? '',
                quote: item.quote,
                photo: item.photo ?? '',
              }));
            added = toAdd.length;
            if (toAdd.length > 0) {
              await setSectionValue('testimonials', [...existing, ...toAdd]);
            }
            break;
          }
          case 'faqs': {
            const wpItems = wpValue as SiteFaq[];
            wpCount = wpItems.length;
            const existing = (await getSectionValue<FaqSectionValue[]>('faqs')) ?? [];
            const seen = new Set(existing.map((item) => normalizeKey(item.question)));
            const toAdd = wpItems
              .filter(
                (item) =>
                  !seen.has(normalizeKey(item.question)) &&
                  !isPlaceholderText(item.question) &&
                  !isPlaceholderText(item.answer),
              )
              .map((item) => ({ question: item.question, answer: item.answer }));
            added = toAdd.length;
            if (toAdd.length > 0) {
              await setSectionValue('faqs', [...existing, ...toAdd]);
            }
            break;
          }
          case 'courses': {
            const wpItems = wpValue as SiteCourse[];
            wpCount = wpItems.length;
            const existing = (await getSectionValue<CourseSectionValue[]>('courses')) ?? [];
            const seen = new Set(existing.map((item) => normalizeKey(item.title)));
            const toAdd = wpItems
              .filter((item) => !seen.has(normalizeKey(item.title)))
              .map((item) => ({
                title: item.title,
                description: item.description ?? '',
                url: item.url ?? '',
                image: item.image || undefined,
                tag: item.tag || undefined,
                tagline: item.tagline || undefined,
                type: item.type || undefined,
                features:
                  Array.isArray(item.features) && item.features.length > 0
                    ? item.features.filter((f) => String(f).trim())
                    : undefined,
              }));
            added = toAdd.length;
            if (toAdd.length > 0) {
              await setSectionValue('courses', [...existing, ...toAdd]);
            }
            break;
          }
        }
      }

      report[section] = { wp: wpCount, added, skipped };
    }

    // Import blog posts from WordPress (dedup by slug, skip placeholders).
    let wpPosts = 0;
    let addedPosts = 0;
    let skippedPosts = 0;
    try {
      const posts = await getPosts(100);
      wpPosts = posts.length;
      for (const post of posts) {
        if (isPlaceholderText(post.title)) {
          skippedPosts++;
          continue;
        }
        const exists = await getPostBySlug(post.slug);
        await upsertImportedPost({
          slug: post.slug,
          title: post.title,
          excerpt: post.excerpt,
          content: post.content,
          contentHtml: post.contentHtml,
          imageUrl: post.imageUrl,
          author: post.author,
          date: post.date,
          modified: post.modified,
          categories: post.categoryNames,
        });
        if (exists) skippedPosts++;
        else addedPosts++;
      }
    } catch (error) {
      console.error('[api/admin/sync/wp-content] posts sync error', error);
    }
    report.updates = { wp: wpPosts, added: addedPosts, skipped: skippedPosts };

    // Import PYQ papers from WordPress (dedup by download URL, skip placeholders).
    let wpPyqs = 0;
    let addedPyqs = 0;
    let skippedPyqs = 0;
    try {
      const pyqs = await getPyqs();
      wpPyqs = pyqs.length;
      const toAdd = pyqs.filter(
        (pyq) => !isPlaceholderText(pyq.title) && pyq.downloadUrl,
      );
      const result = await importPyqs(
        toAdd.map((pyq) => ({
          title: pyq.title,
          examName: pyq.examName,
          category: pyq.category,
          year: pyq.year,
          state: pyq.state,
          questionsCount: pyq.questionsCount,
          pdfSize: pyq.pdfSize,
          downloadUrl: pyq.downloadUrl,
          hasSolution: pyq.hasSolution,
          subject: pyq.subject,
        })),
      );
      addedPyqs = result.added;
      skippedPyqs = result.skipped;
    } catch (error) {
      console.error('[api/admin/sync/wp-content] PYQ sync error', error);
    }
    report.pyqs = { wp: wpPyqs, added: addedPyqs, skipped: skippedPyqs };

    revalidatePath('/api/site-content');
    revalidatePath('/');
    revalidatePath('/faq');
    revalidatePath('/api/posts');
    revalidatePath('/updates');
    revalidatePath('/api/pyqs');
    revalidatePath('/pyqs');

    return NextResponse.json({ success: true, report });
  } catch (error) {
    console.error('[api/admin/sync/wp-content] sync error', error);
    return NextResponse.json(
      { success: false, message: 'Failed to sync content from WordPress' },
      { status: 502 },
    );
  }
}
