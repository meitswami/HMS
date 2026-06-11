'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Building2, ClipboardCheck, FileSearch, Users, Settings, LogOut, Shield,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { clearSession } from '@/lib/auth';

const navItems = [
  { href: '/admin/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/admin/hotels', label: 'All Hotels', icon: Building2 },
  { href: '/admin/hotels/pending', label: 'Pending Approvals', icon: ClipboardCheck },
  { href: '/admin/data-requests', label: 'Data Requests', icon: FileSearch },
  { href: '/admin/users', label: 'Users & RBAC', icon: Users },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-slate-950 border-r border-violet-900/30 flex flex-col h-screen fixed left-0 top-0">
      <div className="p-6 border-b border-violet-900/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-violet-600 flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white leading-tight">HMS Admin</h1>
            <p className="text-xs text-violet-400">Management Panel</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors',
                active
                  ? 'bg-violet-600/20 text-violet-300 border border-violet-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800',
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-violet-900/30">
        <button
          onClick={() => { clearSession(); window.location.href = '/'; }}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:text-red-400 hover:bg-slate-800 w-full transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </aside>
  );
}
