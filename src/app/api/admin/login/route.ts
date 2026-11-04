import { NextRequest, NextResponse } from 'next/server';
import { timingSafeEqual } from 'crypto';
import {
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_MAX_AGE,
  signAdminSession,
  type SessionSubject,
} from '@/lib/admin-auth';
import { isDbConfigured } from '@/lib/db';
import { findStaffByPassword } from '@/lib/db-admin-staff';
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

  // One password box for everyone: the owner password, the legacy moderator
  // password, or a staff password created in /admin/staff.
  let subject: SessionSubject | null = null;
  if (tokenMatches(password, adminToken)) {
    subject = { kind: 'owner' };
  } else if (tokenMatches(password, moderatorToken)) {
    subject = { kind: 'moderator' };
  } else if (password && isDbConfigured()) {
    const staff = await findStaffByPassword(password).catch((error) => {
      console.error('[admin/login] staff lookup failed', error);
      return null;
    });
    if (staff) subject = { kind: 'staff', staffId: staff.id, version: staff.sessionVersion };
  }

  if (!subject) {
    return NextResponse.json({ success: false, message: 'Invalid password' }, { status: 401 });
  }

  const response = NextResponse.json(
    { success: true },
    { headers: { 'Cache-Control': 'no-store' } },
  );
  response.cookies.set(ADMIN_SESSION_COOKIE, signAdminSession(subject), {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: ADMIN_SESSION_MAX_AGE,
  });
  return response;
}
