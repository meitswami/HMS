'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';

export default function PendingHotelsPage() {
  const [hotels, setHotels] = useState<Array<Record<string, unknown>>>([]);
  const [loading, setLoading] = useState(true);
  const [rejecting, setRejecting] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const load = () => {
    setLoading(true);
    api.getPendingHotels()
      .then((res) => setHotels(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const approve = async (id: string) => {
    await api.approveHotel(id);
    load();
  };

  const reject = async (id: string) => {
    if (!rejectReason.trim()) return alert('Please provide a rejection reason');
    await api.rejectHotel(id, rejectReason);
    setRejecting(null);
    setRejectReason('');
    load();
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-white mb-2">Pending Approvals</h1>
      <p className="text-slate-400 mb-8">Review and approve new hotel registrations</p>

      {loading ? (
        <p className="text-slate-500">Loading...</p>
      ) : hotels.length === 0 ? (
        <Card className="border-violet-500/10">
          <CardContent className="py-12 text-center text-slate-500">
            No pending registrations
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {hotels.map((h) => (
            <Card key={h.id as string} className="border-amber-500/20">
              <CardHeader>
                <CardTitle className="text-white">{h.name as string}</CardTitle>
                <p className="text-sm text-slate-500">{h.city as string} · Submitted {new Date(h.createdAt as string).toLocaleDateString()}</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-slate-400 mb-4">
                  <p><span className="text-slate-500">Owner:</span> {h.ownerName as string}</p>
                  <p><span className="text-slate-500">License:</span> {h.licenseNumber as string}</p>
                  <p><span className="text-slate-500">GST:</span> {(h.gstNumber as string) || '—'}</p>
                  <p><span className="text-slate-500">Contact:</span> {h.contactNumber as string}</p>
                  <p><span className="text-slate-500">Email:</span> {h.email as string}</p>
                  <p><span className="text-slate-500">Rooms:</span> {(h.totalRooms as number) || '—'}</p>
                  <p className="md:col-span-2"><span className="text-slate-500">Address:</span> {h.address as string}</p>
                </div>

                {rejecting === h.id ? (
                  <div className="flex gap-2 items-center">
                    <input
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      placeholder="Rejection reason..."
                      className="flex-1 px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm"
                    />
                    <Button size="sm" variant="outline" onClick={() => setRejecting(null)}>Cancel</Button>
                    <Button size="sm" className="bg-red-600 hover:bg-red-500" onClick={() => reject(h.id as string)}>Confirm Reject</Button>
                  </div>
                ) : (
                  <div className="flex gap-3">
                    <Button size="sm" className="bg-green-600 hover:bg-green-500" onClick={() => approve(h.id as string)}>
                      <CheckCircle className="w-4 h-4 mr-1" /> Approve
                    </Button>
                    <Button size="sm" variant="outline" className="border-red-500/30 text-red-400" onClick={() => setRejecting(h.id as string)}>
                      <XCircle className="w-4 h-4 mr-1" /> Reject
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
