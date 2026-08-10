import { NextRequest, NextResponse } from 'next/server';
import {
  getPhonePeConfig,
  isPaymentRequestAllowed,
  verifyOrderToken,
} from '@/lib/phonepe';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    if (!isPaymentRequestAllowed(request.headers)) {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
    }

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

    return NextResponse.json({
      success: true,
      redirectUrl: order.redirectUrl,
      merchantTransactionId: order.merchantTransactionId,
      embed: config.mode !== 'mock',
    });
  } catch (error) {
    console.error('[payments/resume] error', error);
    return NextResponse.json(
      { success: false, message: 'Could not start payment. Please try again.' },
      { status: 500 },
    );
  }
}
