import { NextRequest, NextResponse } from 'next/server';
import { getPhonePeConfig, getRequestBaseUrl, verifyOrderToken } from '@/lib/phonepe';
import { getClientIp, rateLimitResponse } from '@/lib/rate-limit';
import { isMerchantTransactionId } from '@/lib/validation';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const throttled = rateLimitResponse(request, {
    limit: 10,
    windowMs: 60 * 1000,
    key: `mock-pay:${getClientIp(request)}`,
  });
  if (throttled) return throttled;

  const config = getPhonePeConfig();

  if (config.mode !== 'mock') {
    return NextResponse.json({ success: false, message: 'Not available' }, { status: 404 });
  }

  const merchantTransactionId =
    request.nextUrl.searchParams.get('merchantTransactionId') || 'MOCK';
  if (!isMerchantTransactionId(merchantTransactionId)) {
    return NextResponse.json(
      { success: false, message: 'Invalid payment reference' },
      { status: 400 },
    );
  }

  const token = request.cookies.get('ap_order')?.value;
  const order = token ? verifyOrderToken(token, config.signingSecret) : null;
  const amountPaise =
    order && order.merchantTransactionId === merchantTransactionId ? order.amountPaise : 0;

  const origin = getRequestBaseUrl(request.headers);
  const url = new URL('/payment/status', origin);
  url.searchParams.set('merchantTransactionId', merchantTransactionId);
  url.searchParams.set('transactionId', `MOCK${Date.now()}`);
  url.searchParams.set('amount', String(amountPaise));
  url.searchParams.set('providerReferenceId', `MOCKREF${Date.now()}`);
  url.searchParams.set('code', 'PAYMENT_SUCCESS');

  return NextResponse.redirect(url.toString());
}
