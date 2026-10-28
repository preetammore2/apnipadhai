import { NextRequest, NextResponse } from 'next/server';
import { findCouponForCart } from '@/lib/woocommerce';
import { getClientIp, rateLimitResponse } from '@/lib/rate-limit';
import { denyIfCrossOrigin, readJsonBody } from '@/lib/request-security';

export const runtime = 'nodejs';

/**
 * Check a single WooCommerce coupon code for the shopper's cart. Only the
 * coupon that was typed is returned — the list of codes is never exposed.
 */
export async function POST(request: NextRequest) {
  const crossOrigin = denyIfCrossOrigin(request);
  if (crossOrigin) return crossOrigin;

  const throttled = rateLimitResponse(request, {
    limit: 15,
    windowMs: 15 * 60 * 1000,
    key: `coupon-validate:${getClientIp(request)}`,
  });
  if (throttled) return throttled;

  const body = await readJsonBody<{ code?: unknown; subtotal?: unknown }>(request, 4 * 1024);
  const code = typeof body?.code === 'string' ? body.code.trim() : '';
  const subtotal = Number(body?.subtotal);
  if (!code) {
    return NextResponse.json({ success: false, message: 'Enter a coupon code' }, { status: 400 });
  }

  try {
    const result = await findCouponForCart(code, Number.isFinite(subtotal) ? subtotal : 0);
    if ('error' in result) {
      return NextResponse.json({ success: false, message: result.error }, { status: 400 });
    }
    return NextResponse.json(
      { success: true, coupon: result.coupon },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch (error) {
    console.error('[api/coupons/validate] error', error);
    return NextResponse.json(
      { success: false, message: 'Could not check the coupon. Please try again.' },
      { status: 502 },
    );
  }
}
