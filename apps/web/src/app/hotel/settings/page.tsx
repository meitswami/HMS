'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function HotelSettingsPage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-white mb-8">Settings</h1>
      <Card className="border-amber-500/20">
        <CardHeader><CardTitle className="text-amber-300/90">Hotel Preferences</CardTitle></CardHeader>
        <CardContent className="text-slate-400 space-y-2">
          <p>Notification preferences, staff accounts, and branch settings.</p>
          <p className="text-sm text-slate-500">Contact your administrator to add staff users.</p>
        </CardContent>
      </Card>
    </div>
  );
}
