import { NextRequest, NextResponse } from 'next/server';
import { clearStaffCache, isOwnerRequest } from '@/lib/auth';
import { isDbConfigured } from '@/lib/db';
import { StaffError } from '@/lib/db-admin-staff';
import { getClientIp, rateLimitResponse } from '@/lib/rate-limit';
import { denyIfCrossOrigin } from '@/lib/request-security';

/**
 * Shared guard for the owner-only staff/role routes. Returns an error response
 * to send, or null to continue.
 */
export async function ownerGuard(request: NextRequest, write: boolean): Promise<Response | null> {
  if (write) {
    const crossOrigin = denyIfCrossOrigin(request);
    if (crossOrigin) return crossOrigin;
  }
  if (!(await isOwnerRequest(request))) {
    return NextResponse.json(
      { success: false, message: 'Only the owner can manage staff and roles' },
      { status: 403 },
    );
  }
  if (!isDbConfigured()) {
    return NextResponse.json(
      { success: false, message: 'Firebase is not configured on the server' },
      { status: 503 },
    );
  }
  if (write) {
    return rateLimitResponse(request, {
      limit: 60,
      windowMs: 15 * 60 * 1000,
      key: `admin-staff-write:${getClientIp(request)}`,
    });
  }
  return null;
}

/** Run a staff/role change and turn StaffError into a JSON error. */
export async function runStaffChange<T>(
  fn: () => Promise<T>,
  label: string,
): Promise<Response> {
  try {
    const result = await fn();
    clearStaffCache();
    return NextResponse.json({ success: true, ...(result ?? {}) });
  } catch (error) {
    if (error instanceof StaffError) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.status });
    }
    console.error(`[api/admin/staff] ${label} error`, error);
    return NextResponse.json({ success: false, message: `Could not ${label}` }, { status: 502 });
  }
}
