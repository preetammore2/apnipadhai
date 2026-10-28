import { NextRequest, NextResponse } from 'next/server';
import { isDbConfigured } from '@/lib/db';
import {
  getDeliverySettings,
  MAX_DELIVERY_AMOUNT,
  setDeliverySettings,
} from '@/lib/db-store-settings';
import { getWpStoreSettings } from '@/lib/store-settings';
import { hasAdminAccess } from '@/lib/auth';
import { getClientIp, rateLimitResponse } from '@/lib/rate-limit';
import { denyIfCrossOrigin, readJsonBody } from '@/lib/request-security';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  if (!hasAdminAccess(request)) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  const configured = isDbConfigured();
  try {
    const saved = configured ? await getDeliverySettings() : null;
    const delivery = saved ?? (await getWpStoreSettings()).shipping;
    return NextResponse.json(
      { success: true, configured, saved: saved !== null, delivery },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch (error) {
    console.error('[api/admin/delivery] load error', error);
    return NextResponse.json(
      { success: false, message: 'Failed to load delivery settings from Firebase' },
      { status: 502 },
    );
  }
}

export async function PUT(request: NextRequest) {
  const crossOrigin = denyIfCrossOrigin(request);
  if (crossOrigin) return crossOrigin;

  if (!hasAdminAccess(request)) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  const throttled = rateLimitResponse(request, {
    limit: 30,
    windowMs: 15 * 60 * 1000,
    key: `admin-delivery-write:${getClientIp(request)}`,
  });
  if (throttled) return throttled;

  if (!isDbConfigured()) {
    return NextResponse.json(
      { success: false, message: 'Firebase is not configured on the server' },
      { status: 503 },
    );
  }

  const body = await readJsonBody<Record<string, unknown>>(request, 4 * 1024);
  const amount = Number(body?.amount);
  const perExtraItem = Number(body?.perExtraItem);
  const label = typeof body?.label === 'string' ? body.label.trim().slice(0, 60) : '';

  const validAmount = (n: number) => Number.isFinite(n) && n >= 0 && n <= MAX_DELIVERY_AMOUNT;
  if (!validAmount(amount) || !validAmount(perExtraItem)) {
    return NextResponse.json(
      { success: false, message: `Charges must be between ₹0 and ₹${MAX_DELIVERY_AMOUNT}` },
      { status: 400 },
    );
  }

  const delivery = {
    amount: Math.round(amount * 100) / 100,
    perExtraItem: Math.round(perExtraItem * 100) / 100,
    label: label || 'Delivery Charges',
  };

  try {
    await setDeliverySettings(delivery);
    return NextResponse.json({ success: true, delivery });
  } catch (error) {
    console.error('[api/admin/delivery] save error', error);
    return NextResponse.json(
      { success: false, message: 'Could not save delivery settings to Firebase' },
      { status: 502 },
    );
  }
}
