import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { isValidDocId } from '@/lib/db';
import {
  getPost,
  setPostStatus,
  trashPost,
  updatePost,
  type PostStatus,
  type StoredPost,
} from '@/lib/db-updates';
import { hasAdminAccess } from '@/lib/auth';
import { getClientIp, rateLimitResponse } from '@/lib/rate-limit';
import { denyIfCrossOrigin, readJsonBody } from '@/lib/request-security';

export const runtime = 'nodejs';

function toAdminPost(post: StoredPost) {
  return {
    id: post.id,
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    contentRaw: post.content,
    contentHtml: post.contentHtml,
    status: post.status,
    date: post.date,
    modified: post.modified,
    link: '',
    categories: post.categories,
    categoryNames: post.categories,
    imageUrl: post.imageUrl,
  };
}

async function resolveId(params: Promise<{ id: string }>): Promise<string | null> {
  const { id } = await params;
  return isValidDocId(id) ? id : null;
}

function cleanCategories(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined;
  return value
    .map((entry) => (typeof entry === 'string' ? entry.trim().slice(0, 60) : ''))
    .filter(Boolean)
    .slice(0, 3);
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!hasAdminAccess(request)) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }
  const id = await resolveId(params);
  if (!id) {
    return NextResponse.json({ success: false, message: 'Invalid post ID' }, { status: 400 });
  }

  try {
    const post = await getPost(id);
    if (!post) {
      return NextResponse.json({ success: false, message: 'Post not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, post: toAdminPost(post) });
  } catch (error) {
    console.error('[api/admin/updates/[id]] get error', error);
    return NextResponse.json({ success: false, message: 'Failed to load post' }, { status: 502 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const crossOrigin = denyIfCrossOrigin(request);
  if (crossOrigin) return crossOrigin;

  if (!hasAdminAccess(request)) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  const throttled = rateLimitResponse(request, {
    limit: 30,
    windowMs: 15 * 60 * 1000,
    key: `admin-updates-write:${getClientIp(request)}`,
  });
  if (throttled) return throttled;

  const id = await resolveId(params);
  if (!id) {
    return NextResponse.json({ success: false, message: 'Invalid post ID' }, { status: 400 });
  }

  try {
    const body = await readJsonBody<{
      title?: unknown;
      content?: unknown;
      excerpt?: unknown;
      categories?: unknown;
      status?: unknown;
      imageUrl?: unknown;
    }>(request);
    if (!body) {
      return NextResponse.json(
        { success: false, message: 'Invalid request body' },
        { status: 400 },
      );
    }

    const title = typeof body.title === 'string' ? body.title.trim().slice(0, 300) : '';
    if (!title) {
      return NextResponse.json(
        { success: false, message: 'Title is required' },
        { status: 400 },
      );
    }

    const status =
      typeof body.status === 'string' && (['publish', 'draft', 'pending'] as string[]).includes(body.status)
        ? (body.status as PostStatus)
        : undefined;

    const post = await updatePost(id, {
      title,
      content: typeof body.content === 'string' ? body.content.slice(0, 200_000) : '',
      excerpt: typeof body.excerpt === 'string' ? body.excerpt.slice(0, 2000) : undefined,
      categories: cleanCategories(body.categories),
      status,
      imageUrl: typeof body.imageUrl === 'string' ? body.imageUrl.trim() : undefined,
    });
    if (!post) {
      return NextResponse.json({ success: false, message: 'Post not found' }, { status: 404 });
    }

    revalidatePath('/api/posts');
    revalidatePath('/updates');
    return NextResponse.json({ success: true, post: toAdminPost(post) });
  } catch (error) {
    console.error('[api/admin/updates/[id]] update error', error);
    return NextResponse.json({ success: false, message: 'Failed to update post' }, { status: 502 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const crossOrigin = denyIfCrossOrigin(request);
  if (crossOrigin) return crossOrigin;

  if (!hasAdminAccess(request)) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  const throttled = rateLimitResponse(request, {
    limit: 30,
    windowMs: 15 * 60 * 1000,
    key: `admin-updates-write:${getClientIp(request)}`,
  });
  if (throttled) return throttled;

  const id = await resolveId(params);
  if (!id) {
    return NextResponse.json({ success: false, message: 'Invalid post ID' }, { status: 400 });
  }

  try {
    const post = await trashPost(id);
    if (!post) {
      return NextResponse.json({ success: false, message: 'Post not found' }, { status: 404 });
    }
    revalidatePath('/api/posts');
    revalidatePath('/updates');
    return NextResponse.json({ success: true, message: 'Post moved to trash' });
  } catch (error) {
    console.error('[api/admin/updates/[id]] trash error', error);
    return NextResponse.json({ success: false, message: 'Failed to trash post' }, { status: 502 });
  }
}

/** Publish / unpublish toggle via PATCH. */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const crossOrigin = denyIfCrossOrigin(request);
  if (crossOrigin) return crossOrigin;

  if (!hasAdminAccess(request)) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  const throttled = rateLimitResponse(request, {
    limit: 30,
    windowMs: 15 * 60 * 1000,
    key: `admin-updates-write:${getClientIp(request)}`,
  });
  if (throttled) return throttled;

  const id = await resolveId(params);
  if (!id) {
    return NextResponse.json({ success: false, message: 'Invalid post ID' }, { status: 400 });
  }

  try {
    const body = await readJsonBody<{ status?: unknown }>(request);
    const status = typeof body?.status === 'string' ? body.status : '';
    if (status !== 'publish' && status !== 'draft' && status !== 'pending') {
      return NextResponse.json(
        { success: false, message: 'Invalid status' },
        { status: 400 },
      );
    }
    const post = await setPostStatus(id, status as PostStatus);
    if (!post) {
      return NextResponse.json({ success: false, message: 'Post not found' }, { status: 404 });
    }
    revalidatePath('/api/posts');
    revalidatePath('/updates');
    return NextResponse.json({ success: true, post: toAdminPost(post) });
  } catch (error) {
    console.error('[api/admin/updates/[id]] status error', error);
    return NextResponse.json({ success: false, message: 'Failed to update status' }, { status: 502 });
  }
}
