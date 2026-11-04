import { createHmac, timingSafeEqual } from 'crypto';

export const ADMIN_SESSION_COOKIE = 'ap_admin_session';
const SESSION_TTL_MS = 12 * 60 * 60 * 1000;

/**
 * Who a back-office session belongs to:
 * - owner      — logged in with ADMIN_API_TOKEN (all permissions, manages staff)
 * - moderator  — logged in with the legacy MODERATOR_API_TOKEN (book covers only)
 * - staff      — a staff login created by the owner; `version` changes when the
 *                password is reset or the login is disabled, ending old sessions
 */
export type SessionSubject =
  | { kind: 'owner' }
  | { kind: 'moderator' }
  | { kind: 'staff'; staffId: string; version: number };

/**
 * Secret for signing sessions and fingerprinting staff passwords. Prefer
 * ADMIN_SESSION_SECRET so admin auth has its own key, separate from payment /
 * API secrets. Falls closed — no sessions without a secret. Changing it logs
 * everyone out and invalidates staff passwords (the owner resets them).
 */
export function adminSecret(): string {
  return process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_API_TOKEN || '';
}

function encodeSubject(subject: SessionSubject): string {
  if (subject.kind === 'staff') return `staff.${subject.staffId}.${subject.version}`;
  // 'admin' is kept as the owner's label so sessions signed before staff
  // logins existed stay valid.
  return subject.kind === 'owner' ? 'admin' : 'moderator';
}

function decodeSubject(value: string): SessionSubject | null {
  if (value === 'admin') return { kind: 'owner' };
  if (value === 'moderator') return { kind: 'moderator' };
  const match = value.match(/^staff\.([A-Za-z0-9_-]{1,64})\.(\d{1,9})$/);
  if (match) return { kind: 'staff', staffId: match[1], version: Number(match[2]) };
  return null;
}

/** Sign a session token: `<subject>:<issuedAt>.<signature>`. */
export function signAdminSession(subject: SessionSubject): string {
  const secret = adminSecret();
  if (!secret) {
    throw new Error('Admin sessions are not configured on the server.');
  }
  const payload = `${encodeSubject(subject)}:${Date.now()}`;
  const signature = createHmac('sha256', secret).update(payload).digest('base64url');
  return `${payload}.${signature}`;
}

/** Verify a session token and return who it belongs to, or null when invalid/expired. */
export function getSessionSubject(token: string | undefined | null): SessionSubject | null {
  if (!token) return null;
  const secret = adminSecret();
  if (!secret) return null;
  const dot = token.lastIndexOf('.');
  if (dot <= 0) return null;
  const payload = token.slice(0, dot);
  const signature = token.slice(dot + 1);
  const expected = createHmac('sha256', secret).update(payload).digest('base64url');
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  const sep = payload.lastIndexOf(':');
  if (sep <= 0) return null;
  const issuedAt = Number(payload.slice(sep + 1));
  if (!Number.isFinite(issuedAt) || Date.now() - issuedAt >= SESSION_TTL_MS) return null;
  return decodeSubject(payload.slice(0, sep));
}

export const ADMIN_SESSION_MAX_AGE = Math.floor(SESSION_TTL_MS / 1000);
