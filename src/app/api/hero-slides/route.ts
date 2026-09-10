import { NextResponse } from 'next/server';
import { isDbConfigured } from '@/lib/db';
import { getHeroSlides } from '@/lib/db-hero-slides';
import { DEFAULT_HERO_SLIDES, normalizeHeroSlides } from '@/lib/hero-slides';

export const runtime = 'nodejs';

export async function GET() {
  try {
    if (!isDbConfigured()) {
      return NextResponse.json({ slides: DEFAULT_HERO_SLIDES }, { headers: noStore() });
    }
    const managed = normalizeHeroSlides(await getHeroSlides());
    return NextResponse.json(
      { slides: managed.length > 0 ? managed : DEFAULT_HERO_SLIDES },
      { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120' } },
    );
  } catch (error) {
    console.error('[api/hero-slides] error', error);
    return NextResponse.json({ slides: DEFAULT_HERO_SLIDES }, { headers: noStore() });
  }
}

function noStore(): Record<string, string> {
  return { 'Cache-Control': 'no-store' };
}