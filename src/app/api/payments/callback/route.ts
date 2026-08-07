import { NextRequest, NextResponse } from 'next/server';
import { getPhonePeConfig, getPhonePePaymentStatus } from '@/lib/phonepe';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    const merchantTransactionId =
      typeof body?.merchantTransactionId === 'string' ? body.merchantTransactionId : '';

    if (!merchantTransactionId) {
      return NextResponse.json({ success: false }, { status: 400 });
    }

    const config = getPhonePeConfig();

    if (config.mode !== 'mock') {
      const status = await getPhonePePaymentStatus({
        merchantId: config.merchantId,
        merchantTransactionId,
        baseUrl: config.baseUrl,
        saltKey: config.saltKey,
        saltIndex: config.saltIndex,
      });

      if (status?.data?.success !== true) {
        return NextResponse.json({ success: false }, { status: 400 });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[payments/callback] error', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
