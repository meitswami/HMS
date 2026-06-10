'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Download } from 'lucide-react';

export default function ReportsPage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-white mb-8">Reports & Exports</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {['Daily Register Report', 'FRRO Foreign National Report', 'Blacklist Match Report'].map((title) => (
          <Card key={title}>
            <CardHeader><CardTitle className="text-base">{title}</CardTitle></CardHeader>
            <CardContent className="flex gap-2">
              <Button variant="outline" size="sm"><Download className="w-4 h-4 mr-1" /> PDF</Button>
              <Button variant="outline" size="sm"><FileText className="w-4 h-4 mr-1" /> Excel</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
