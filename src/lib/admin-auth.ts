import { createHmac, timingSafeEqual } from 'crypto';

export const ADMIN_SESSION_COOKIE = 'ap_admin_session';
const SESSION_TTL_MS = 12 * 60 * 60 * 1000;

export type AdminRole = 'admin' | 'moderator';

/**
 * Session signing secret. Admin sessions are only usable when a real secret is
 * configured. Prefer ADMIN_SESSION_SECRET so admin auth has its own dedicated
 * key that is completely separate from payment / API secrets. Falls closed —
 * no sessions can be created or verified.
 */
function signingSecret(): string {
  return process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_API_TOKEN || '';
}

/**
 * Sign a session token that carries the caller's role. The payload is
 * `<role>:<issuedAt>` — the role is signed so it cannot be forged by the user.
 */
export function signAdminSession(role: AdminRole = 'admin'): string {
  const secret = signingSecret();
  if (!secret) {
    throw new Error('Admin sessions are not configured on the server.');
  }
  const payload = `${role}:${Date.now()}`;
  const signature = createHmac('sha256', secret).update(payload).digest('base64url');
  return `${payload}.${signature}`;
}

/** Verify a session token and return its role, or null when invalid/expired. */
export function getAdminRole(token: string | undefined | null): AdminRole | null {
  if (!token) return null;
  const secret = signingSecret();
  if (!secret) return null;
  const [payload, signature] = token.split('.');
  if (!payload || !signature) return null;
  const expected = createHmac('sha256', secret).update(payload).digest('base64url');
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  const sep = payload.indexOf(':');
  if (sep <= 0) return null;
  const role = payload.slice(0, sep);
  if (role !== 'admin' && role !== 'moderator') return null;
  const issuedAt = Number(payload.slice(sep + 1));
  if (!Number.isFinite(issuedAt)) return null;
  if (Date.now() - issuedAt >= SESSION_TTL_MS) return null;
  return role;
}

export function verifyAdminSession(token: string | undefined | null): boolean {
  return getAdminRole(token) !== null;
}

export const ADMIN_SESSION_MAX_AGE = Math.floor(SESSION_TTL_MS / 1000);
