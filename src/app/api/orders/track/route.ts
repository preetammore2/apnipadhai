import { NextRequest, NextResponse } from 'next/server';
import { getOrderById, phoneMatchesOrder } from '@/lib/woocommerce';

export const runtime = 'nodejs';

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending Payment',
  processing: 'Processing',
  'on-hold': 'On Hold',
  completed: 'Delivered',
  cancelled: 'Cancelled',
  refunded: 'Refunded',
  failed: 'Failed',
};

export async function GET(req: NextRequest) {
  const orderIdRaw = req.nextUrl.searchParams.get('orderId')?.trim() ?? '';
  const phone = req.nextUrl.searchParams.get('phone')?.trim() ?? '';

  if (!/^\d+$/.test(orderIdRaw)) {
    return NextResponse.json(
      { success: false, message: 'Please enter a valid order ID (numbers only).' },
      { status: 400 },
    );
  }
  if (phone.replace(/\D/g, '').length < 10) {
    return NextResponse.json(
      { success: false, message: 'Please enter a valid 10-digit mobile number.' },
      { status: 400 },
    );
  }

  try {
    const order = await getOrderById(Number(orderIdRaw));
    if (!order) {
      return NextResponse.json(
        { success: false, message: 'No order found with this order ID.' },
        { status: 404 },
      );
    }

    if (!phoneMatchesOrder(order, phone)) {
      return NextResponse.json(
        { success: false, message: 'The mobile number does not match this order.' },
        { status: 400 },
      );
    }

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        status: order.status,
        statusLabel: STATUS_LABELS[order.status] ?? order.status,
        total: order.total,
        currency: order.currency,
        dateCreated: order.dateCreated,
      },
    });
  } catch (error) {
    console.error('[api/orders/track] error', error);
    return NextResponse.json(
      { success: false, message: 'Failed to track order. Please try again.' },
      { status: 502 },
    );
  }
}
