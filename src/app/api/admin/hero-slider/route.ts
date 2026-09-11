import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { isDbConfigured } from '@/lib/db';
import { getHeroSlides, setHeroSlides } from '@/lib/db-hero-slides';
import { normalizeHeroSlides } from '@/lib/hero-slides';
import { hasAdminAccess } from '@/lib/auth';
import { getClientIp, rateLimitResponse } from '@/lib/rate-limit';
import { denyIfCrossOrigin, readJsonBody } from '@/lib/request-security';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  if (!hasAdminAccess(request)) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const configured = isDbConfigured();
    if (!configured) {
      return NextResponse.json({ success: true, configured: false, slides: [] });
    }
    const slides = normalizeHeroSlides(await getHeroSlides());
    return NextResponse.json({ success: true, configured, slides });
  } catch (error) {
    console.error('[api/admin/hero-slider] list error', error);
    return NextResponse.json(
      { success: false, message: 'Failed to load hero slides from Firebase' },
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
    key: `admin-hero-slider-write:${getClientIp(request)}`,
  });
  if (throttled) return throttled;

  try {
    const body = await readJsonBody<{ slides?: unknown }>(request);
    const slides = normalizeHeroSlides(body?.slides);
    if (slides.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Add at least one slide with an image URL' },
        { status: 400 },
      );
    }

    await setHeroSlides(slides);
    revalidatePath('/api/hero-slides');
    revalidatePath('/');

    const saved = normalizeHeroSlides(await getHeroSlides());
    return NextResponse.json({ success: true, slides: saved });
  } catch (error) {
    console.error('[api/admin/hero-slider] save error', error);
    return NextResponse.json(
      { success: false, message: 'Failed to save hero slides to Firebase' },
      { status: 502 },
    );
  }
}