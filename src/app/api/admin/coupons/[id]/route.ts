import { NextRequest, NextResponse } from 'next/server';
import {
  deleteCoupon,
  parseCouponPayload,
  updateCoupon,
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

function guard(request: NextRequest): Response | null {
  const crossOrigin = denyIfCrossOrigin(request);
  if (crossOrigin) return crossOrigin;
  if (!hasAdminAccess(request)) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }
  return rateLimitResponse(request, {
    limit: 30,
    windowMs: 15 * 60 * 1000,
    key: `admin-coupons-write:${getClientIp(request)}`,
  });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const blocked = guard(request);
  if (blocked) return blocked;

  const { id } = await params;
  const body = await readJsonBody(request, 16 * 1024);
  if (!body) {
    return NextResponse.json({ success: false, message: 'Invalid request body' }, { status: 400 });
  }

  try {
    const coupon = await updateCoupon(id, parseCouponPayload(body));
    return NextResponse.json({ success: true, coupon });
  } catch (error) {
    console.error('[api/admin/coupons] update error', error);
    return errorResponse(error, 'Could not update the coupon');
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const blocked = guard(request);
  if (blocked) return blocked;

  const { id } = await params;
  try {
    await deleteCoupon(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[api/admin/coupons] delete error', error);
    return errorResponse(error, 'Could not delete the coupon');
  }
}
