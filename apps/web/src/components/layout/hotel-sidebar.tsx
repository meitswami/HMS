'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Users, ScanLine, Building2, Settings, LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { clearSession } from '@/lib/auth';

const navItems = [
  { href: '/hotel/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/hotel/guests', label: 'Guest Register', icon: Users },
  { href: '/hotel/guests/register', label: 'Check-in Guest', icon: Users },
  { href: '/hotel/ocr', label: 'OCR Scan', icon: ScanLine },
  { href: '/hotel/profile', label: 'My Hotel', icon: Building2 },
  { href: '/hotel/settings', label: 'Settings', icon: Settings },
];

export function HotelSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-stone-950 border-r border-amber-900/20 flex flex-col h-screen fixed left-0 top-0">
      <div className="p-6 border-b border-amber-900/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
            <Building2 className="w-6 h-6 text-slate-900" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white leading-tight">Hotel Portal</h1>
            <p className="text-xs text-amber-400/80">Digital Register</p>
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
                  ? 'bg-amber-500/15 text-amber-300 border border-amber-500/25'
                  : 'text-slate-400 hover:text-white hover:bg-stone-800',
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-amber-900/20">
        <button
          onClick={() => { clearSession(); window.location.href = '/login/hotel'; }}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:text-red-400 hover:bg-stone-800 w-full transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </aside>
  );
}
