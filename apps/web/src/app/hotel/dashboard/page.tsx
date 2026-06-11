'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Users, ScanLine, Building2, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { getStoredUser } from '@/lib/auth';

export default function HotelDashboardPage() {
  const user = getStoredUser();
  const [guestCount, setGuestCount] = useState(0);

  useEffect(() => {
    api.getGuests({ status: 'checked_in' })
      .then((res) => setGuestCount(res.meta?.total ?? res.data.length))
      .catch(() => {});
  }, []);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">
          Welcome{user?.firstName ? `, ${user.firstName}` : ''}
        </h1>
        <p className="text-slate-400 mt-1">Your digital visitor register dashboard</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="border-amber-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-400">Active Guests</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-amber-400">{guestCount}</p>
          </CardContent>
        </Card>
        <Card className="border-amber-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-400">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/hotel/guests/register">
              <Button className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-slate-900 font-semibold">
                <Plus className="w-4 h-4 mr-2" /> New Check-in
              </Button>
            </Link>
          </CardContent>
        </Card>
        <Card className="border-amber-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-400">Tools</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-2">
            <Link href="/hotel/ocr" className="flex-1">
              <Button variant="outline" className="w-full border-amber-500/30 text-amber-300">
                <ScanLine className="w-4 h-4 mr-2" /> OCR
              </Button>
            </Link>
            <Link href="/hotel/profile" className="flex-1">
              <Button variant="outline" className="w-full border-amber-500/30 text-amber-300">
                <Building2 className="w-4 h-4 mr-2" /> Profile
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <Card className="border-amber-500/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-300/90">
            <Users className="w-5 h-5" />
            Guest Register
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-400 mb-4">
            Digitally record guest check-ins with identity documents. All records are securely stored and only shared with police upon approved request.
          </p>
          <Link href="/hotel/guests">
            <Button variant="outline" className="border-amber-500/30 text-amber-300">View All Guests</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
