import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_SESSION_COOKIE, verifyAdminSession } from '@/lib/admin-auth';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  return NextResponse.json(
    {
      authed: verifyAdminSession(request.cookies.get(ADMIN_SESSION_COOKIE)?.value),
    },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}
