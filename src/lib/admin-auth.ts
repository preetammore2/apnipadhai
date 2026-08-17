import { createHmac, timingSafeEqual } from 'crypto';

export const ADMIN_SESSION_COOKIE = 'ap_admin_session';
const SESSION_TTL_MS = 12 * 60 * 60 * 1000;

/**
 * Session signing secret. Admin sessions are only usable when a real secret is
 * configured. Prefer ADMIN_SESSION_SECRET so admin auth has its own dedicated
 * key that is completely separate from payment / API secrets. Falls closed —
 * no sessions can be created or verified.
 */
function signingSecret(): string {
  return process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_API_TOKEN || '';
}

export function signAdminSession(): string {
  const secret = signingSecret();
  if (!secret) {
    throw new Error('Admin sessions are not configured on the server.');
  }
  const payload = String(Date.now());
  const signature = createHmac('sha256', secret).update(payload).digest('base64url');
  return `${payload}.${signature}`;
}

export function verifyAdminSession(token: string | undefined | null): boolean {
  if (!token) return false;
  const secret = signingSecret();
  if (!secret) return false;
  const [payload, signature] = token.split('.');
  if (!payload || !signature) return false;
  const expected = createHmac('sha256', secret).update(payload).digest('base64url');
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return false;
  const issuedAt = Number(payload);
  if (!Number.isFinite(issuedAt)) return false;
  return Date.now() - issuedAt < SESSION_TTL_MS;
}

export const ADMIN_SESSION_MAX_AGE = Math.floor(SESSION_TTL_MS / 1000);
