import { NextRequest, NextResponse } from 'next/server';
import { isDbConfigured } from '@/lib/db';
import {
  getPopup,
  isPopupDate,
  isPopupExpired,
  isValidPopupImage,
  POPUP_DEFAULTS,
  setPopup,
} from '@/lib/db-popup';
import { hasPermission } from '@/lib/auth';
import { getClientIp, rateLimitResponse } from '@/lib/rate-limit';
import { denyIfCrossOrigin, readJsonBody } from '@/lib/request-security';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  if (!(await hasPermission(request, 'popup'))) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }
  const configured = isDbConfigured();
  try {
    const popup = configured ? await getPopup() : POPUP_DEFAULTS;
    return NextResponse.json(
      { success: true, configured, popup },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch (error) {
    console.error('[api/admin/popup] load error', error);
    return NextResponse.json(
      { success: false, message: 'Failed to load the popup from Firebase' },
      { status: 502 },
    );
  }
}

export async function PUT(request: NextRequest) {
  const crossOrigin = denyIfCrossOrigin(request);
  if (crossOrigin) return crossOrigin;

  if (!(await hasPermission(request, 'popup'))) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  const throttled = rateLimitResponse(request, {
    limit: 30,
    windowMs: 15 * 60 * 1000,
    key: `admin-popup-write:${getClientIp(request)}`,
  });
  if (throttled) return throttled;

  if (!isDbConfigured()) {
    return NextResponse.json(
      { success: false, message: 'Firebase is not configured on the server' },
      { status: 503 },
    );
  }

  const body = await readJsonBody<Record<string, unknown>>(request, 1024 * 1024);
  if (!body) {
    return NextResponse.json(
      { success: false, message: 'Invalid request (the image may be too large)' },
      { status: 400 },
    );
  }
  const enabled = body.enabled === true;
  const image = typeof body.image === 'string' ? body.image.trim() : '';
  const alt = typeof body.alt === 'string' ? body.alt.trim().slice(0, 200) : '';
  const expiresAt = isPopupDate(body.expiresAt) ? body.expiresAt : '';

  if (image && !isValidPopupImage(image)) {
    return NextResponse.json(
      { success: false, message: 'Use an uploaded image or an https image link (max ~900 KB)' },
      { status: 400 },
    );
  }
  if (enabled && !image) {
    return NextResponse.json(
      { success: false, message: 'Add a photo before turning the popup on' },
      { status: 400 },
    );
  }

  if (enabled && !expiresAt) {
    return NextResponse.json(
      { success: false, message: 'Choose until which date the popup should show' },
      { status: 400 },
    );
  }
  if (enabled && isPopupExpired(expiresAt)) {
    return NextResponse.json(
      { success: false, message: 'The "Show until" date has already passed' },
      { status: 400 },
    );
  }

  try {
    const popup = await setPopup({ enabled, image, alt, expiresAt });
    return NextResponse.json({ success: true, popup });
  } catch (error) {
    console.error('[api/admin/popup] save error', error);
    return NextResponse.json(
      { success: false, message: 'Could not save the popup to Firebase' },
      { status: 502 },
    );
  }
}
