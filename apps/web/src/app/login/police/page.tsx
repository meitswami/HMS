'use client';

import Link from 'next/link';
import { Shield } from 'lucide-react';
import { LoginForm } from '@/components/auth/login-form';
import { PortalType } from '@hms/shared';

export default function PoliceLoginPage() {
  return (
    <div className="min-h-screen cmd-bg flex flex-col items-center justify-center p-4">
      <LoginForm
        portal={PortalType.POLICE}
        theme="police"
        title="Police Command Centre"
        subtitle="Intelligence Dashboard &amp; Data Access"
        defaultEmail=""
        icon={
          <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center">
            <Shield className="w-9 h-9 text-white" />
          </div>
        }
        footer={
          <Link href="/" className="text-slate-500 hover:text-slate-300">
            ← Back to portal selection
          </Link>
        }
      />
    </div>
  );
}
