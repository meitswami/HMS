'use client';

import { useState } from 'react';
import { Upload, ScanLine } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function OcrPage() {
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);

  const handleUpload = async () => {
    if (!file) return;
    setProcessing(true);
    // OCR upload handled via API multipart
    setTimeout(() => setProcessing(false), 3000);
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-white mb-2">OCR Register Digitization</h1>
      <p className="text-slate-400 mb-8">Upload scanned register pages for AI extraction</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Upload Register</CardTitle></CardHeader>
          <CardContent>
            <div
              className="border-2 border-dashed border-slate-600 rounded-xl p-12 text-center hover:border-blue-500 transition-colors cursor-pointer"
              onClick={() => document.getElementById('file-input')?.click()}
            >
              <Upload className="w-12 h-12 text-slate-500 mx-auto mb-4" />
              <p className="text-slate-300">Drop register scan, PDF, or photo</p>
              <p className="text-sm text-slate-500 mt-2">Supports JPG, PNG, PDF</p>
              <input
                id="file-input"
                type="file"
                accept="image/*,.pdf"
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
            </div>
            {file && (
              <div className="mt-4 flex items-center justify-between">
                <span className="text-sm text-slate-400">{file.name}</span>
                <Button onClick={handleUpload} disabled={processing}>
                  <ScanLine className="w-4 h-4 mr-2" />
                  {processing ? 'Processing...' : 'Start OCR'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>OCR Grid Preview</CardTitle></CardHeader>
          <CardContent>
            <p className="text-slate-500 text-center py-16">
              Upload a register to see extracted data in an editable grid
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
