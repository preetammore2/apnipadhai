import { NextRequest, NextResponse } from 'next/server';
import {
  getAllowedOrigins,
  isSameOriginOrAllowed,
  requestBaseUrl,
} from '@/lib/cors';

/**
 * Shared request-level security helpers for API routes.
 *
 * Single source of truth for origin allowlisting, JSON body size caps and
 * consistent 403/400 responses so every state-changing endpoint applies the
 * same rules (defense in depth on top of SameSite cookies and middleware).
 */

const DEFAULT_MAX_JSON_BYTES = 1024 * 1024; // 1 MB

/**
 * Allow a request when it carries no Origin header (non-browser clients,
 * PhonePe / WooCommerce server-to-server calls) or when the Origin is either
 * the app's own origin or explicitly allowlisted via CORS_ALLOWED_ORIGINS.
 */
export { getAllowedOrigins, isSameOriginOrAllowed, requestBaseUrl };

/**
 * Returns a 403 NextResponse when the request Origin is present and not
 * allowed, otherwise null. Call at the top of POST/PUT/DELETE handlers.
 */
export function denyIfCrossOrigin(request: NextRequest): NextResponse | null {
  if (isSameOriginOrAllowed(request.headers)) return null;
  return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
}

/**
 * Read and parse a JSON body with a hard size cap (guards against large-payload
 * abuse). Returns null for unparseable, oversized, or missing bodies.
 */
export async function readJsonBody<T>(request: NextRequest, maxBytes = DEFAULT_MAX_JSON_BYTES): Promise<T | null> {
  const declaredLength = Number(request.headers.get('content-length') ?? '0');
  if (declaredLength > maxBytes) return null;

  const text = await request.text().catch(() => '');
  if (!text || Buffer.byteLength(text, 'utf8') > maxBytes) return null;

  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

/** Mask a phone number for logs (keeps last 4 digits only). */
export function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 8) return '***';
  return `${digits.slice(0, -4).replace(/./g, '*')}${digits.slice(-4)}`;
}
