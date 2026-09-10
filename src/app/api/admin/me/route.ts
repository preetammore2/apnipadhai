import { NextRequest, NextResponse } from 'next/server';
import { getRequestAdminRole } from '@/lib/auth';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const role = getRequestAdminRole(request);
  return NextResponse.json(
    { authed: role !== null, role },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}