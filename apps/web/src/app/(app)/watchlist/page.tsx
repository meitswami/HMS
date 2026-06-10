'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield } from 'lucide-react';

export default function WatchlistPage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-white mb-8">Watchlist & Blacklist</h1>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-red-400" />
            Centralized Watchlist Database
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-400">
            Manage police records, absconders, wanted criminals, missing persons,
            terror watchlist, and state watchlist entries. Matches are performed
            automatically during guest registration.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
