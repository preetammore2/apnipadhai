import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ADMIN_SESSION_COOKIE, getAdminRole } from '@/lib/admin-auth';
import RoleGate from './RoleGate';

export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const session = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  const role = getAdminRole(session);
  if (!role) {
    redirect('/admin/login');
  }
  return <RoleGate role={role}>{children}</RoleGate>;
}