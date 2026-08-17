import { NextRequest, NextResponse } from 'next/server';

const CSRF_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

export const CSRF_EXEMPT_PATHS = [
  '/api/phonepe/callback',
  '/api/phonepe/webhook',
  '/api/payments/callback',
] as const;

export function getAllowedOrigins(): string[] {
  return (process.env.CORS_ALLOWED_ORIGINS ?? '')
    .split(',')
    .map((origin) => origin.trim().replace(/\/+$/, ''))
    .filter(Boolean)
    .filter((origin) => origin !== '*');
}

export function requestBaseUrl(headers: Headers): string {
  const proto = headers.get('x-forwarded-proto') ?? 'http';
  const host = headers.get('x-forwarded-host') ?? headers.get('host') ?? 'localhost:3000';
  return `${proto}://${host}`;
}

function matchesAllowlist(origin: string, allowed: string[]): boolean {
  return allowed.some((candidate) => {
    if (candidate === origin) return true;
    const pattern = candidate
      .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      .replace(/\*/g, '.*');
    return new RegExp(`^${pattern}$`).test(origin);
  });
}

export function isOriginAllowed(origin: string | null, headers: Headers): boolean {
  const normalizedOrigin = (origin ?? '').trim().replace(/\/+$/, '');
  if (!normalizedOrigin) return true;

  const self = requestBaseUrl(headers).replace(/\/+$/, '');
  if (normalizedOrigin === self) return true;

  return matchesAllowlist(normalizedOrigin, getAllowedOrigins());
}

export function isSameOriginOrAllowed(headers: Headers): boolean {
  return isOriginAllowed(headers.get('origin'), headers);
}

export function createCorsHeaders(request: NextRequest): Headers {
  const origin = (request.headers.get('origin') ?? '').trim().replace(/\/+$/, '');
  const self = requestBaseUrl(request.headers).replace(/\/+$/, '');
  const allowedOrigin = origin && origin !== self && isOriginAllowed(origin, request.headers)
    ? origin
    : self;

  const headers = new Headers();
  headers.set('Access-Control-Allow-Origin', allowedOrigin);
  headers.set('Vary', 'Origin');
  headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  headers.set('Access-Control-Max-Age', '86400');
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('X-Frame-Options', 'DENY');
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  headers.set('X-XSS-Protection', '0');
  headers.set('Pragma', 'no-cache');
  headers.set('Content-Security-Policy', [
    "default-src 'self'",
    "script-src 'self' https://connect.facebook.net https://static.cloudflareinsights.com https://assets.adobedtm.com https://www.googletagmanager.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    "img-src 'self' data: https:",
    "connect-src 'self' https://dpm.demdex.net https://aubank.tt.omtrdc.net",
    "frame-ancestors 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; '));
  return headers;
}

export function isCsrfBlocked(request: NextRequest): boolean {
  if (!CSRF_METHODS.has(request.method)) return false;

  const pathname = request.nextUrl.pathname;
  if (CSRF_EXEMPT_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`))) {
    return false;
  }

  const origin = (request.headers.get('origin') ?? '').trim().replace(/\/+$/, '');
  return Boolean(origin) && !isOriginAllowed(origin, request.headers);
}

export function forbiddenJson(): NextResponse {
  return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
}
