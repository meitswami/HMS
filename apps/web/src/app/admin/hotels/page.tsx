'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';

export default function AdminHotelsPage() {
  const [hotels, setHotels] = useState<Array<Record<string, unknown>>>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api.getAllHotelsAdmin()
      .then((res) => setHotels(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const toggleActive = async (id: string, isActive: boolean) => {
    await api.updateHotel(id, { isActive: !isActive });
    load();
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-white mb-2">All Hotels</h1>
      <p className="text-slate-400 mb-8">Manage hotel status and details</p>

      {loading ? (
        <p className="text-slate-500">Loading...</p>
      ) : (
        <div className="space-y-4">
          {hotels.map((h) => (
            <Card key={h.id as string} className="border-violet-500/10">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-white">{h.name as string}</CardTitle>
                  <p className="text-sm text-slate-500 mt-1">{h.city as string} · License: {h.licenseNumber as string}</p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge label={h.registrationStatus as string || 'approved'} />
                  <StatusBadge label={h.isActive ? 'active' : 'closed'} color={h.isActive ? 'green' : 'red'} />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toggleActive(h.id as string, h.isActive as boolean)}
                    className="border-violet-500/30"
                  >
                    {h.isActive ? 'Close' : 'Activate'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="text-sm text-slate-400 grid grid-cols-2 md:grid-cols-4 gap-3">
                <p>Owner: {h.ownerName as string}</p>
                <p>Contact: {h.contactNumber as string}</p>
                <p>Email: {h.email as string}</p>
                <p>Rooms: {(h.totalRooms as number) || '—'}</p>
              </CardContent>
            </Card>
          ))}
          {hotels.length === 0 && <p className="text-slate-500 text-center py-12">No hotels found</p>}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ label, color }: { label: string; color?: string }) {
  const colors: Record<string, string> = {
    pending: 'bg-amber-500/20 text-amber-400',
    approved: 'bg-green-500/20 text-green-400',
    rejected: 'bg-red-500/20 text-red-400',
    active: 'bg-green-500/20 text-green-400',
    closed: 'bg-red-500/20 text-red-400',
    green: 'bg-green-500/20 text-green-400',
    red: 'bg-red-500/20 text-red-400',
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${colors[label] || colors[color || ''] || 'bg-slate-700 text-slate-400'}`}>
      {label}
    </span>
  );
}
