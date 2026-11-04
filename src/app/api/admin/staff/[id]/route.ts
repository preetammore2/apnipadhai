import { NextRequest, NextResponse } from 'next/server';
import { deleteRole, deleteStaff, saveRole, updateStaff } from '@/lib/db-admin-staff';
import { ownerGuard, runStaffChange } from '@/lib/admin-staff-route';
import { readJsonBody } from '@/lib/request-security';

export const runtime = 'nodejs';

function validId(id: string): boolean {
  return /^[A-Za-z0-9_-]{1,64}$/.test(id);
}

/**
 * Owner only. `?kind=role` targets a role; otherwise a staff login.
 * Staff: { name?, roleId?, active?, password? } — a new password or disabling
 * the login ends that person's existing sessions.
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const blocked = await ownerGuard(request, true);
  if (blocked) return blocked;
  const { id } = await params;
  if (!validId(id)) {
    return NextResponse.json({ success: false, message: 'Invalid ID' }, { status: 400 });
  }
  const body = await readJsonBody<Record<string, unknown>>(request, 8 * 1024);
  if (!body) {
    return NextResponse.json({ success: false, message: 'Invalid request body' }, { status: 400 });
  }

  if (request.nextUrl.searchParams.get('kind') === 'role') {
    return runStaffChange(
      async () => ({ role: await saveRole(id, { name: body.name, permissions: body.permissions }) }),
      'update the role',
    );
  }
  return runStaffChange(
    async () => ({
      staff: await updateStaff(id, {
        name: body.name,
        roleId: body.roleId,
        active: body.active,
        password: body.password,
      }),
    }),
    'update the staff login',
  );
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const blocked = await ownerGuard(request, true);
  if (blocked) return blocked;
  const { id } = await params;
  if (!validId(id)) {
    return NextResponse.json({ success: false, message: 'Invalid ID' }, { status: 400 });
  }
  if (request.nextUrl.searchParams.get('kind') === 'role') {
    return runStaffChange(async () => {
      await deleteRole(id);
      return {};
    }, 'delete the role');
  }
  return runStaffChange(async () => {
    await deleteStaff(id);
    return {};
  }, 'delete the staff login');
}
