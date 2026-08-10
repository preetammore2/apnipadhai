import { NextRequest, NextResponse } from 'next/server';
import { markOrderPaid } from '@/lib/woocommerce';
import { sendOrderSuccessNotification } from '@/lib/notifications';
import {
  getPhonePeConfig,
  getPhonePePaymentStatus,
  isPaymentRequestAllowed,
  verifyOrderToken,
} from '@/lib/phonepe';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    if (!isPaymentRequestAllowed(request.headers)) {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
    }

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

    let completed = false;
    let transactionId: string | null = null;
    let state: string | null = null;
    let errorCode: string | null = null;
    let detailedErrorCode: string | null = null;

    if (config.mode === 'mock') {
      completed = true;
      transactionId = `MOCK${Date.now()}`;
      state = 'COMPLETED';
    } else {
      const status = await getPhonePePaymentStatus({
        merchantOrderId: merchantTransactionId,
        config,
      });

      const data = status?.data;
      completed = status?.ok === true && data?.state === 'COMPLETED';
      state = data?.state ?? null;
      transactionId = data?.paymentDetails?.[0]?.transactionId ?? null;
      errorCode = data?.errorCode ?? data?.paymentDetails?.[0]?.errorCode ?? null;
      detailedErrorCode =
        data?.detailedErrorCode ?? data?.paymentDetails?.[0]?.detailedErrorCode ?? null;

      const reportedAmount = Number(data?.amount);
      const amountMatches =
        Number.isFinite(reportedAmount) && reportedAmount === order.amountPaise;
      if (completed && !amountMatches) {
        console.error('[payments/verify] amount mismatch', {
          merchantTransactionId,
          expectedPaise: order.amountPaise,
          reportedPaise: reportedAmount,
          state,
        });
        completed = false;
      }
    }

    if (completed) {
      await markOrderPaid(order.woocommerceOrderId).catch((error) => {
        console.error('[payments/verify] failed to mark WooCommerce order paid', error);
      });
      await sendOrderSuccessNotification({
        name: order.customer.name,
        phone: order.customer.phone,
        email: order.customer.email || undefined,
        orderId: String(order.woocommerceOrderId),
        amountInr: order.amountPaise / 100,
        items: order.items,
      }).catch((error) => {
        console.error('[payments/verify] failed to send order notification', error);
      });
    }

    return NextResponse.json({
      success: completed,
      message: completed
        ? undefined
        : state === 'FAILED'
          ? detailedErrorCode
            ? `Payment failed at the payment gateway (${detailedErrorCode})`
            : errorCode
              ? `Payment failed at the payment gateway (${errorCode})`
              : 'Payment failed at the payment gateway'
          : 'Payment is still pending',
      data: {
        merchantTransactionId,
        transactionId,
        state,
        amount: order.amountPaise,
        providerReferenceId: null,
        errorCode,
        detailedErrorCode,
        code: completed ? 'PAYMENT_SUCCESS' : state ?? 'PAYMENT_PENDING',
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
