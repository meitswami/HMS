'use client';

import { useState } from 'react';
import { Search, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/lib/api';

const EXAMPLES = [
  'Show all guests from Delhi in last 30 days',
  'Show all visitors with same mobile number',
  'Find all foreign nationals in Jaipur',
  'Show all blacklist matches this month',
];

export default function AiSearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const res = await api.aiSearch(query);
      setResults(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Sparkles className="w-8 h-8 text-blue-400" />
          AI Search
        </h1>
        <p className="text-slate-400 mt-1">Natural language guest intelligence search</p>
      </div>

      <Card className="mb-6">
        <CardContent className="py-4">
          <div className="flex gap-3">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Ask anything about guests, hotels, incidents..."
              className="flex-1 px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-blue-500 text-lg"
            />
            <Button onClick={handleSearch} disabled={loading} size="lg">
              <Search className="w-5 h-5 mr-2" />
              {loading ? 'Searching...' : 'Search'}
            </Button>
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            {EXAMPLES.map((ex) => (
              <button
                key={ex}
                onClick={() => { setQuery(ex); }}
                className="px-3 py-1.5 rounded-full text-xs bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
              >
                {ex}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {results && (
        <Card>
          <CardHeader>
            <CardTitle>
              Results ({results.count as number})
              <span className="text-sm font-normal text-slate-400 ml-3">
                {results.interpretation as string}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700 text-slate-400">
                    <th className="text-left py-3 px-4">Name</th>
                    <th className="text-left py-3 px-4">Mobile</th>
                    <th className="text-left py-3 px-4">City</th>
                    <th className="text-left py-3 px-4">Check-in</th>
                    <th className="text-left py-3 px-4">Risk</th>
                  </tr>
                </thead>
                <tbody>
                  {((results.results as Array<Record<string, unknown>>) || []).map((g) => (
                    <tr key={g.id as string} className="border-b border-slate-800">
                      <td className="py-3 px-4 text-white">{g.fullName as string}</td>
                      <td className="py-3 px-4 text-slate-400">{g.mobileNumber as string}</td>
                      <td className="py-3 px-4 text-slate-400">{g.city as string}</td>
                      <td className="py-3 px-4 text-slate-400">{g.checkInDate as string}</td>
                      <td className="py-3 px-4 text-slate-400">{g.riskLevel as string}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
