import { NextRequest, NextResponse } from 'next/server';
import { timingSafeEqual } from 'crypto';
import {
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_MAX_AGE,
  signAdminSession,
  type AdminRole,
} from '@/lib/admin-auth';
import { getClientIp, rateLimitResponse } from '@/lib/rate-limit';
import { denyIfCrossOrigin, readJsonBody } from '@/lib/request-security';

export const runtime = 'nodejs';

function tokenMatches(password: string, expected: string | undefined): boolean {
  if (!expected) return false;
  const a = Buffer.from(password);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

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
  const adminToken = process.env.ADMIN_API_TOKEN;
  const moderatorToken = process.env.MODERATOR_API_TOKEN;

  if (!adminToken && !moderatorToken) {
    return NextResponse.json(
      { success: false, message: 'Back-office access is not configured on the server.' },
      { status: 500 },
    );
  }

  let role: AdminRole | null = null;
  if (tokenMatches(password, adminToken)) {
    role = 'admin';
  } else if (tokenMatches(password, moderatorToken)) {
    role = 'moderator';
  }

  if (!role) {
    return NextResponse.json({ success: false, message: 'Invalid password' }, { status: 401 });
  }

  const response = NextResponse.json(
    { success: true, role },
    { headers: { 'Cache-Control': 'no-store' } },
  );
  response.cookies.set(ADMIN_SESSION_COOKIE, signAdminSession(role), {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: ADMIN_SESSION_MAX_AGE,
  });
  return response;
}
