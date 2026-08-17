import { NextRequest } from 'next/server';
import { timingSafeEqual } from 'crypto';
import { ADMIN_SESSION_COOKIE, verifyAdminSession } from '@/lib/admin-auth';

/**
 * Admin access for the /api/books write endpoints.
 *
 * Fails CLOSED: if ADMIN_API_TOKEN is not configured on the server, admin
 * mutations are refused rather than silently allowed.
 */
export function hasAdminAccess(request: NextRequest): boolean {
  const token = process.env.ADMIN_API_TOKEN;
  if (!token) return false;

  const provided =
    request.headers.get('x-admin-token') ??
    (request.headers.get('authorization') ?? '').replace(/^Bearer\s+/i, '');
  if (provided) {
    const a = Buffer.from(provided);
    const b = Buffer.from(token);
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  }

  return verifyAdminSession(request.cookies.get(ADMIN_SESSION_COOKIE)?.value);
}
