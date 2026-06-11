'use client';

import Link from 'next/link';
import { Crown } from 'lucide-react';
import { LoginForm } from '@/components/auth/login-form';
import { PortalType } from '@hms/shared';

export default function SuperAdminLoginPage() {
  return (
    <div className="min-h-screen admin-bg flex flex-col items-center justify-center p-4">
      <LoginForm
        portal={PortalType.SUPER_ADMIN}
        theme="admin"
        title="Super Admin"
        subtitle="System control, RBAC &amp; tenant management"
        defaultEmail="admin@hms.gov.in"
        icon={
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-600 to-pink-600 flex items-center justify-center">
            <Crown className="w-9 h-9 text-white" />
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
