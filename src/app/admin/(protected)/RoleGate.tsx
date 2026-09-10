'use client';

import { useEffect, useMemo } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import type { AdminRole } from '@/lib/admin-auth';

const MODERATOR_ALLOWED_ROOTS = ['/admin', '/admin/books'];

/**
 * Moderators may only reach the dashboard and the books area. Any other admin
 * route redirects them back to /admin. Admin users pass through untouched.
 * (Server-side, the admin APIs reject moderators regardless — this gate is a
 * UX safeguard so moderators never see other admin screens.)
 */
export default function RoleGate({
  role,
  children,
}: {
  role: AdminRole;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const allowed = useMemo(() => {
    if (role === 'admin') return true;
    return MODERATOR_ALLOWED_ROOTS.some(
      (root) => pathname === root || pathname.startsWith(`${root}/`),
    );
  }, [role, pathname]);

  useEffect(() => {
    if (!allowed) router.replace('/admin');
  }, [allowed, router]);

  if (!allowed) return null;
  return <>{children}</>;
}