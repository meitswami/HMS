'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/lib/api';

export default function HotelsPage() {
  const [hotels, setHotels] = useState<Array<Record<string, unknown>>>([]);

  useEffect(() => {
    api.getHotels().then((res) => setHotels(res.data)).catch(console.error);
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-white mb-8">Hotel Management</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {hotels.map((h) => (
          <Card key={h.id as string}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {h.name as string}
                <span className={`w-2.5 h-2.5 rounded-full ${h.isOnline ? 'bg-green-400' : 'bg-slate-600'}`} />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-400">{h.city as string}</p>
              <p className="text-sm text-slate-500 mt-1">License: {h.licenseNumber as string}</p>
              <p className="text-sm text-slate-500">Contact: {h.contactNumber as string}</p>
            </CardContent>
          </Card>
        ))}
        {hotels.length === 0 && (
          <p className="text-slate-500 col-span-full text-center py-12">No hotels registered yet</p>
        )}
      </div>
    </div>
  );
}
