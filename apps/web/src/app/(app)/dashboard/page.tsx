'use client';

import { useEffect, useState } from 'react';
import {
  Building2, Users, Globe, AlertTriangle, Activity, Shield, TrendingUp,
} from 'lucide-react';
import { StatCard } from '@/components/dashboard/stat-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/lib/api';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';

interface Stats {
  totalHotels: number;
  hotelsOnline: number;
  activeGuests: number;
  checkinsToday: number;
  foreignNationals: number;
  blacklistHits: number;
  openIncidents: number;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [districts, setDistricts] = useState<Array<Record<string, unknown>>>([]);
  const [incidents, setIncidents] = useState<Array<Record<string, unknown>>>([]);

  useEffect(() => {
    api.getDashboardStats().then(setStats).catch(console.error);
    api.getDistrictStats().then(setDistricts).catch(console.error);
    api.getRecentIncidents().then(setIncidents).catch(console.error);
  }, []);

  const districtChart = districts.map((d) => ({
    name: (d.district as string)?.substring(0, 12) || 'N/A',
    guests: Number(d.active_guests) || 0,
    hotels: Number(d.hotels) || 0,
  }));

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Police Command Centre</h1>
        <p className="text-slate-400 mt-1">Live State Monitoring Dashboard</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Hotels Online" value={stats?.hotelsOnline ?? 0} icon={Building2} color="text-green-400" trend={`of ${stats?.totalHotels ?? 0} total`} />
        <StatCard title="Active Guests" value={stats?.activeGuests ?? 0} icon={Users} color="text-blue-400" />
        <StatCard title="Check-ins Today" value={stats?.checkinsToday ?? 0} icon={TrendingUp} color="text-cyan-400" />
        <StatCard title="Foreign Nationals" value={stats?.foreignNationals ?? 0} icon={Globe} color="text-purple-400" />
        <StatCard title="Blacklist Hits" value={stats?.blacklistHits ?? 0} icon={Shield} color="text-red-400" />
        <StatCard title="Open Incidents" value={stats?.openIncidents ?? 0} icon={AlertTriangle} color="text-orange-400" />
        <StatCard title="System Status" value={1} icon={Activity} color="text-green-400" trend="All systems operational" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>District-wise Active Guests</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={districtChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} />
                <Bar dataKey="guests" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="hotels" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Guest Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Indian', value: (stats?.activeGuests ?? 0) - (stats?.foreignNationals ?? 0) },
                    { name: 'Foreign', value: stats?.foreignNationals ?? 0 },
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {COLORS.map((color, i) => (
                    <Cell key={i} fill={color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Incidents & Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700 text-slate-400">
                  <th className="text-left py-3 px-4">Severity</th>
                  <th className="text-left py-3 px-4">Title</th>
                  <th className="text-left py-3 px-4">Type</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-left py-3 px-4">Time</th>
                </tr>
              </thead>
              <tbody>
                {incidents.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-slate-500">No incidents recorded</td>
                  </tr>
                ) : (
                  incidents.map((inc) => (
                    <tr key={inc.id as string} className="border-b border-slate-800 hover:bg-slate-800/50">
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium uppercase ${
                          inc.severity === 'critical' ? 'bg-red-500/20 text-red-400' :
                          inc.severity === 'high' ? 'bg-orange-500/20 text-orange-400' :
                          'bg-yellow-500/20 text-yellow-400'
                        }`}>
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
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
