'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminSettingsPage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-white mb-8">Admin Settings</h1>
      <Card className="border-violet-500/10">
        <CardHeader><CardTitle className="text-violet-300">System Configuration</CardTitle></CardHeader>
        <CardContent className="text-slate-400 space-y-2">
          <p>Tenant settings, notification channels, and approval workflows.</p>
        </CardContent>
      </Card>
    </div>
  );
}
