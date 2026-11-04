import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { isDbConfigured } from '@/lib/db';
import { BOOK_DISCOUNT_DEFAULTS, getBookDiscount, setBookDiscount } from '@/lib/db-book-discount';
import { hasPermission } from '@/lib/auth';
import { getClientIp, rateLimitResponse } from '@/lib/rate-limit';
import { denyIfCrossOrigin, readJsonBody } from '@/lib/request-security';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  if (!(await hasPermission(request, 'book-discount'))) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }
  const configured = isDbConfigured();
  try {
    const discount = (configured ? await getBookDiscount() : null) ?? BOOK_DISCOUNT_DEFAULTS;
    return NextResponse.json(
      { success: true, configured, discount },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch (error) {
    console.error('[api/admin/book-discount] load error', error);
    return NextResponse.json(
      { success: false, message: 'Failed to load the book discount from Firebase' },
      { status: 502 },
    );
  }
}

export async function PUT(request: NextRequest) {
  const crossOrigin = denyIfCrossOrigin(request);
  if (crossOrigin) return crossOrigin;

  if (!(await hasPermission(request, 'book-discount'))) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  const throttled = rateLimitResponse(request, {
    limit: 30,
    windowMs: 15 * 60 * 1000,
    key: `admin-book-discount-write:${getClientIp(request)}`,
  });
  if (throttled) return throttled;

  if (!isDbConfigured()) {
    return NextResponse.json(
      { success: false, message: 'Firebase is not configured on the server' },
      { status: 503 },
    );
  }

  const body = await readJsonBody<Record<string, unknown>>(request, 4 * 1024);
  const enabled = body?.enabled === true;
  const type = body?.type === 'flat' ? 'flat' : 'percent';
  const base = body?.base === 'mrp' ? 'mrp' : 'selling';
  const value = Number(body?.value);
  const expiresAt =
    typeof body?.expiresAt === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(body.expiresAt)
      ? body.expiresAt
      : null;

  if (enabled) {
    if (!Number.isFinite(value) || value <= 0) {
      return NextResponse.json(
        { success: false, message: 'Enter a discount greater than zero' },
        { status: 400 },
      );
    }
    if (type === 'percent' && value > 100) {
      return NextResponse.json(
        { success: false, message: 'A percentage discount cannot be more than 100' },
        { status: 400 },
      );
    }
    if (type === 'flat' && value > 100000) {
      return NextResponse.json({ success: false, message: 'Discount is too large' }, { status: 400 });
    }
  }

  const discount = {
    enabled,
    type,
    base,
    value: Number.isFinite(value) && value > 0 ? Math.round(value * 100) / 100 : 0,
    expiresAt,
  } as const;

  try {
    await setBookDiscount(discount);
    revalidatePath('/api/books');
    return NextResponse.json({ success: true, discount });
  } catch (error) {
    console.error('[api/admin/book-discount] save error', error);
    return NextResponse.json(
      { success: false, message: 'Could not save the book discount to Firebase' },
      { status: 502 },
    );
  }
}
