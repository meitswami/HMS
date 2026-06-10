import { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { formatNumber } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  trend?: string;
  color?: string;
}

export function StatCard({ title, value, icon: Icon, trend, color = 'text-blue-400' }: StatCardProps) {
  return (
    <Card className="hover:border-slate-600 transition-colors">
      <CardContent className="flex items-center gap-4 py-5">
        <div className={`p-3 rounded-lg bg-slate-800 ${color}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm text-slate-400">{title}</p>
          <p className="text-2xl font-bold text-white">{formatNumber(value)}</p>
          {trend && <p className="text-xs text-slate-500 mt-1">{trend}</p>}
        </div>
      </CardContent>
    </Card>
  );
}
