'use client';

import { useEffect, useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/lib/api';
import { getRiskColor } from '@/lib/utils';
import Link from 'next/link';
import { getStoredUser, guestRegisterPath } from '@/lib/auth';

export default function GuestsPage() {
  const registerPath = guestRegisterPath(getStoredUser()?.role);
  const [guests, setGuests] = useState<Array<Record<string, unknown>>>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getGuests({ status: 'checked_in' })
      .then((res) => setGuests(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = guests.filter((g) =>
    (g.fullName as string)?.toLowerCase().includes(search.toLowerCase()) ||
    (g.mobileNumber as string)?.includes(search),
  );

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Digital Register</h1>
          <p className="text-slate-400 mt-1">Guest check-in records</p>
        </div>
        <Link href={registerPath}>
          <Button><Plus className="w-4 h-4 mr-2" /> New Check-in</Button>
        </Link>
      </div>

      <Card className="mb-6">
        <CardContent className="py-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name or mobile..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-blue-500"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Active Guests ({filtered.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center py-8 text-slate-500">Loading...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700 text-slate-400">
                    <th className="text-left py-3 px-4">Name</th>
                    <th className="text-left py-3 px-4">Mobile</th>
                    <th className="text-left py-3 px-4">Room</th>
                    <th className="text-left py-3 px-4">Check-in</th>
                    <th className="text-left py-3 px-4">Nationality</th>
                    <th className="text-left py-3 px-4">Aadhaar</th>
                    <th className="text-left py-3 px-4">Risk</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((g) => (
                    <tr key={g.id as string} className="border-b border-slate-800 hover:bg-slate-800/50">
                      <td className="py-3 px-4 text-white font-medium">{g.fullName as string}</td>
                      <td className="py-3 px-4 text-slate-400">{g.mobileNumber as string}</td>
                      <td className="py-3 px-4 text-slate-400">{g.roomNumber as string}</td>
                      <td className="py-3 px-4 text-slate-400">{g.checkInDate as string}</td>
                      <td className="py-3 px-4 text-slate-400">{g.nationality as string}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded text-xs ${
                          g.aadhaarVerified === 'verified' ? 'bg-green-500/20 text-green-400' :
                          g.aadhaarVerified === 'partial' ? 'bg-yellow-500/20 text-yellow-400' :
                          g.aadhaarVerified === 'mismatch' ? 'bg-red-500/20 text-red-400' :
                          'bg-slate-700 text-slate-400'
                        }`}>
                          {(g.aadhaarVerified as string)?.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getRiskColor(g.riskLevel as string)}`}>
                          {g.riskLevel as string} ({g.riskScore as number})
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
