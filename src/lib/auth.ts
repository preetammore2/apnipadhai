import { NextRequest } from 'next/server';
import { timingSafeEqual } from 'crypto';
import { ADMIN_SESSION_COOKIE, getSessionSubject } from '@/lib/admin-auth';
import { ALL_PERMISSIONS, type AdminPermission } from '@/lib/admin-permissions';
import { isDbConfigured } from '@/lib/db';
import { getRole, getStaff } from '@/lib/db-admin-staff';

/** The signed-in back-office person and what they may do. */
export interface AdminPrincipal {
  name: string;
  isOwner: boolean;
  permissions: AdminPermission[];
}

const OWNER: AdminPrincipal = { name: 'Owner', isOwner: true, permissions: ALL_PERMISSIONS };
const MODERATOR: AdminPrincipal = { name: 'Moderator', isOwner: false, permissions: ['book-covers'] };

// Staff lookups are cached briefly so every admin request does not read
// Firestore; role/permission changes and disabled logins apply within this time.
const STAFF_CACHE_MS = 30 * 1000;
const staffCache = new Map<string, { value: AdminPrincipal | null; at: number }>();

export function clearStaffCache(): void {
  staffCache.clear();
}

async function resolveStaff(staffId: string, version: number): Promise<AdminPrincipal | null> {
  const key = `${staffId}.${version}`;
  const hit = staffCache.get(key);
  if (hit && Date.now() - hit.at < STAFF_CACHE_MS) return hit.value;

  let value: AdminPrincipal | null = null;
  try {
    if (isDbConfigured()) {
      const staff = await getStaff(staffId);
      if (staff && staff.active && staff.sessionVersion === version) {
        const role = await getRole(staff.roleId);
        if (role) value = { name: staff.name, isOwner: false, permissions: role.permissions };
      }
    }
  } catch (error) {
    // Fail closed: if Firebase cannot be read, staff have no access (the owner
    // password still works).
    console.error('[auth] could not load staff login', error);
  }
  staffCache.set(key, { value, at: Date.now() });
  return value;
}

/** Resolve a session cookie value (used by the admin layout and API routes). */
export async function resolveSessionPrincipal(
  token: string | undefined | null,
): Promise<AdminPrincipal | null> {
  const subject = getSessionSubject(token);
  if (!subject) return null;
  if (subject.kind === 'owner') return OWNER;
  if (subject.kind === 'moderator') return MODERATOR;
  return resolveStaff(subject.staffId, subject.version);
}

/**
 * Who is making this request. A matching `x-admin-token` / Bearer header is the
 * owner (scripts); otherwise the signed session cookie is checked. Fails
 * closed: no token configured or an invalid/expired session ⇒ null.
 */
export async function getAdminPrincipal(request: NextRequest): Promise<AdminPrincipal | null> {
  const headerToken = process.env.ADMIN_API_TOKEN;
  if (headerToken) {
    const provided =
      request.headers.get('x-admin-token') ??
      (request.headers.get('authorization') ?? '').replace(/^Bearer\s+/i, '');
    if (provided) {
      const a = Buffer.from(provided);
      const b = Buffer.from(headerToken);
      if (a.length === b.length && timingSafeEqual(a, b)) return OWNER;
    }
  }
  return resolveSessionPrincipal(request.cookies.get(ADMIN_SESSION_COOKIE)?.value);
}

/** True when the signed-in person has this permission (the owner has all). */
export async function hasPermission(
  request: NextRequest,
  permission: AdminPermission,
): Promise<boolean> {
  const principal = await getAdminPrincipal(request);
  return Boolean(principal && principal.permissions.includes(permission));
}

/** True when the signed-in person has at least one of these permissions. */
export async function hasAnyPermission(
  request: NextRequest,
  permissions: AdminPermission[],
): Promise<boolean> {
  const principal = await getAdminPrincipal(request);
  return Boolean(principal && permissions.some((p) => principal.permissions.includes(p)));
}

/** Any signed-in back-office person. */
export async function hasAnyAdminAccess(request: NextRequest): Promise<boolean> {
  return (await getAdminPrincipal(request)) !== null;
}

/** Only the owner (ADMIN_API_TOKEN) can manage roles and staff logins. */
export async function isOwnerRequest(request: NextRequest): Promise<boolean> {
  return (await getAdminPrincipal(request))?.isOwner === true;
}
