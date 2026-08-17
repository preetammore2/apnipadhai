import { NextRequest, NextResponse } from 'next/server';
import { createCorsHeaders, forbiddenJson, isCsrfBlocked } from '@/lib/cors';

export function middleware(request: NextRequest) {
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 204,
      headers: createCorsHeaders(request),
    });
  }

  if (isCsrfBlocked(request)) {
    return forbiddenJson();
  }

  const response = NextResponse.next();
  createCorsHeaders(request).forEach((value, key) => {
    response.headers.set(key, value);
  });
  return response;
}

export const config = {
  matcher: ['/api/:path*'],
};
