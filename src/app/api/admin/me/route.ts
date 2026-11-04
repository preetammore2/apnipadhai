import { NextRequest, NextResponse } from 'next/server';
import { getAdminPrincipal } from '@/lib/auth';
import type { AdminMe } from '@/lib/admin-permissions';

export const runtime = 'nodejs';

/** Who is signed in and which admin sections they may use. */
export async function GET(request: NextRequest) {
  const principal = await getAdminPrincipal(request);
  const me: AdminMe = principal
    ? { authed: true, name: principal.name, isOwner: principal.isOwner, permissions: principal.permissions }
    : { authed: false, name: '', isOwner: false, permissions: [] };
  return NextResponse.json(me, { headers: { 'Cache-Control': 'no-store' } });
}
