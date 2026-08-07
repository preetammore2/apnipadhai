import { NextRequest, NextResponse } from 'next/server';
import { getPhonePeConfig, getRequestBaseUrl, verifyOrderToken } from '@/lib/phonepe';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const config = getPhonePeConfig();

  if (config.mode !== 'mock') {
    return NextResponse.json({ success: false, message: 'Not available' }, { status: 404 });
  }

  const merchantTransactionId =
    request.nextUrl.searchParams.get('merchantTransactionId') || 'MOCK';

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
