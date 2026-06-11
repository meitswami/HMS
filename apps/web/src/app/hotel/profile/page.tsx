'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/lib/api';

export default function HotelProfilePage() {
  const [hotels, setHotels] = useState<Array<Record<string, unknown>>>([]);

  useEffect(() => {
    api.getHotels().then((res) => setHotels(res.data)).catch(console.error);
  }, []);

  const hotel = hotels[0];

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-white mb-8">My Hotel</h1>
      {hotel ? (
        <Card className="border-amber-500/20 max-w-2xl">
          <CardHeader>
            <CardTitle className="text-amber-300">{hotel.name as string}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-slate-400">
            <p><span className="text-slate-500">Owner:</span> {hotel.ownerName as string}</p>
            <p><span className="text-slate-500">License:</span> {hotel.licenseNumber as string}</p>
            <p><span className="text-slate-500">City:</span> {hotel.city as string}</p>
            <p><span className="text-slate-500">Address:</span> {hotel.address as string}</p>
            <p><span className="text-slate-500">Contact:</span> {hotel.contactNumber as string}</p>
            <p><span className="text-slate-500">Email:</span> {hotel.email as string}</p>
            <p>
              <span className="text-slate-500">Status:</span>{' '}
              <span className={hotel.isOnline ? 'text-green-400' : 'text-slate-500'}>
                {hotel.isOnline ? 'Online' : 'Offline'}
              </span>
            </p>
          </CardContent>
        </Card>
      ) : (
        <p className="text-slate-500">No hotel profile linked to your account yet.</p>
      )}
    </div>
  );
}
