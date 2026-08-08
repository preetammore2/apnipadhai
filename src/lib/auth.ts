import { NextRequest } from 'next/server';

export function hasAdminAccess(request: NextRequest): boolean {
  const token = process.env.ADMIN_API_TOKEN;
  if (!token) return true;
  const provided =
    request.headers.get('x-admin-token') ??
    (request.headers.get('authorization') ?? '').replace(/^Bearer\s+/i, '');
  return provided === token;
}
