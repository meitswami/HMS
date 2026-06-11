'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/lib/api';
import { getStoredUser, guestListPath } from '@/lib/auth';
import { formatAadharInput } from '@/lib/aadhar';

export default function RegisterGuestPage() {
  const router = useRouter();
  const listPath = guestListPath(getStoredUser()?.role);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    hotelId: '',
    fullName: '',
    fatherName: '',
    age: '',
    gender: 'male',
    nationality: 'Indian',
    mobileNumber: '',
    permanentAddress: '',
    aadhaarNumber: '',
    passportNumber: '',
    roomNumber: '',
    checkInDate: new Date().toISOString().split('T')[0],
    checkInTime: new Date().toTimeString().slice(0, 5),
    purposeOfVisit: '',
    isForeignNational: false,
  });

  const update = (field: string, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.registerGuest({
        ...form,
        age: form.age ? parseInt(form.age) : undefined,
      });
      router.push(listPath);
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl">
      <h1 className="text-3xl font-bold text-white mb-8">New Guest Check-in</h1>

      <form onSubmit={handleSubmit}>
        <Card className="mb-6">
          <CardHeader><CardTitle>Personal Information</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Full Name *" value={form.fullName} onChange={(v) => update('fullName', v)} required />
            <Field label="Father's Name" value={form.fatherName} onChange={(v) => update('fatherName', v)} />
            <Field label="Age" value={form.age} onChange={(v) => update('age', v)} type="number" />
            <div>
              <label className="block text-sm text-slate-400 mb-1.5">Gender</label>
              <select
                value={form.gender}
                onChange={(e) => update('gender', e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <Field label="Mobile Number" value={form.mobileNumber} onChange={(v) => update('mobileNumber', v)} />
            <Field label="Nationality" value={form.nationality} onChange={(v) => update('nationality', v)} />
            <div className="md:col-span-2">
              <Field label="Permanent Address" value={form.permanentAddress} onChange={(v) => update('permanentAddress', v)} />
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader><CardTitle>Identity Documents</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field
              label="Aadhar Number"
              value={form.aadhaarNumber}
              onChange={(v) => update('aadhaarNumber', v)}
              format={formatAadharInput}
              inputMode="numeric"
              placeholder="1234-5678-9012"
            />
            <Field label="Passport Number" value={form.passportNumber} onChange={(v) => update('passportNumber', v)} />
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader><CardTitle>Stay Details</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Hotel ID *" value={form.hotelId} onChange={(v) => update('hotelId', v)} required />
            <Field label="Room Number" value={form.roomNumber} onChange={(v) => update('roomNumber', v)} />
            <Field label="Check-in Date" value={form.checkInDate} onChange={(v) => update('checkInDate', v)} type="date" />
            <Field label="Check-in Time" value={form.checkInTime} onChange={(v) => update('checkInTime', v)} type="time" />
            <div className="md:col-span-2">
              <Field label="Purpose of Visit" value={form.purposeOfVisit} onChange={(v) => update('purposeOfVisit', v)} />
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button type="submit" disabled={loading}>
            {loading ? 'Registering...' : 'Register Guest'}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
        </div>
      </form>
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
      <label className="block text-sm text-slate-400 mb-1.5">{label}</label>
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
        className="w-full px-4 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-blue-500"
      />
    </div>
  );
}
