'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';

export default function AdminDataRequestsPage() {
  const [requests, setRequests] = useState<Array<Record<string, unknown>>>([]);
  const [filter, setFilter] = useState('pending');

  const load = () => {
    api.getDataRequests(filter || undefined)
      .then((res) => setRequests(res.data))
      .catch(console.error);
  };

  useEffect(() => { load(); }, [filter]);

  const review = async (id: string, action: 'approve' | 'reject') => {
    if (action === 'approve') await api.approveDataRequest(id);
    else await api.rejectDataRequest(id, 'Request denied');
    load();
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-white mb-2">Data Access Requests</h1>
      <p className="text-slate-400 mb-6">Review police requests for hotel guest data</p>

      <div className="flex gap-2 mb-6">
        {['pending', 'approved', 'rejected'].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-2 rounded-lg text-sm capitalize transition-colors ${
              filter === s ? 'bg-violet-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {requests.map((r) => (
          <Card key={r.id as string} className="border-violet-500/10">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base text-white">
                {(r.hotelIds as string[])?.length} hotel(s) · {r.dateFrom as string} to {r.dateTo as string}
              </CardTitle>
              <span className={`px-2.5 py-1 rounded-full text-xs capitalize ${
                r.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                r.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                'bg-amber-500/20 text-amber-400'
              }`}>
                {r.status as string}
              </span>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-400 mb-3">{r.reason as string}</p>
              {Boolean(r.timeFrom || r.timeTo) && (
                <p className="text-xs text-slate-500 mb-3">Time: {r.timeFrom as string} – {r.timeTo as string}</p>
              )}
              {r.status === 'pending' && (
                <div className="flex gap-2">
                  <Button size="sm" className="bg-green-600 hover:bg-green-500" onClick={() => review(r.id as string, 'approve')}>
                    <CheckCircle className="w-4 h-4 mr-1" /> Approve
                  </Button>
                  <Button size="sm" variant="outline" className="border-red-500/30 text-red-400" onClick={() => review(r.id as string, 'reject')}>
                    <XCircle className="w-4 h-4 mr-1" /> Reject
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
        {requests.length === 0 && <p className="text-slate-500 text-center py-12">No requests found</p>}
      </div>
    </div>
  );
}
