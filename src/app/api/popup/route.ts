import { NextResponse } from 'next/server';
import { getPublicPopup, isPopupActive } from '@/lib/db-popup';

export const runtime = 'nodejs';

/** Public: the site popup to show visitors, or { enabled: false }. */
export async function GET() {
  const popup = await getPublicPopup();
  // Stops showing by itself once the "Show until" date has passed.
  const body = isPopupActive(popup)
    ? { enabled: true, image: popup.image, alt: popup.alt, link: popup.link, size: popup.size, version: popup.version }
    : { enabled: false };
  return NextResponse.json(body, { headers: { 'Cache-Control': 'no-store' } });
}
