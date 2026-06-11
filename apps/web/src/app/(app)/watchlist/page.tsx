'use client';

import { useEffect, useState } from 'react';
import { Plus, Shield, Download, UserPlus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { formatAadharInput } from '@/lib/aadhar';

const SOURCE_TYPES = ['police', 'absconder', 'wanted', 'missing', 'terror', 'fraud', 'state', 'custom'] as const;

export default function WatchlistPage() {
  const [entries, setEntries] = useState<Array<Record<string, unknown>>>([]);
  const [tab, setTab] = useState<'list' | 'add' | 'import'>('list');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    source: 'police',
    fullName: '',
    fatherName: '',
    dateOfBirth: '',
    gender: '',
    nationality: 'Indian',
    mobileNumber: '',
    email: '',
    aadhaarNumber: '',
    passportNumber: '',
    drivingLicense: '',
    voterId: '',
    panNumber: '',
    crimeType: '',
    firNumber: '',
    policeStation: '',
    severity: 'medium',
    description: '',
  });
  const [importForm, setImportForm] = useState({ apiUrl: '', apiKey: '', defaultSource: 'custom' });

  const load = () => {
    api.getWatchlist().then((res) => setEntries(res.data)).catch(console.error);
  };

  useEffect(() => { load(); }, []);

  const update = (field: string, value: string) => setForm((p) => ({ ...p, [field]: value }));

  const submitEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.addWatchlistEntry(form);
      setTab('list');
      load();
      setForm({ ...form, fullName: '', fatherName: '', mobileNumber: '', aadhaarNumber: '', passportNumber: '', description: '' });
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const submitImport = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await api.importWatchlist(importForm);
      alert(`Imported ${result.imported} records`);
      setTab('list');
      load();
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Watchlist &amp; Blacklist</h1>
          <p className="text-slate-400 mt-1">Accused, suspects, absconders, wanted persons &amp; more</p>
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        {[
          { id: 'list', label: 'View Entries', icon: Shield },
          { id: 'add', label: 'Add Person', icon: UserPlus },
          { id: 'import', label: 'Import from API', icon: Download },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id as typeof tab)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors ${
              tab === t.id ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <t.icon className="w-4 h-4" /> {t.label}
          </button>
        ))}
      </div>

      {tab === 'add' && (
        <Card className="mb-6 border-blue-500/20">
          <CardHeader><CardTitle>Add Person to Watchlist</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={submitEntry} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Type *</label>
                  <select
                    value={form.source}
                    onChange={(e) => update('source', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm"
                  >
                    {SOURCE_TYPES.map((s) => (
                      <option key={s} value={s}>{s.replace('_', ' ')}</option>
                    ))}
                  </select>
                </div>
                <Field label="Full Name *" value={form.fullName} onChange={(v) => update('fullName', v)} required />
                <Field label="Father's Name" value={form.fatherName} onChange={(v) => update('fatherName', v)} />
                <Field label="Date of Birth" value={form.dateOfBirth} onChange={(v) => update('dateOfBirth', v)} type="date" />
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Gender</label>
                  <select value={form.gender} onChange={(e) => update('gender', e.target.value)} className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm">
                    <option value="">—</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <Field label="Nationality" value={form.nationality} onChange={(v) => update('nationality', v)} />
              </div>

              <div>
                <h3 className="text-sm font-medium text-slate-300 mb-3">Identity &amp; Contact</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Field label="Mobile" value={form.mobileNumber} onChange={(v) => update('mobileNumber', v)} />
                  <Field label="Email" value={form.email} onChange={(v) => update('email', v)} type="email" />
                  <Field
                    label="Aadhar Number"
                    value={form.aadhaarNumber}
                    onChange={(v) => update('aadhaarNumber', v)}
                    format={formatAadharInput}
                    inputMode="numeric"
                    placeholder="1234-5678-9012"
                  />
                  <Field label="Passport" value={form.passportNumber} onChange={(v) => update('passportNumber', v)} />
                  <Field label="Driving License" value={form.drivingLicense} onChange={(v) => update('drivingLicense', v)} />
                  <Field label="Voter ID" value={form.voterId} onChange={(v) => update('voterId', v)} />
                  <Field label="PAN" value={form.panNumber} onChange={(v) => update('panNumber', v)} />
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-slate-300 mb-3">Case Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Field label="Crime Type" value={form.crimeType} onChange={(v) => update('crimeType', v)} />
                  <Field label="FIR Number" value={form.firNumber} onChange={(v) => update('firNumber', v)} />
                  <Field label="Police Station" value={form.policeStation} onChange={(v) => update('policeStation', v)} />
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Severity</label>
                    <select value={form.severity} onChange={(e) => update('severity', e.target.value)} className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm">
                      <option value="critical">Critical</option>
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <Field label="Description / Notes" value={form.description} onChange={(v) => update('description', v)} />
                  </div>
                </div>
              </div>

              <Button type="submit" disabled={loading}>
                <Plus className="w-4 h-4 mr-2" /> {loading ? 'Saving...' : 'Add to Watchlist'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {tab === 'import' && (
        <Card className="mb-6 border-blue-500/20">
          <CardHeader><CardTitle>Import from Third-Party API</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={submitImport} className="space-y-4 max-w-xl">
              <Field label="API URL *" value={importForm.apiUrl} onChange={(v) => setImportForm({ ...importForm, apiUrl: v })} required />
              <Field label="API Key / Bearer Token" value={importForm.apiKey} onChange={(v) => setImportForm({ ...importForm, apiKey: v })} />
              <div>
                <label className="block text-sm text-slate-400 mb-1">Default Source Type</label>
                <select
                  value={importForm.defaultSource}
                  onChange={(e) => setImportForm({ ...importForm, defaultSource: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm"
                >
                  {SOURCE_TYPES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <p className="text-xs text-slate-500">API should return JSON array or object with data/records array.</p>
              <Button type="submit" disabled={loading}>
                <Download className="w-4 h-4 mr-2" /> {loading ? 'Importing...' : 'Import Records'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {tab === 'list' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-red-400" />
              Watchlist Entries ({entries.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {entries.length === 0 ? (
              <p className="text-slate-500 py-8 text-center">No entries yet. Add manually or import from API.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-700 text-slate-400">
                      <th className="text-left py-3 px-4">Name</th>
                      <th className="text-left py-3 px-4">Type</th>
                      <th className="text-left py-3 px-4">Mobile</th>
                      <th className="text-left py-3 px-4">Crime</th>
                      <th className="text-left py-3 px-4">Severity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {entries.map((e) => (
                      <tr key={e.id as string} className="border-b border-slate-800">
                        <td className="py-3 px-4 text-white">{e.fullName as string}</td>
                        <td className="py-3 px-4 text-slate-400 capitalize">{e.source as string}</td>
                        <td className="py-3 px-4 text-slate-400">{e.mobileNumber as string}</td>
                        <td className="py-3 px-4 text-slate-400">{e.crimeType as string}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded text-xs capitalize ${
                            e.severity === 'critical' ? 'bg-red-500/20 text-red-400' :
                            e.severity === 'high' ? 'bg-orange-500/20 text-orange-400' :
                            'bg-slate-700 text-slate-400'
                          }`}>
                            {e.severity as string}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function Field({ label, value, onChange, type = 'text', required, format, inputMode, placeholder }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  format?: (v: string) => string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
  placeholder?: string;
}) {
  const display = format ? format(value) : value;

  const apply = (raw: string) => {
    onChange(format ? format(raw) : raw);
  };

  return (
    <div>
      <label className="block text-sm text-slate-400 mb-1">{label}</label>
      <input
        type={type}
        inputMode={inputMode}
        autoComplete={format ? 'off' : undefined}
        value={display}
        onChange={(e) => apply(e.target.value)}
        onInput={(e) => apply((e.target as HTMLInputElement).value)}
        onPaste={(e) => {
          if (!format) return;
          e.preventDefault();
          const input = e.currentTarget;
          const pasted = e.clipboardData.getData('text');
          const start = input.selectionStart ?? display.length;
          const end = input.selectionEnd ?? display.length;
          apply(display.slice(0, start) + pasted + display.slice(end));
        }}
        onBlur={(e) => format && apply(e.target.value)}
        required={required}
        placeholder={placeholder}
        className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm"
      />
    </div>
  );
}
