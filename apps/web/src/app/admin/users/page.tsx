'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield } from 'lucide-react';

export default function AdminUsersPage() {
  const roles = [
    { slug: 'super_admin', name: 'Super Admin', level: 100, modules: 'All modules + RBAC' },
    { slug: 'police_command', name: 'Admin / Command', level: 90, modules: 'Hotels, approvals, data requests, analytics' },
    { slug: 'police_officer', name: 'Police Officer', level: 80, modules: 'Watchlist, data requests, approved guest data' },
    { slug: 'hotel_owner', name: 'Hotel Owner', level: 50, modules: 'Guest register, OCR, hotel profile' },
    { slug: 'hotel_manager', name: 'Hotel Manager', level: 40, modules: 'Guest register, OCR' },
    { slug: 'receptionist', name: 'Receptionist', level: 30, modules: 'Check-in / check-out only' },
  ];

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-white mb-2">Users &amp; RBAC</h1>
      <p className="text-slate-400 mb-8">Role-based access control for all portals</p>

      <Card className="border-violet-500/10 mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-violet-300">
            <Shield className="w-5 h-5" />
            System Roles
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700 text-slate-400">
                  <th className="text-left py-3 px-4">Role</th>
                  <th className="text-left py-3 px-4">Level</th>
                  <th className="text-left py-3 px-4">Module Access</th>
                </tr>
              </thead>
              <tbody>
                {roles.map((r) => (
                  <tr key={r.slug} className="border-b border-slate-800">
                    <td className="py-3 px-4 text-white font-medium">{r.name}</td>
                    <td className="py-3 px-4 text-slate-400">{r.level}</td>
                    <td className="py-3 px-4 text-slate-400">{r.modules}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-slate-500 mt-4">
            Super Admin can create users via API. Full RBAC module management coming soon.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
