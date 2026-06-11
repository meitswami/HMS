'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/lib/api';
import Link from 'next/link';
import { Building2, ClipboardCheck, FileSearch } from 'lucide-react';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({ hotels: 0, pending: 0, requests: 0 });

  useEffect(() => {
    Promise.all([
      api.getAllHotelsAdmin().catch(() => ({ data: [] })),
      api.getPendingHotels().catch(() => ({ data: [] })),
      api.getDataRequests('pending').catch(() => ({ data: [] })),
    ]).then(([hotels, pending, requests]) => {
      setStats({
        hotels: hotels.data.length,
        pending: pending.data.length,
        requests: requests.data.length,
      });
    });
  }, []);

  const cards = [
    { label: 'Total Hotels', value: stats.hotels, icon: Building2, href: '/admin/hotels', color: 'text-violet-400' },
    { label: 'Pending Approvals', value: stats.pending, icon: ClipboardCheck, href: '/admin/hotels/pending', color: 'text-amber-400' },
    { label: 'Data Requests', value: stats.requests, icon: FileSearch, href: '/admin/data-requests', color: 'text-blue-400' },
  ];

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-white mb-2">Admin Overview</h1>
      <p className="text-slate-400 mb-8">Manage hotels, approvals, and police data access</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map((c) => (
          <Link key={c.href} href={c.href}>
            <Card className="hover:border-violet-500/40 transition-colors cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm text-slate-400">{c.label}</CardTitle>
                <c.icon className={`w-5 h-5 ${c.color}`} />
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-white">{c.value}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
