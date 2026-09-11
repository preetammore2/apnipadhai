import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { isDbConfigured } from '@/lib/db';
import {
  deleteManagedPage,
  getManagedPage,
  upsertManagedPage,
} from '@/lib/db-pages';
import { EDITABLE_PAGES, EDITABLE_PAGE_SLUGS, findEditablePageBySlug } from '@/lib/page-editor';
import { hasAdminAccess } from '@/lib/auth';
import { getClientIp, rateLimitResponse } from '@/lib/rate-limit';
import { denyIfCrossOrigin, readJsonBody } from '@/lib/request-security';

export const runtime = 'nodejs';

async function readPageRows() {
  return Promise.all(
    EDITABLE_PAGES.map(async (page) => {
      const managed = await getManagedPage(page.slug);
      return {
        key: page.key,
        slug: page.slug,
        label: page.label,
        hint: page.hint,
        title: managed?.title ?? page.label,
        content: managed?.contentHtml ?? '',
        exists: Boolean(managed),
      };
    }),
  );
}

export async function GET(request: NextRequest) {
  if (!hasAdminAccess(request)) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const configured = isDbConfigured();
    if (!configured) {
      return NextResponse.json({
        success: true,
        configured: false,
        pages: EDITABLE_PAGES.map((page) => ({
          key: page.key,
          slug: page.slug,
          label: page.label,
          hint: page.hint,
          title: page.label,
          content: '',
          exists: false,
        })),
      });
    }
    const pages = await readPageRows();
    return NextResponse.json({ success: true, configured, pages });
  } catch (error) {
    console.error('[api/admin/pages] list error', error);
    return NextResponse.json(
      { success: false, message: 'Failed to load pages from Firebase' },
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
    key: `admin-pages-write:${getClientIp(request)}`,
  });
  if (throttled) return throttled;

  try {
    const body = await readJsonBody<{ slug?: unknown; title?: unknown; content?: unknown }>(request);
    const slug = typeof body?.slug === 'string' ? body.slug : '';
    const pageDef = findEditablePageBySlug(slug);
    if (!pageDef || !EDITABLE_PAGE_SLUGS.has(slug)) {
      return NextResponse.json(
        { success: false, message: 'Unknown page slug' },
        { status: 400 },
      );
    }

    const title = typeof body?.title === 'string' ? body.title.trim().slice(0, 300) : '';
    if (!title) {
      return NextResponse.json(
        { success: false, message: 'Title is required' },
        { status: 400 },
      );
    }
    const content = typeof body?.content === 'string' ? body.content.slice(0, 200_000) : '';

    await upsertManagedPage(pageDef.slug, title, content);

    revalidatePath(`/${pageDef.key}`);

    return NextResponse.json({
      success: true,
      page: {
        key: pageDef.key,
        slug: pageDef.slug,
        label: pageDef.label,
        hint: pageDef.hint,
        title,
        content,
        exists: true,
      },
    });
  } catch (error) {
    console.error('[api/admin/pages] save error', error);
    return NextResponse.json({ success: false, message: 'Failed to save page to Firebase' }, { status: 502 });
  }
}

/** Revert a page to its default layout by deleting the managed page. */
export async function DELETE(request: NextRequest) {
  const crossOrigin = denyIfCrossOrigin(request);
  if (crossOrigin) return crossOrigin;

  if (!hasAdminAccess(request)) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  const throttled = rateLimitResponse(request, {
    limit: 30,
    windowMs: 15 * 60 * 1000,
    key: `admin-pages-write:${getClientIp(request)}`,
  });
  if (throttled) return throttled;

  try {
    const body = await readJsonBody<{ slug?: unknown }>(request);
    const slug = typeof body?.slug === 'string' ? body.slug : '';
    const pageDef = findEditablePageBySlug(slug);
    if (!pageDef || !EDITABLE_PAGE_SLUGS.has(slug)) {
      return NextResponse.json(
        { success: false, message: 'Unknown page slug' },
        { status: 400 },
      );
    }

    const deleted = await deleteManagedPage(pageDef.slug);
    revalidatePath(`/${pageDef.key}`);

    return NextResponse.json({
      success: true,
      deleted,
      message: deleted
        ? 'Page reverted to its default layout.'
        : 'Page had no custom content to remove.',
    });
  } catch (error) {
    console.error('[api/admin/pages] delete error', error);
    return NextResponse.json({ success: false, message: 'Failed to revert page' }, { status: 502 });
  }
}
