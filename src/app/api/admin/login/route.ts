import { NextRequest, NextResponse } from 'next/server';
import { timingSafeEqual } from 'crypto';
import {
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_MAX_AGE,
  signAdminSession,
} from '@/lib/admin-auth';
import { getClientIp, rateLimitResponse } from '@/lib/rate-limit';
import { denyIfCrossOrigin, readJsonBody } from '@/lib/request-security';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const crossOrigin = denyIfCrossOrigin(request);
  if (crossOrigin) return crossOrigin;

  const throttled = rateLimitResponse(request, {
    limit: 5,
    windowMs: 15 * 60 * 1000,
    key: `admin-login:${getClientIp(request)}`,
  });
  if (throttled) return throttled;

  const body = await readJsonBody<{ password?: unknown }>(request, 16 * 1024);
  const password = typeof body?.password === 'string' ? body.password : '';
  const expected = process.env.ADMIN_API_TOKEN;

  if (!expected) {
    return NextResponse.json(
      { success: false, message: 'Admin access is not configured on the server.' },
      { status: 500 },
    );
  }

  const a = Buffer.from(password);
  const b = Buffer.from(expected);
  const valid = a.length === b.length && timingSafeEqual(a, b);

  if (!valid) {
    return NextResponse.json({ success: false, message: 'Invalid password' }, { status: 401 });
  }

  const response = NextResponse.json(
    { success: true },
    { headers: { 'Cache-Control': 'no-store' } },
  );
  response.cookies.set(ADMIN_SESSION_COOKIE, signAdminSession(), {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: ADMIN_SESSION_MAX_AGE,
  });
  return response;
}
