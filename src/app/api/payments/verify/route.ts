import { NextRequest, NextResponse } from 'next/server';
import {
  getPhonePeConfig,
  getPhonePePaymentStatus,
  verifyOrderToken,
} from '@/lib/phonepe';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    const merchantTransactionId =
      typeof body?.merchantTransactionId === 'string' ? body.merchantTransactionId : '';

    if (!merchantTransactionId) {
      return NextResponse.json(
        { success: false, message: 'Missing payment reference' },
        { status: 400 },
      );
    }

    const config = getPhonePeConfig();
    const token = request.cookies.get('ap_order')?.value;
    const order = token ? verifyOrderToken(token, config.signingSecret) : null;

    if (!order || order.merchantTransactionId !== merchantTransactionId) {
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

    if (config.mode === 'mock') {
      return NextResponse.json({
        success: true,
        data: {
          merchantTransactionId,
          transactionId: `MOCK${Date.now()}`,
          state: 'COMPLETED',
          amount: order.amountPaise,
          code: 'PAYMENT_SUCCESS',
        },
      });
    }

    const status = await getPhonePePaymentStatus({
      merchantId: config.merchantId,
      merchantTransactionId,
      baseUrl: config.baseUrl,
      saltKey: config.saltKey,
      saltIndex: config.saltIndex,
    });

    const data = status?.data?.data;
    const completed = status?.data?.success === true && data?.state === 'COMPLETED';
    const amountMatches = typeof data?.amount === 'number' && data.amount === order.amountPaise;

    return NextResponse.json({
      success: completed && amountMatches,
      data: {
        merchantTransactionId,
        transactionId: data?.transactionId ?? null,
        state: data?.state ?? null,
        amount: data?.amount ?? null,
        providerReferenceId: data?.providerReferenceId ?? null,
        code: data?.state === 'COMPLETED' ? 'PAYMENT_SUCCESS' : data?.state,
      },
    });
  } catch (error) {
    console.error('[payments/verify] error', error);
    return NextResponse.json(
      { success: false, message: 'Could not verify payment' },
      { status: 500 },
    );
  }
}
