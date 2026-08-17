import { NextRequest, NextResponse } from 'next/server';
import { sendCartReminderNotification } from '@/lib/notifications';
import { getClientIp, rateLimitResponse } from '@/lib/rate-limit';
import { denyIfCrossOrigin, readJsonBody } from '@/lib/request-security';
import { normalizePhone } from '@/lib/validation';

export const runtime = 'nodejs';

const MAX_ITEMS = 20;

export async function POST(request: NextRequest) {
  const crossOrigin = denyIfCrossOrigin(request);
  if (crossOrigin) return crossOrigin;

  const ip = getClientIp(request);

  // Per-contact guard first so one phone/email cannot be flooded even if the
  // attacker rotates IPs.
  const body = await readJsonBody<{
    customer?: unknown;
    items?: unknown;
  }>(request);
  const rawCustomer = body?.customer;
  const customer: Record<string, unknown> =
    typeof rawCustomer === 'object' && rawCustomer !== null
      ? (rawCustomer as Record<string, unknown>)
      : {};
  const rawPhone = typeof customer.phone === 'string' ? customer.phone.trim() : '';
  const phone = rawPhone ? normalizePhone(rawPhone) : '';
  const email = typeof customer.email === 'string' ? customer.email.trim() : '';

  if (rawPhone && !phone) {
    return NextResponse.json(
      { success: false, message: 'Invalid phone number' },
      { status: 400 },
    );
  }
  if (!phone && !email) {
    return NextResponse.json(
      { success: false, message: 'A contact (phone or email) is required' },
      { status: 400 },
    );
  }

  const contactKey = `${phone}|${email}`.toLowerCase();
  const contactThrottle = rateLimitResponse(request, {
    limit: 2,
    windowMs: 60 * 60 * 1000,
    key: `cart-reminder-contact:${contactKey}`,
  });
  if (contactThrottle) return contactThrottle;

  const ipThrottle = rateLimitResponse(request, {
    limit: 10,
    windowMs: 60 * 60 * 1000,
    key: `cart-reminder-ip:${ip}`,
  });
  if (ipThrottle) return ipThrottle;

  const items: { title?: string; quantity?: number; price?: number }[] = Array.isArray(
    body?.items,
  )
    ? (body.items as unknown[])
        .slice(0, MAX_ITEMS)
        .reduce<{ title?: string; quantity?: number; price?: number }[]>((acc, item) => {
          if (typeof item !== 'object' || item === null) return acc;
          const { title, quantity, price } = item as {
            title?: unknown;
            quantity?: unknown;
            price?: unknown;
          };
          acc.push({
            title: typeof title === 'string' ? title.slice(0, 200) : undefined,
            quantity:
              typeof quantity === 'number' && Number.isFinite(quantity)
                ? Math.min(Math.max(1, Math.round(quantity)), 99)
                : undefined,
            price:
              typeof price === 'number' && Number.isFinite(price) && price >= 0
                ? price
                : undefined,
          });
          return acc;
        }, [])
    : [];

  try {
    const result = await sendCartReminderNotification({
      name: typeof customer.name === 'string' ? String(customer.name).slice(0, 200) : undefined,
      phone: phone || undefined,
      email,
      items,
    });

    return NextResponse.json({ success: true, attempted: result.attempted });
  } catch (error) {
    console.error('[notifications/cart-reminder] error', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
