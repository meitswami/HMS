'use client';

import Link from 'next/link';
import { Building2, Sparkles } from 'lucide-react';
import { LoginForm } from '@/components/auth/login-form';
import { PortalType } from '@hms/shared';

export default function HotelLoginPage() {
  return (
    <div className="min-h-screen hotel-bg flex flex-col items-center justify-center p-4">
      <div className="absolute top-6 left-6 flex items-center gap-2 text-amber-400/80">
        <Sparkles className="w-4 h-4" />
        <span className="text-sm font-medium tracking-wide">Hospitality Portal</span>
      </div>

      <LoginForm
        portal={PortalType.HOTEL}
        theme="hotel"
        title="Welcome Back"
        subtitle="Sign in to manage your hotel register"
        icon={
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/25">
            <Building2 className="w-9 h-9 text-slate-900" />
          </div>
        }
        footer={
          <div className="space-y-2">
            <p className="text-slate-500">
              Don&apos;t have an account?{' '}
              <Link href="/register/hotel" className="text-amber-400 hover:text-amber-300 font-medium">
                Register your hotel
              </Link>
            </p>
            <Link href="/" className="text-slate-600 hover:text-slate-400 block">
              ← Back to portal selection
            </Link>
          </div>
        }
      />
    </div>
  );
}
