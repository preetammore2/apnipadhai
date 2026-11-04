'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  CheckCircle2,
  KeyRound,
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  Save,
  ShieldCheck,
  Trash2,
  UserPlus,
  X,
  XCircle,
} from 'lucide-react';
import LogoutButton from '@/app/admin/components/LogoutButton';
import { ADMIN_PERMISSIONS, permissionLabel, type AdminPermission } from '@/lib/admin-permissions';

interface Role {
  id: string;
  name: string;
  permissions: AdminPermission[];
}

interface Staff {
  id: string;
  name: string;
  roleId: string;
  active: boolean;
}

type Result = { ok: boolean; message: string } | null;

const EMPTY_ROLE = { name: '', permissions: [] as AdminPermission[] };
const EMPTY_STAFF = { name: '', roleId: '', password: '' };

/** 12-character password without look-alike characters (0/O, 1/l/I). */
function generatePassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  const bytes = new Uint32Array(12);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (n) => chars[n % chars.length]).join('');
}

function Notice({ result }: { result: Result }) {
  if (!result) return null;
  return (
    <div
      className={`mt-4 flex items-start gap-2 text-xs font-semibold rounded-xl px-4 py-3 ${
        result.ok
          ? 'bg-green-50 text-green-700 border border-green-100'
          : 'bg-red-50 text-red-600 border border-red-100'
      }`}
    >
      {result.ok ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <XCircle className="w-4 h-4 shrink-0" />}
      <span className="break-all">{result.message}</span>
    </div>
  );
}

export default function AdminStaffPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [roleForm, setRoleForm] = useState(EMPTY_ROLE);
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null);
  const [roleResult, setRoleResult] = useState<Result>(null);
  const [staffForm, setStaffForm] = useState(EMPTY_STAFF);
  const [staffResult, setStaffResult] = useState<Result>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/staff');
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.message || 'Failed to load staff');
        return;
      }
      setRoles(data.roles ?? []);
      setStaff(data.staff ?? []);
    } catch {
      setError('Could not load staff');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function call(url: string, method: string, body?: unknown) {
    const res = await fetch(url, {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json().catch(() => ({}));
    return { ok: res.ok && data.success, data };
  }

  /* ───────── Roles ───────── */

  async function saveRole() {
    setRoleResult(null);
    if (!roleForm.name.trim()) return setRoleResult({ ok: false, message: 'Enter a role name.' });
    if (roleForm.permissions.length === 0) {
      return setRoleResult({ ok: false, message: 'Tick at least one permission.' });
    }
    setBusy('role');
    const { ok, data } = editingRoleId
      ? await call(`/api/admin/staff/${editingRoleId}?kind=role`, 'PUT', roleForm)
      : await call('/api/admin/staff', 'POST', { kind: 'role', ...roleForm });
    setBusy(null);
    if (!ok) return setRoleResult({ ok: false, message: data.message || 'Could not save the role' });
    setRoleResult({
      ok: true,
      message: editingRoleId
        ? `Role "${data.role.name}" updated. Staff with this role get the new access within a minute.`
        : `Role "${data.role.name}" created.`,
    });
    setRoleForm(EMPTY_ROLE);
    setEditingRoleId(null);
    load();
  }

  async function removeRole(role: Role) {
    if (!window.confirm(`Delete the role "${role.name}"?`)) return;
    setBusy(`role-${role.id}`);
    const { ok, data } = await call(`/api/admin/staff/${role.id}?kind=role`, 'DELETE');
    setBusy(null);
    setRoleResult(ok ? { ok: true, message: `Role "${role.name}" deleted.` } : { ok: false, message: data.message || 'Could not delete the role' });
    if (ok) load();
  }

  function togglePermission(key: AdminPermission) {
    setRoleForm((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(key)
        ? prev.permissions.filter((p) => p !== key)
        : [...prev.permissions, key],
    }));
    setRoleResult(null);
  }

  /* ───────── Staff ───────── */

  async function createStaff() {
    setStaffResult(null);
    if (!staffForm.name.trim()) return setStaffResult({ ok: false, message: 'Enter the person’s name.' });
    if (!staffForm.roleId) return setStaffResult({ ok: false, message: 'Choose a role.' });
    if (staffForm.password.length < 8) {
      return setStaffResult({ ok: false, message: 'Password must be at least 8 characters.' });
    }
    setBusy('staff');
    const { ok, data } = await call('/api/admin/staff', 'POST', { kind: 'staff', ...staffForm });
    setBusy(null);
    if (!ok) return setStaffResult({ ok: false, message: data.message || 'Could not create the login' });
    setStaffResult({
      ok: true,
      message: `Login created for ${data.staff.name}. Their password is: ${staffForm.password} — share it with them now; it cannot be shown again.`,
    });
    setStaffForm(EMPTY_STAFF);
    load();
  }

  async function updateStaff(person: Staff, changes: Record<string, unknown>, success: string) {
    setStaffResult(null);
    setBusy(`staff-${person.id}`);
    const { ok, data } = await call(`/api/admin/staff/${person.id}`, 'PUT', changes);
    setBusy(null);
    setStaffResult(ok ? { ok: true, message: success } : { ok: false, message: data.message || 'Could not update the login' });
    if (ok) load();
  }

  async function resetPassword(person: Staff) {
    const password = generatePassword();
    if (!window.confirm(`Give ${person.name} a new password? Their current password stops working and they are logged out.`)) return;
    await updateStaff(
      person,
      { password },
      `New password for ${person.name}: ${password} — share it with them now; it cannot be shown again.`,
    );
  }

  async function removeStaff(person: Staff) {
    if (!window.confirm(`Delete the login for ${person.name}? They will no longer be able to sign in.`)) return;
    setBusy(`staff-${person.id}`);
    const { ok, data } = await call(`/api/admin/staff/${person.id}`, 'DELETE');
    setBusy(null);
    setStaffResult(ok ? { ok: true, message: `Login for ${person.name} deleted.` } : { ok: false, message: data.message || 'Could not delete the login' });
    if (ok) load();
  }

  const roleById = new Map(roles.map((r) => [r.id, r]));

  return (
    <main className="min-h-screen bg-slate-50 pb-16">
      <header className="bg-navy-900 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center transition-colors"
              aria-label="Back to dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-lg font-black font-heading leading-none">Staff &amp; Roles</h1>
              <p className="text-xs text-white/60 mt-1">Only the owner can see this page</p>
            </div>
          </div>
          <LogoutButton />
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <p className="flex-1 text-sm text-slate-500">
            1. Create a role and tick what it can do. 2. Create a login for each person with a role
            and a password. They sign in at /admin/login with just that password and only see
            their sections.
          </p>
          <button
            onClick={load}
            disabled={loading}
            className="p-2.5 border border-slate-200 bg-white text-slate-500 hover:text-navy-900 rounded-xl transition-colors disabled:opacity-60 self-start"
            aria-label="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {error && (
          <p className="text-sm font-semibold text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
            {error}
          </p>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20 text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : (
          <>
            {/* ───────── Roles ───────── */}
            <section className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sm:p-8">
              <h2 className="text-base font-black font-heading text-navy-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-brand-600" /> Roles
              </h2>

              <div className="mt-4 grid gap-3">
                {roles.length === 0 && (
                  <p className="text-xs font-bold text-slate-400">No roles yet — create one below.</p>
                )}
                {roles.map((role) => (
                  <div key={role.id} className="border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-navy-900">{role.name}</p>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {role.permissions.map((p) => (
                          <span key={p} className="text-[11px] font-bold bg-brand-50 text-brand-700 px-2 py-0.5 rounded-full">
                            {permissionLabel(p)}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 self-end sm:self-start">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingRoleId(role.id);
                          setRoleForm({ name: role.name, permissions: role.permissions });
                          setRoleResult(null);
                        }}
                        className="p-2 text-slate-400 hover:text-navy-900 hover:bg-slate-100 rounded-lg transition-colors"
                        aria-label={`Edit ${role.name}`}
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeRole(role)}
                        disabled={busy === `role-${role.id}`}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                        aria-label={`Delete ${role.name}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 border-t border-slate-100 pt-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-black text-navy-900">
                    {editingRoleId ? `Edit role` : 'New role'}
                  </h3>
                  {editingRoleId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingRoleId(null);
                        setRoleForm(EMPTY_ROLE);
                      }}
                      className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-navy-900"
                    >
                      <X className="w-4 h-4" /> Cancel edit
                    </button>
                  )}
                </div>
                <input
                  value={roleForm.name}
                  onChange={(e) => {
                    setRoleForm({ ...roleForm, name: e.target.value });
                    setRoleResult(null);
                  }}
                  placeholder="Role name, e.g. Content Editor"
                  className="input-field w-full"
                />
                <p className="text-xs font-bold text-navy-900 mt-4 mb-2">This role can:</p>
                <div className="grid sm:grid-cols-2 gap-2">
                  {ADMIN_PERMISSIONS.map((p) => (
                    <label
                      key={p.key}
                      className={`flex items-start gap-2.5 border rounded-xl px-3 py-2.5 cursor-pointer transition-colors ${
                        roleForm.permissions.includes(p.key) ? 'border-brand-500 bg-brand-50' : 'border-slate-200'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={roleForm.permissions.includes(p.key)}
                        onChange={() => togglePermission(p.key)}
                        className="mt-0.5 accent-emerald-600"
                      />
                      <span>
                        <span className="block text-xs font-bold text-navy-900">{p.label}</span>
                        <span className="block text-[11px] text-slate-500">{p.description}</span>
                      </span>
                    </label>
                  ))}
                </div>
                <Notice result={roleResult} />
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={saveRole}
                    disabled={busy === 'role'}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-yellow-400 hover:bg-yellow-500 disabled:opacity-60 text-navy-950 text-xs font-black rounded-xl transition-colors"
                  >
                    {busy === 'role' ? <Loader2 className="w-4 h-4 animate-spin" /> : editingRoleId ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    {editingRoleId ? 'Save Role' : 'Create Role'}
                  </button>
                </div>
              </div>
            </section>

            {/* ───────── Staff ───────── */}
            <section className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sm:p-8">
              <h2 className="text-base font-black font-heading text-navy-900 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-brand-600" /> Staff logins
              </h2>

              <div className="mt-4 grid gap-3">
                {staff.length === 0 && (
                  <p className="text-xs font-bold text-slate-400">No staff logins yet.</p>
                )}
                {staff.map((person) => {
                  const role = roleById.get(person.roleId);
                  const working = busy === `staff-${person.id}`;
                  return (
                    <div key={person.id} className="border border-slate-200 rounded-2xl p-4">
                      <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-black text-navy-900">{person.name}</span>
                            <span
                              className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                                person.active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                              }`}
                            >
                              {person.active ? 'Active' : 'Disabled'}
                            </span>
                          </div>
                          <p className="text-xs font-bold text-slate-500 mt-2">Can do:</p>
                          <div className="flex flex-wrap gap-1.5 mt-1">
                            {role ? (
                              role.permissions.map((p) => (
                                <span key={p} className="text-[11px] font-bold bg-brand-50 text-brand-700 px-2 py-0.5 rounded-full">
                                  {permissionLabel(p)}
                                </span>
                              ))
                            ) : (
                              <span className="text-[11px] font-bold text-red-600">Role missing — choose a new role</span>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <select
                            value={person.roleId}
                            disabled={working}
                            onChange={(e) =>
                              updateStaff(
                                person,
                                { roleId: e.target.value },
                                `${person.name} now has the role "${roleById.get(e.target.value)?.name ?? ''}".`,
                              )
                            }
                            className="input-field !py-1.5 text-xs"
                            aria-label={`Role for ${person.name}`}
                          >
                            {!role && <option value="">Choose role</option>}
                            {roles.map((r) => (
                              <option key={r.id} value={r.id}>
                                {r.name}
                              </option>
                            ))}
                          </select>
                          <button
                            type="button"
                            disabled={working}
                            onClick={() =>
                              updateStaff(
                                person,
                                { active: !person.active },
                                person.active
                                  ? `${person.name} is disabled and has been logged out.`
                                  : `${person.name} can sign in again.`,
                              )
                            }
                            className="px-3 py-1.5 text-xs font-bold border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50"
                          >
                            {person.active ? 'Disable' : 'Enable'}
                          </button>
                          <button
                            type="button"
                            disabled={working}
                            onClick={() => resetPassword(person)}
                            className="p-2 text-slate-400 hover:text-navy-900 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
                            aria-label={`New password for ${person.name}`}
                            title="Give a new password"
                          >
                            <KeyRound className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            disabled={working}
                            onClick={() => removeStaff(person)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                            aria-label={`Delete ${person.name}`}
                          >
                            {working ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 border-t border-slate-100 pt-5">
                <h3 className="text-sm font-black text-navy-900 mb-3">New staff login</h3>
                {roles.length === 0 ? (
                  <p className="text-xs text-slate-500">Create a role first.</p>
                ) : (
                  <div className="grid sm:grid-cols-3 gap-3">
                    <input
                      value={staffForm.name}
                      onChange={(e) => {
                        setStaffForm({ ...staffForm, name: e.target.value });
                        setStaffResult(null);
                      }}
                      placeholder="Name, e.g. Rahul"
                      className="input-field"
                    />
                    <select
                      value={staffForm.roleId}
                      onChange={(e) => {
                        setStaffForm({ ...staffForm, roleId: e.target.value });
                        setStaffResult(null);
                      }}
                      className="input-field"
                    >
                      <option value="">Choose role</option>
                      {roles.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name}
                        </option>
                      ))}
                    </select>
                    <div className="flex gap-2">
                      <input
                        value={staffForm.password}
                        onChange={(e) => {
                          setStaffForm({ ...staffForm, password: e.target.value });
                          setStaffResult(null);
                        }}
                        placeholder="Password (min 8)"
                        autoComplete="new-password"
                        className="input-field flex-1 font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setStaffForm({ ...staffForm, password: generatePassword() })}
                        className="px-3 text-xs font-bold border border-slate-200 rounded-xl hover:bg-slate-50"
                      >
                        Generate
                      </button>
                    </div>
                  </div>
                )}
                {staffForm.roleId && roleById.get(staffForm.roleId) && (
                  <p className="text-[11px] text-slate-500 mt-2">
                    This person will be able to:{' '}
                    <strong>{roleById.get(staffForm.roleId)!.permissions.map(permissionLabel).join(', ')}</strong>
                  </p>
                )}
                <Notice result={staffResult} />
                {roles.length > 0 && (
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={createStaff}
                      disabled={busy === 'staff'}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-yellow-400 hover:bg-yellow-500 disabled:opacity-60 text-navy-950 text-xs font-black rounded-xl transition-colors"
                    >
                      {busy === 'staff' ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                      Create Login
                    </button>
                  </div>
                )}
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}
