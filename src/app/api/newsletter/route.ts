import { NextRequest, NextResponse } from 'next/server';
import { getClientIp, rateLimitResponse } from '@/lib/rate-limit';
import { denyIfCrossOrigin, readJsonBody } from '@/lib/request-security';

export const runtime = 'nodejs';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  const crossOrigin = denyIfCrossOrigin(request);
  if (crossOrigin) return crossOrigin;

  const throttled = rateLimitResponse(request, {
    limit: 5,
    windowMs: 60 * 60 * 1000,
    key: `newsletter:${getClientIp(request)}`,
  });
  if (throttled) return throttled;

  try {
    const body = await readJsonBody<{ email?: unknown }>(request);
    const email = typeof body?.email === 'string' ? body.email.trim().slice(0, 254) : '';

    if (!EMAIL_REGEX.test(email)) {
      return NextResponse.json(
        { success: false, message: 'Invalid email address' },
        { status: 400 },
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Subscription recorded',
      email,
    });
  } catch (error) {
    console.error('[api/newsletter] error', error);
    return NextResponse.json(
      { success: false, message: 'Failed to subscribe' },
      { status: 500 },
    );
  }
}
