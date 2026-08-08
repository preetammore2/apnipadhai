import { NextRequest, NextResponse } from 'next/server';
import { getPhonePeConfig, getPhonePePaymentStatus, verifyOrderToken } from '@/lib/phonepe';
import { markOrderPaid } from '@/lib/woocommerce';
import { sendOrderSuccessNotification } from '@/lib/notifications';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    const payload =
      body && typeof body.payload === 'object' && body.payload !== null
        ? body.payload
        : body;

    const merchantOrderId =
      typeof payload?.merchantOrderId === 'string' ? payload.merchantOrderId : '';

    if (!merchantOrderId) {
      return NextResponse.json({ success: false }, { status: 400 });
    }

    const config = getPhonePeConfig();
    let completed = false;

    if (config.mode !== 'mock') {
      const status = await getPhonePePaymentStatus({
        merchantOrderId,
        config,
      });

      const data = status?.data;
      completed = status?.ok === true && data?.state === 'COMPLETED';
    } else {
      completed = true;
    }

    if (!completed) {
      return NextResponse.json({ success: false }, { status: 400 });
    }

    const token = request.cookies.get('ap_order')?.value;
    const order = token ? verifyOrderToken(token, config.signingSecret) : null;
    if (order && order.merchantTransactionId === merchantOrderId) {
      await markOrderPaid(order.woocommerceOrderId).catch((error) => {
        console.error('[payments/callback] failed to mark WooCommerce order paid', error);
      });
      await sendOrderSuccessNotification({
        name: order.customer.name,
        phone: order.customer.phone,
        email: order.customer.email || undefined,
        orderId: String(order.woocommerceOrderId),
        amountInr: order.amountPaise / 100,
        items: order.items,
      }).catch((error) => {
        console.error('[payments/callback] failed to send order notification', error);
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[payments/callback] error', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
