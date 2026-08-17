import { NextResponse } from 'next/server';
import { getSiteContent } from '@/lib/site-content';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const content = await getSiteContent();
    return NextResponse.json(content, {
      headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120' },
    });
  } catch (error) {
    console.error('[api/site-content] error', error);
    return NextResponse.json({ hero: null, testimonials: null, faqs: null, courses: null });
  }
}
