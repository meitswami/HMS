import Link from 'next/link';
import { Shield, Building2, UserCog, Crown, ArrowRight } from 'lucide-react';

const portals = [
  {
    href: '/login/hotel',
    title: 'Hotel Portal',
    description: 'Register guests, manage your property, and digitize your visitor register.',
    icon: Building2,
    accent: 'from-amber-500 to-orange-500',
    border: 'border-amber-500/30 hover:border-amber-400/50',
    bg: 'bg-amber-500/5',
  },
  {
    href: '/login/police',
    title: 'Police Command Centre',
    description: 'Intelligence dashboard, watchlist, incidents, and approved data access.',
    icon: Shield,
    accent: 'from-blue-500 to-cyan-500',
    border: 'border-blue-500/30 hover:border-blue-400/50',
    bg: 'bg-blue-500/5',
  },
  {
    href: '/login/admin',
    title: 'Admin Panel',
    description: 'Manage all hotels, approve registrations, and review data access requests.',
    icon: UserCog,
    accent: 'from-violet-500 to-purple-500',
    border: 'border-violet-500/30 hover:border-violet-400/50',
    bg: 'bg-violet-500/5',
  },
  {
    href: '/login/superadmin',
    title: 'Super Admin',
    description: 'Full system control, RBAC, tenants, and module permissions.',
    icon: Crown,
    accent: 'from-rose-500 to-pink-500',
    border: 'border-rose-500/30 hover:border-rose-400/50',
    bg: 'bg-rose-500/5',
  },
];

export default function PortalSelectorPage() {
  return (
    <div className="min-h-screen cmd-bg flex flex-col items-center justify-center p-6">
      <div className="text-center mb-12 max-w-2xl">
        <h1 className="text-4xl font-bold text-white mb-3">HMS e-Register</h1>
        <p className="text-slate-400 text-lg">
          Digital Hotel Visitor Register &amp; Intelligence Platform
        </p>
        <p className="text-slate-500 text-sm mt-2">Select your portal to continue</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-4xl w-full">
        {portals.map((portal) => (
          <Link
            key={portal.href}
            href={portal.href}
            className={`group p-6 rounded-2xl border ${portal.border} ${portal.bg} backdrop-blur-sm transition-all hover:scale-[1.02] hover:shadow-xl`}
          >
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${portal.accent} flex items-center justify-center shrink-0`}>
                <portal.icon className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-white group-hover:text-blue-300 transition-colors">
                  {portal.title}
                </h2>
                <p className="text-sm text-slate-400 mt-1 leading-relaxed">{portal.description}</p>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-600 group-hover:text-white group-hover:translate-x-1 transition-all shrink-0 mt-1" />
            </div>
          </Link>
        ))}
      </div>

      <p className="text-slate-500 text-sm mt-10">
        New hotel?{' '}
        <Link href="/register/hotel" className="text-amber-400 hover:text-amber-300 underline underline-offset-2">
          Register your property
        </Link>
      </p>
    </div>
  );
}
