import { createHmac, randomBytes, scryptSync, timingSafeEqual } from 'crypto';
import { COLLECTIONS, getDb } from '@/lib/db';
import { adminSecret } from '@/lib/admin-auth';
import { isAdminPermission, type AdminPermission } from '@/lib/admin-permissions';

/**
 * Roles and staff logins created by the owner in /admin/staff. Server-only.
 *
 * Staff log in with a password alone, so each password is stored twice:
 * - `lookupKey`: HMAC of the password with the server's admin secret. Finds the
 *   staff member in one query and keeps passwords unique. Useless without the
 *   server secret.
 * - `passwordHash`: salted scrypt hash, checked before a login is accepted.
 */

export interface AdminRoleRecord {
  id: string;
  name: string;
  permissions: AdminPermission[];
}

export interface StaffRecord {
  id: string;
  name: string;
  roleId: string;
  active: boolean;
  /** Bumped on password reset / disable so existing sessions stop working. */
  sessionVersion: number;
}

interface StaffDoc extends Omit<StaffRecord, 'id'> {
  lookupKey: string;
  passwordHash: string;
  passwordSalt: string;
}

export const MIN_PASSWORD_LENGTH = 8;

export class StaffError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

/* ───────── Passwords ───────── */

function lookupKeyFor(password: string): string {
  const secret = adminSecret();
  if (!secret) throw new StaffError(500, 'Admin sessions are not configured on the server.');
  return createHmac('sha256', secret).update(`staff-password:${password}`).digest('hex');
}

function hashPassword(password: string, salt: string): string {
  return scryptSync(password, salt, 32).toString('hex');
}

function tokenEquals(a: string, b: string | undefined): boolean {
  if (!b) return false;
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

async function assertUsablePassword(password: string, exceptStaffId?: string): Promise<string> {
  if (password.length < MIN_PASSWORD_LENGTH || password.length > 128) {
    throw new StaffError(400, `Password must be ${MIN_PASSWORD_LENGTH}–128 characters`);
  }
  if (
    tokenEquals(password, process.env.ADMIN_API_TOKEN) ||
    tokenEquals(password, process.env.MODERATOR_API_TOKEN)
  ) {
    throw new StaffError(400, 'This password is already in use — choose another one');
  }
  const lookupKey = lookupKeyFor(password);
  const clash = await getDb()
    .collection(COLLECTIONS.adminStaff)
    .where('lookupKey', '==', lookupKey)
    .limit(1)
    .get();
  if (!clash.empty && clash.docs[0].id !== exceptStaffId) {
    // Passwords identify the person, so they must be unique.
    throw new StaffError(400, 'This password is already in use — choose another one');
  }
  return lookupKey;
}

function passwordFields(password: string, lookupKey: string) {
  const passwordSalt = randomBytes(16).toString('hex');
  return { lookupKey, passwordSalt, passwordHash: hashPassword(password, passwordSalt) };
}

/** Find the active staff member this password belongs to, or null. */
export async function findStaffByPassword(password: string): Promise<StaffRecord | null> {
  if (!password || password.length > 128) return null;
  const snap = await getDb()
    .collection(COLLECTIONS.adminStaff)
    .where('lookupKey', '==', lookupKeyFor(password))
    .limit(1)
    .get();
  if (snap.empty) return null;
  const doc = snap.docs[0];
  const data = doc.data() as StaffDoc;
  const expected = Buffer.from(data.passwordHash ?? '', 'hex');
  const actual = Buffer.from(hashPassword(password, data.passwordSalt ?? ''), 'hex');
  if (expected.length === 0 || expected.length !== actual.length || !timingSafeEqual(expected, actual)) {
    return null;
  }
  if (!data.active) return null;
  return toStaff(doc.id, data);
}

/* ───────── Roles ───────── */

function cleanPermissions(value: unknown): AdminPermission[] {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.filter(isAdminPermission))];
}

function cleanName(value: unknown, what: string): string {
  const name = typeof value === 'string' ? value.trim().slice(0, 60) : '';
  if (!name) throw new StaffError(400, `${what} name is required`);
  return name;
}

export async function listRoles(): Promise<AdminRoleRecord[]> {
  const snap = await getDb().collection(COLLECTIONS.adminRoles).get();
  return snap.docs
    .map((doc) => ({
      id: doc.id,
      name: String(doc.data().name ?? ''),
      permissions: cleanPermissions(doc.data().permissions),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function getRole(id: string): Promise<AdminRoleRecord | null> {
  const doc = await getDb().collection(COLLECTIONS.adminRoles).doc(id).get();
  if (!doc.exists) return null;
  const data = doc.data() ?? {};
  return { id: doc.id, name: String(data.name ?? ''), permissions: cleanPermissions(data.permissions) };
}

export async function saveRole(
  id: string | null,
  input: { name: unknown; permissions: unknown },
): Promise<AdminRoleRecord> {
  const name = cleanName(input.name, 'Role');
  const permissions = cleanPermissions(input.permissions);
  if (permissions.length === 0) throw new StaffError(400, 'Choose at least one permission');
  const collection = getDb().collection(COLLECTIONS.adminRoles);
  const ref = id ? collection.doc(id) : collection.doc();
  if (id && !(await ref.get()).exists) throw new StaffError(404, 'Role not found');
  await ref.set({ name, permissions, updatedAt: new Date() }, { merge: true });
  return { id: ref.id, name, permissions };
}

export async function deleteRole(id: string): Promise<void> {
  const inUse = await getDb()
    .collection(COLLECTIONS.adminStaff)
    .where('roleId', '==', id)
    .limit(1)
    .get();
  if (!inUse.empty) {
    throw new StaffError(400, 'This role is still given to staff — change their role first');
  }
  await getDb().collection(COLLECTIONS.adminRoles).doc(id).delete();
}

/* ───────── Staff ───────── */

function toStaff(id: string, data: Partial<StaffDoc>): StaffRecord {
  return {
    id,
    name: String(data.name ?? ''),
    roleId: String(data.roleId ?? ''),
    active: data.active !== false,
    sessionVersion: Number(data.sessionVersion) || 0,
  };
}

export async function listStaff(): Promise<StaffRecord[]> {
  const snap = await getDb().collection(COLLECTIONS.adminStaff).get();
  return snap.docs
    .map((doc) => toStaff(doc.id, doc.data() as StaffDoc))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function getStaff(id: string): Promise<StaffRecord | null> {
  const doc = await getDb().collection(COLLECTIONS.adminStaff).doc(id).get();
  return doc.exists ? toStaff(doc.id, doc.data() as StaffDoc) : null;
}

async function assertRoleExists(roleId: unknown): Promise<string> {
  if (typeof roleId !== 'string' || !roleId || !(await getRole(roleId))) {
    throw new StaffError(400, 'Choose a role');
  }
  return roleId;
}

export async function createStaff(input: {
  name: unknown;
  roleId: unknown;
  password: unknown;
}): Promise<StaffRecord> {
  const name = cleanName(input.name, 'Staff');
  const roleId = await assertRoleExists(input.roleId);
  const password = typeof input.password === 'string' ? input.password : '';
  const lookupKey = await assertUsablePassword(password);
  const ref = getDb().collection(COLLECTIONS.adminStaff).doc();
  const doc: StaffDoc = {
    name,
    roleId,
    active: true,
    sessionVersion: 0,
    ...passwordFields(password, lookupKey),
  };
  await ref.set({ ...doc, createdAt: new Date() });
  return toStaff(ref.id, doc);
}

export async function updateStaff(
  id: string,
  input: { name?: unknown; roleId?: unknown; active?: unknown; password?: unknown },
): Promise<StaffRecord> {
  const ref = getDb().collection(COLLECTIONS.adminStaff).doc(id);
  const snap = await ref.get();
  if (!snap.exists) throw new StaffError(404, 'Staff login not found');
  const current = toStaff(id, snap.data() as StaffDoc);

  const changes: Record<string, unknown> = { updatedAt: new Date() };
  let endSessions = false;
  if (input.name !== undefined) changes.name = cleanName(input.name, 'Staff');
  if (input.roleId !== undefined) changes.roleId = await assertRoleExists(input.roleId);
  if (typeof input.active === 'boolean' && input.active !== current.active) {
    changes.active = input.active;
    endSessions = !input.active;
  }
  if (typeof input.password === 'string' && input.password) {
    const lookupKey = await assertUsablePassword(input.password, id);
    Object.assign(changes, passwordFields(input.password, lookupKey));
    endSessions = true;
  }
  if (endSessions) changes.sessionVersion = current.sessionVersion + 1;

  await ref.set(changes, { merge: true });
  return toStaff(id, { ...(snap.data() as StaffDoc), ...(changes as Partial<StaffDoc>) });
}

export async function deleteStaff(id: string): Promise<void> {
  await getDb().collection(COLLECTIONS.adminStaff).doc(id).delete();
}
