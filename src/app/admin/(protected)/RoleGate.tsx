'use client';

import { useEffect, useMemo } from 'react';
import { usePathname, useRouter } from 'next/navigation';

/**
 * Staff may only open the admin sections their role allows (plus the
 * dashboard). Any other admin route redirects back to /admin. Server-side, the
 * admin APIs check the same permissions regardless — this gate is a UX
 * safeguard so people never see screens they cannot use.
 */
export default function RoleGate({
  allowedPaths,
  children,
}: {
  allowedPaths: string[];
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const allowed = useMemo(
    () =>
      pathname === '/admin' ||
      allowedPaths.some((root) => root !== '/admin' && (pathname === root || pathname.startsWith(`${root}/`))),
    [allowedPaths, pathname],
  );

  useEffect(() => {
    if (!allowed) router.replace('/admin');
  }, [allowed, router]);

  if (!allowed) return null;
  return <>{children}</>;
}
