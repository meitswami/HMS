'use client';

import { useEffect, useState } from 'react';
import { Plus, Search, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';

export default function DataRequestsPage() {
  const [requests, setRequests] = useState<Array<Record<string, unknown>>>([]);
  const [hotels, setHotels] = useState<Array<Record<string, unknown>>>([]);
  const [showForm, setShowForm] = useState(false);
  const [hotelSearch, setHotelSearch] = useState('');
  const [selectedHotels, setSelectedHotels] = useState<string[]>([]);
  const [form, setForm] = useState({ dateFrom: '', dateTo: '', timeFrom: '', timeTo: '', reason: '' });
  const [viewData, setViewData] = useState<{ request: Record<string, unknown>; guests: Array<Record<string, unknown>> } | null>(null);
  const [loading, setLoading] = useState(false);

  const load = () => {
    api.getMyDataRequests().then((res) => setRequests(res.data)).catch(console.error);
  };

  useEffect(() => {
    load();
    api.getHotels().then((res) => setHotels(res.data)).catch(console.error);
  }, []);

  const filteredHotels = hotels.filter((h) =>
    (h.name as string)?.toLowerCase().includes(hotelSearch.toLowerCase()) ||
    (h.city as string)?.toLowerCase().includes(hotelSearch.toLowerCase()),
  );

  const toggleHotel = (id: string) => {
    setSelectedHotels((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const submitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedHotels.length) return alert('Select at least one hotel');
    setLoading(true);
    try {
      await api.createDataRequest({ ...form, hotelIds: selectedHotels });
      setShowForm(false);
      setSelectedHotels([]);
      setForm({ dateFrom: '', dateTo: '', timeFrom: '', timeTo: '', reason: '' });
      load();
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const fetchData = async (id: string) => {
    try {
      const data = await api.getRequestData(id);
      setViewData(data);
    } catch (err) {
      alert((err as Error).message);
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Data Access Requests</h1>
          <p className="text-slate-400 mt-1">Request hotel guest data for specific date/time ranges</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4 mr-2" /> New Request
        </Button>
      </div>

      {showForm && (
        <Card className="mb-6 border-blue-500/20">
          <CardHeader><CardTitle>New Data Request</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={submitRequest} className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-2">Select Hotels</label>
                <div className="relative mb-2">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    value={hotelSearch}
                    onChange={(e) => setHotelSearch(e.target.value)}
                    placeholder="Search hotels by name or city..."
                    className="w-full pl-9 pr-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm"
                  />
                </div>
                <div className="max-h-40 overflow-y-auto border border-slate-700 rounded-lg p-2 space-y-1">
                  {filteredHotels.map((h) => (
                    <label key={h.id as string} className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-slate-800 cursor-pointer text-sm">
                      <input
                        type="checkbox"
                        checked={selectedHotels.includes(h.id as string)}
                        onChange={() => toggleHotel(h.id as string)}
                      />
                      <span className="text-white">{h.name as string}</span>
                      <span className="text-slate-500">{h.city as string}</span>
                    </label>
                  ))}
                  {filteredHotels.length === 0 && <p className="text-slate-500 text-sm p-2">No hotels match</p>}
                </div>
                {selectedHotels.length > 0 && (
                  <p className="text-xs text-blue-400 mt-1">{selectedHotels.length} hotel(s) selected</p>
                )}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Field label="Date From" value={form.dateFrom} onChange={(v) => setForm({ ...form, dateFrom: v })} type="date" required />
                <Field label="Date To" value={form.dateTo} onChange={(v) => setForm({ ...form, dateTo: v })} type="date" required />
                <Field label="Time From" value={form.timeFrom} onChange={(v) => setForm({ ...form, timeFrom: v })} type="time" />
                <Field label="Time To" value={form.timeTo} onChange={(v) => setForm({ ...form, timeTo: v })} type="time" />
              </div>

              <Field label="Reason for Request" value={form.reason} onChange={(v) => setForm({ ...form, reason: v })} required />

              <div className="flex gap-2">
                <Button type="submit" disabled={loading}>{loading ? 'Submitting...' : 'Submit Request'}</Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4 mb-8">
        {requests.map((r) => (
          <Card key={r.id as string}>
            <CardContent className="py-4 flex items-center justify-between">
              <div>
                <p className="text-white font-medium">
                  {(r.hotelIds as string[])?.length} hotel(s) · {r.dateFrom as string} to {r.dateTo as string}
                </p>
                <p className="text-sm text-slate-400 mt-1">{r.reason as string}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-2.5 py-1 rounded-full text-xs capitalize ${
                  r.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                  r.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                  'bg-amber-500/20 text-amber-400'
                }`}>
                  {r.status as string}
                </span>
                {r.status === 'approved' && (
                  <Button size="sm" variant="outline" onClick={() => fetchData(r.id as string)}>
                    <Download className="w-4 h-4 mr-1" /> View Data
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        {requests.length === 0 && <p className="text-slate-500 text-center py-8">No requests yet</p>}
      </div>

      {viewData && (
        <Card className="border-green-500/20">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-green-400">Approved Data ({viewData.guests.length} guests)</CardTitle>
            <Button size="sm" variant="outline" onClick={() => setViewData(null)}>Close</Button>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700 text-slate-400">
                    <th className="text-left py-2 px-3">Name</th>
                    <th className="text-left py-2 px-3">Mobile</th>
                    <th className="text-left py-2 px-3">Room</th>
                    <th className="text-left py-2 px-3">Check-in</th>
                    <th className="text-left py-2 px-3">Nationality</th>
                  </tr>
                </thead>
                <tbody>
                  {viewData.guests.map((g) => (
                    <tr key={g.id as string} className="border-b border-slate-800">
                      <td className="py-2 px-3 text-white">{g.fullName as string}</td>
                      <td className="py-2 px-3 text-slate-400">{g.mobileNumber as string}</td>
                      <td className="py-2 px-3 text-slate-400">{g.roomNumber as string}</td>
                      <td className="py-2 px-3 text-slate-400">{g.checkInDate as string}</td>
                      <td className="py-2 px-3 text-slate-400">{g.nationality as string}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function Field({ label, value, onChange, type = 'text', required }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm text-slate-400 mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm"
      />
    </div>
  );
}
