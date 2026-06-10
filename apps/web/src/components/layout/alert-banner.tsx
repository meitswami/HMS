'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { getSocket } from '@/lib/socket';

interface Alert {
  id: string;
  severity: string;
  title: string;
  hotelId?: string;
}

export function AlertBanner() {
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    const socket = getSocket('police_command');
    socket.on('alert:new', (data: Alert) => {
      setAlerts((prev) => [{ ...data, id: Date.now().toString() }, ...prev].slice(0, 5));
      if (data.severity === 'critical') {
        const audio = new Audio('/alert.mp3');
        audio.play().catch(() => {});
      }
    });
    return () => { socket.off('alert:new'); };
  }, []);

  if (!alerts.length) return null;

  const latest = alerts[0];
  const severityColors: Record<string, string> = {
    critical: 'bg-red-600 animate-pulse',
    high: 'bg-orange-600',
    medium: 'bg-yellow-600',
    low: 'bg-blue-600',
  };

  return (
    <div className={`${severityColors[latest.severity] || 'bg-red-600'} text-white px-6 py-3 flex items-center justify-between`}>
      <div className="flex items-center gap-3">
        <AlertTriangle className="w-5 h-5" />
        <span className="font-semibold uppercase text-sm">{latest.severity}</span>
        <span>{latest.title}</span>
      </div>
      <button onClick={() => setAlerts([])} className="hover:opacity-80">
        <X className="w-5 h-5" />
      </button>
    </div>
  );
}
