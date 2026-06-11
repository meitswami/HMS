'use client';

import { Sidebar } from '@/components/layout/sidebar';
import { HotelSidebar } from '@/components/layout/hotel-sidebar';
import { AdminSidebar } from '@/components/layout/admin-sidebar';
import { AlertBanner } from '@/components/layout/alert-banner';
import { getStoredUser, isHotelRole, isAdminRole } from '@/lib/auth';
import { AuthGuard } from '@/components/auth/auth-guard';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const user = getStoredUser();
  const role = user?.role || '';

  let SidebarComponent = Sidebar;
  let bgClass = 'cmd-bg';
  let showAlert = true;

  if (isHotelRole(role)) {
    SidebarComponent = HotelSidebar;
    bgClass = 'hotel-bg';
    showAlert = false;
  } else if (isAdminRole(role) && role !== 'police_officer') {
    SidebarComponent = AdminSidebar;
    bgClass = 'admin-bg';
    showAlert = false;
  }

  return (
    <AuthGuard>
      <div className={`min-h-screen ${bgClass}`}>
        {showAlert && <AlertBanner />}
        <SidebarComponent />
        <main className="ml-64 min-h-screen">{children}</main>
      </div>
    </AuthGuard>
  );
}
