import { NextRequest } from 'next/server';
import { timingSafeEqual } from 'crypto';
import { ADMIN_SESSION_COOKIE, getAdminRole, type AdminRole } from '@/lib/admin-auth';

export type { AdminRole };

/**
 * Role-aware access for admin endpoints. Every request is resolved to a role:
 *
 * - A matching `x-admin-token` / Bearer header is always treated as `admin`.
 * - Otherwise the signed session cookie is verified and its role returned.
 *
 * Access fails CLOSED: no token configured ⇒ no access; expired/forged session
 * ⇒ no access.
 */
export function getRequestAdminRole(request: NextRequest): AdminRole | null {
  const headerToken = process.env.ADMIN_API_TOKEN;
  if (headerToken) {
    const provided =
      request.headers.get('x-admin-token') ??
      (request.headers.get('authorization') ?? '').replace(/^Bearer\s+/i, '');
    if (provided) {
      const a = Buffer.from(provided);
      const b = Buffer.from(headerToken);
      if (a.length === b.length && timingSafeEqual(a, b)) return 'admin';
    }
  }
  return getAdminRole(request.cookies.get(ADMIN_SESSION_COOKIE)?.value);
}

/** Full admin rights: all admin endpoints. Moderators are rejected. */
export function hasAdminAccess(request: NextRequest): boolean {
  return getRequestAdminRole(request) === 'admin';
}

/** Any authenticated back-office user (admin or moderator). */
export function hasAnyAdminAccess(request: NextRequest): boolean {
  return getRequestAdminRole(request) !== null;
}