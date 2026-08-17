import { NextRequest, NextResponse } from 'next/server';
import {
  getPhonePeConfig,
  isPaymentRequestAllowed,
  verifyOrderToken,
} from '@/lib/phonepe';
import { getClientIp, rateLimitResponse } from '@/lib/rate-limit';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    if (!isPaymentRequestAllowed(request.headers)) {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
    }

    const throttled = rateLimitResponse(request, {
      limit: 30,
      windowMs: 5 * 60 * 1000,
      key: `payment-resume:${getClientIp(request)}`,
    });
    if (throttled) return throttled;

    const config = getPhonePeConfig();
    const token = request.cookies.get('ap_order')?.value;
    const order = token ? verifyOrderToken(token, config.signingSecret) : null;

    if (!order) {
      return NextResponse.json(
        { success: false, message: 'Order session is invalid or has expired' },
        { status: 400 },
      );
    }
    if (order.exp < Date.now()) {
      return NextResponse.json(
        { success: false, message: 'Order session has expired' },
        { status: 400 },
      );
    }
    if (!order.redirectUrl) {
      return NextResponse.json(
        { success: false, message: 'Payment session is missing' },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        redirectUrl: order.redirectUrl,
        merchantTransactionId: order.merchantTransactionId,
        embed: false,
      },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch (error) {
    console.error('[payments/resume] error', error);
    return NextResponse.json(
      { success: false, message: 'Could not start payment. Please try again.' },
      { status: 500 },
    );
  }
}
