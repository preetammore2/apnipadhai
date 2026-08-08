import { NextResponse } from 'next/server';
import { getPosts } from '@/lib/wordpress';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const posts = await getPosts();
    return NextResponse.json(posts);
  } catch (error) {
    console.error('[api/posts] error', error);
    return NextResponse.json(
      { success: false, message: 'Failed to load updates' },
      { status: 502 },
    );
  }
}
