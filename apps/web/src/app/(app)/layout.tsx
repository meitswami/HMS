import { Sidebar } from '@/components/layout/sidebar';
import { AlertBanner } from '@/components/layout/alert-banner';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen cmd-bg">
      <AlertBanner />
      <Sidebar />
      <main className="ml-64 min-h-screen">
        {children}
      </main>
    </div>
  );
}
