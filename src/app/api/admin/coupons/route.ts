import { NextRequest, NextResponse } from 'next/server';
import {
  createCoupon,
  listCoupons,
  parseCouponPayload,
  WooCommerceError,
} from '@/lib/woocommerce';
import { hasAdminAccess } from '@/lib/auth';
import { getClientIp, rateLimitResponse } from '@/lib/rate-limit';
import { denyIfCrossOrigin, readJsonBody } from '@/lib/request-security';

export const runtime = 'nodejs';

function errorResponse(error: unknown, fallback: string) {
  if (error instanceof WooCommerceError) {
    return NextResponse.json(
      { success: false, message: error.message || fallback },
      { status: error.status >= 400 && error.status < 600 ? error.status : 502 },
    );
  }
  return NextResponse.json({ success: false, message: fallback }, { status: 502 });
}

export async function GET(request: NextRequest) {
  if (!hasAdminAccess(request)) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }
  try {
    const coupons = await listCoupons();
    return NextResponse.json({ success: true, coupons }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('[api/admin/coupons] list error', error);
    return errorResponse(error, 'Failed to load coupons from WooCommerce');
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
    key: `admin-coupons-write:${getClientIp(request)}`,
  });
  if (throttled) return throttled;

  const body = await readJsonBody(request, 16 * 1024);
  if (!body) {
    return NextResponse.json({ success: false, message: 'Invalid request body' }, { status: 400 });
  }

  try {
    const coupon = await createCoupon(parseCouponPayload(body));
    return NextResponse.json({ success: true, coupon });
  } catch (error) {
    console.error('[api/admin/coupons] create error', error);
    return errorResponse(error, 'Could not create the coupon');
  }
}
