'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/lib/api';

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState<Array<Record<string, unknown>>>([]);

  useEffect(() => {
    api.getIncidents().then((res) => setIncidents(res.data)).catch(console.error);
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-white mb-8">Security Incidents</h1>
      <Card>
        <CardHeader><CardTitle>All Incidents</CardTitle></CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700 text-slate-400">
                <th className="text-left py-3 px-4">Severity</th>
                <th className="text-left py-3 px-4">Title</th>
                <th className="text-left py-3 px-4">Type</th>
                <th className="text-left py-3 px-4">Status</th>
                <th className="text-left py-3 px-4">Created</th>
              </tr>
            </thead>
            <tbody>
              {incidents.map((inc) => (
                <tr key={inc.id as string} className="border-b border-slate-800">
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 rounded text-xs uppercase bg-red-500/20 text-red-400">
                      {inc.severity as string}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-white">{inc.title as string}</td>
                  <td className="py-3 px-4 text-slate-400">{inc.incidentType as string}</td>
                  <td className="py-3 px-4 text-slate-400">{inc.status as string}</td>
                  <td className="py-3 px-4 text-slate-500">
                    {new Date(inc.createdAt as string).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
