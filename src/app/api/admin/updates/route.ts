import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { isDbConfigured } from '@/lib/db';
import {
  createPost,
  listCategoryNames,
  listPosts,
  POST_STATUSES,
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

function cleanCategories(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((entry) => (typeof entry === 'string' ? entry.trim().slice(0, 60) : ''))
    .filter(Boolean)
    .slice(0, 3);
}

export async function GET(request: NextRequest) {
  if (!hasAdminAccess(request)) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const configured = isDbConfigured();
    if (!configured) {
      return NextResponse.json({ success: true, configured: false, posts: [], categories: [] });
    }
    const [posts, categories] = await Promise.all([listPosts(), listCategoryNames()]);
    return NextResponse.json({
      success: true,
      configured,
      posts: posts.map(toAdminPost),
      categories,
    });
  } catch (error) {
    console.error('[api/admin/updates] list error', error);
    return NextResponse.json(
      { success: false, message: 'Failed to load posts from Firebase' },
      { status: 502 },
    );
  }
}

export async function POST(request: NextRequest) {
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
      typeof body.status === 'string' && (POST_STATUSES as readonly string[]).includes(body.status)
        ? (body.status as StoredPost['status'])
        : 'draft';

    const post = await createPost({
      title,
      content: typeof body.content === 'string' ? body.content.slice(0, 200_000) : '',
      excerpt: typeof body.excerpt === 'string' ? body.excerpt.slice(0, 2000) : undefined,
      categories: cleanCategories(body.categories),
      status,
      imageUrl: typeof body.imageUrl === 'string' ? body.imageUrl.trim() : undefined,
    });

    revalidatePath('/api/posts');
    revalidatePath('/updates');
    return NextResponse.json({ success: true, post: toAdminPost(post) }, { status: 201 });
  } catch (error) {
    console.error('[api/admin/updates] create error', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create post in Firebase' },
      { status: 502 },
    );
  }
}
