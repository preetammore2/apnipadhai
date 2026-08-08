import { NextRequest, NextResponse } from 'next/server';
import { sendCartReminderNotification } from '@/lib/notifications';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json(
        { success: false, message: 'Invalid request body' },
        { status: 400 },
      );
    }

    const customer =
      typeof body.customer === 'object' && body.customer ? body.customer : {};

    const phone = typeof customer.phone === 'string' ? customer.phone.trim() : '';
    const email = typeof customer.email === 'string' ? customer.email.trim() : '';
    if (!phone && !email) {
      return NextResponse.json(
        { success: false, message: 'A contact (phone or email) is required' },
        { status: 400 },
      );
    }

    const items: { title?: string; quantity?: number; price?: number }[] = Array.isArray(
      body.items,
    )
      ? body.items
          .map((item: unknown) => {
            if (typeof item !== 'object' || item === null) return null;
            const { title, quantity, price } = item as {
              title?: unknown;
              quantity?: unknown;
              price?: unknown;
            };
            return {
              title: typeof title === 'string' ? title : undefined,
              quantity:
                typeof quantity === 'number' && Number.isFinite(quantity) ? quantity : undefined,
              price: typeof price === 'number' && Number.isFinite(price) ? price : undefined,
            };
          })
          .filter(
            (item: { title?: string; quantity?: number; price?: number } | null): item is {
              title?: string;
              quantity?: number;
              price?: number;
            } => item !== null,
          )
      : [];

    const result = await sendCartReminderNotification({
      name: typeof customer.name === 'string' ? customer.name : undefined,
      phone,
      email,
      items,
    });

    return NextResponse.json({ success: true, attempted: result.attempted });
  } catch (error) {
    console.error('[notifications/cart-reminder] error', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
