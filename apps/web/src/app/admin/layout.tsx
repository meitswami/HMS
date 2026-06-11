import { AdminSidebar } from '@/components/layout/admin-sidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen admin-bg">
      <AdminSidebar />
      <main className="ml-64 min-h-screen">{children}</main>
    </div>
  );
}
