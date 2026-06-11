'use client';

import Link from 'next/link';
import { UserCog } from 'lucide-react';
import { LoginForm } from '@/components/auth/login-form';
import { PortalType } from '@hms/shared';

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen admin-bg flex flex-col items-center justify-center p-4">
      <LoginForm
        portal={PortalType.ADMIN}
        theme="admin"
        title="Admin Panel"
        subtitle="Hotel management, approvals &amp; oversight"
        icon={
          <div className="w-16 h-16 rounded-2xl bg-violet-600 flex items-center justify-center">
            <UserCog className="w-9 h-9 text-white" />
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
