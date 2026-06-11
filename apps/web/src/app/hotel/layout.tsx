import { HotelSidebar } from '@/components/layout/hotel-sidebar';

export default function HotelLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen hotel-bg">
      <HotelSidebar />
      <main className="ml-64 min-h-screen">{children}</main>
    </div>
  );
}
