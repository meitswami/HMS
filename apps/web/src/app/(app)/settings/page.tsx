'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function SettingsPage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-white mb-8">Settings</h1>
      <Card>
        <CardHeader><CardTitle>System Configuration</CardTitle></CardHeader>
        <CardContent className="space-y-4 text-slate-400">
          <p>MFA, notification channels, IP whitelisting, and tenant settings.</p>
        </CardContent>
      </Card>
    </div>
  );
}
