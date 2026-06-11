'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getStoredUser } from '@/lib/auth';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const user = getStoredUser();
    if (!token || !user) {
      router.replace(`/?redirect=${encodeURIComponent(pathname)}`);
      return;
    }
    setReady(true);
  }, [router, pathname]);

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-400">
        Loading...
      </div>
    );
  }

  return <>{children}</>;
}
