import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'HMS e-Register | Digital Hotel Visitor Register',
  description: 'AI-powered Hotel Visitor Intelligence Management System',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased min-h-screen">{children}</body>
    </html>
  );
}
