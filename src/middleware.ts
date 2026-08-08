import { NextRequest, NextResponse } from 'next/server';

const ALLOWED_ORIGINS = (process.env.CORS_ALLOWED_ORIGINS ?? '')
  .split(',')
  .map((origin) => origin.trim().replace(/\/+$/, ''))
  .filter(Boolean);

function originAllowed(origin: string | null): boolean {
  if (!origin) return true;
  if (ALLOWED_ORIGINS.length === 0 || ALLOWED_ORIGINS.includes('*')) return true;
  return ALLOWED_ORIGINS.some((allowed) => {
    if (allowed === origin) return true;
    const pattern = allowed
      .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      .replace(/\*/g, '.*');
    return new RegExp(`^${pattern}$`).test(origin);
  });
}

function corsHeaders(request: NextRequest): Headers {
  const origin = request.headers.get('origin');
  const headers = new Headers();
  const allowOrigin = origin && originAllowed(origin) ? origin : '*';
  headers.set('Access-Control-Allow-Origin', allowOrigin);
  if (allowOrigin !== '*') {
    headers.set('Vary', 'Origin');
  }
  headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  headers.set('Access-Control-Max-Age', '86400');
  return headers;
}

export function middleware(request: NextRequest) {
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 204,
      headers: corsHeaders(request),
    });
  }

  const response = NextResponse.next();
  corsHeaders(request).forEach((value, key) => {
    response.headers.set(key, value);
  });
  return response;
}

export const config = {
  matcher: ['/api/:path*'],
};
