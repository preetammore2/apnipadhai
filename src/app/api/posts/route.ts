import { NextResponse } from 'next/server';
import { listPublishedPosts, postExcerpt, postImageUrl, type StoredPost } from '@/lib/db-updates';
import { getPosts, type WordPressPost } from '@/lib/wordpress';

export const runtime = 'nodejs';

function toWordPressPost(post: StoredPost): WordPressPost {
  return {
    id: post.id,
    slug: post.slug,
    title: post.title,
    excerpt: postExcerpt(post),
    content: postExcerpt(post),
    contentHtml: post.contentHtml,
    date: post.date,
    modified: post.modified,
    link: '',
    author: post.author,
    categories: post.categories,
    categoryNames: post.categories,
    imageUrl: postImageUrl(post),
    tags: [],
  };
}

export async function GET() {
  let managed: StoredPost[] = [];
  try {
    managed = await listPublishedPosts();
  } catch (error) {
    console.error('[api/posts] MongoDB unavailable, using WordPress', error);
  }

  try {
    const posts = await getPosts();
    const seen = new Set(managed.map((post) => post.slug));
    const extra = posts.filter((post) => !seen.has(post.slug));
    return NextResponse.json([...managed.map(toWordPressPost), ...extra]);
  } catch (error) {
    console.error('[api/posts] error', error);
    if (managed.length > 0) {
      return NextResponse.json(managed.map(toWordPressPost));
    }
    return NextResponse.json(
      { success: false, message: 'Failed to load updates' },
      { status: 502 },
    );
  }
}
