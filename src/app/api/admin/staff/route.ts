import { NextRequest, NextResponse } from 'next/server';
import { createStaff, listRoles, listStaff, saveRole } from '@/lib/db-admin-staff';
import { ownerGuard, runStaffChange } from '@/lib/admin-staff-route';
import { readJsonBody } from '@/lib/request-security';

export const runtime = 'nodejs';

/** Owner only: all roles and staff logins (never password data). */
export async function GET(request: NextRequest) {
  const blocked = await ownerGuard(request, false);
  if (blocked) return blocked;
  try {
    const [roles, staff] = await Promise.all([listRoles(), listStaff()]);
    return NextResponse.json(
      { success: true, roles, staff },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch (error) {
    console.error('[api/admin/staff] list error', error);
    return NextResponse.json(
      { success: false, message: 'Failed to load staff from Firebase' },
      { status: 502 },
    );
  }
}

/** Owner only: create a role ({ kind: 'role' }) or a staff login ({ kind: 'staff' }). */
export async function POST(request: NextRequest) {
  const blocked = await ownerGuard(request, true);
  if (blocked) return blocked;

  const body = await readJsonBody<Record<string, unknown>>(request, 8 * 1024);
  if (!body) {
    return NextResponse.json({ success: false, message: 'Invalid request body' }, { status: 400 });
  }
  if (body.kind === 'role') {
    return runStaffChange(
      async () => ({ role: await saveRole(null, { name: body.name, permissions: body.permissions }) }),
      'create the role',
    );
  }
  return runStaffChange(
    async () => ({
      staff: await createStaff({ name: body.name, roleId: body.roleId, password: body.password }),
    }),
    'create the staff login',
  );
}
