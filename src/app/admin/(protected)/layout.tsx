import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ADMIN_SESSION_COOKIE } from '@/lib/admin-auth';
import { resolveSessionPrincipal } from '@/lib/auth';
import { allowedAdminPaths } from '@/lib/admin-permissions';
import RoleGate from './RoleGate';

export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const session = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  const principal = await resolveSessionPrincipal(session);
  if (!principal) {
    redirect('/admin/login');
  }
  return (
    <RoleGate allowedPaths={allowedAdminPaths(principal.permissions, principal.isOwner)}>
      {children}
    </RoleGate>
  );
}
