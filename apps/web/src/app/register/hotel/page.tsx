'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Building2, CheckCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/lib/api';

export default function RegisterHotelPage() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '',
    ownerName: '',
    licenseNumber: '',
    gstNumber: '',
    address: '',
    city: '',
    pincode: '',
    contactNumber: '',
    email: '',
    totalRooms: '',
    starRating: '',
    ownerFirstName: '',
    ownerLastName: '',
    ownerEmail: '',
    ownerPassword: '',
    ownerPhone: '',
  });

  const update = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.registerHotel({
        ...form,
        totalRooms: form.totalRooms ? parseInt(form.totalRooms) : undefined,
        starRating: form.starRating ? parseInt(form.starRating) : undefined,
      });
      setSubmitted(true);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen hotel-bg flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-amber-200/20 text-center">
          <CardContent className="pt-10 pb-8">
            <CheckCircle className="w-16 h-16 text-amber-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Registration Submitted!</h2>
            <p className="text-slate-400 mb-6">
              Your hotel registration is under review. You will be able to sign in once an administrator approves your application.
            </p>
            <Link href="/login/hotel">
              <Button className="bg-gradient-to-r from-amber-500 to-orange-500 text-slate-900 font-semibold">
                Go to Hotel Login
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen hotel-bg py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <Link href="/login/hotel" className="inline-flex items-center gap-2 text-slate-400 hover:text-amber-400 mb-6 text-sm">
          <ArrowLeft className="w-4 h-4" /> Back to login
        </Link>

        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-8 h-8 text-slate-900" />
          </div>
          <h1 className="text-3xl font-bold text-white">Register Your Hotel</h1>
          <p className="text-slate-400 mt-2">Join the digital visitor register network</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="border-amber-200/10">
            <CardHeader><CardTitle className="text-amber-400/90">Hotel Details</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Hotel Name *" value={form.name} onChange={(v) => update('name', v)} required />
              <Field label="Owner / Proprietor Name *" value={form.ownerName} onChange={(v) => update('ownerName', v)} required />
              <Field label="License Number *" value={form.licenseNumber} onChange={(v) => update('licenseNumber', v)} required />
              <Field label="GST Number" value={form.gstNumber} onChange={(v) => update('gstNumber', v)} />
              <Field label="Contact Number *" value={form.contactNumber} onChange={(v) => update('contactNumber', v)} required />
              <Field label="Hotel Email *" value={form.email} onChange={(v) => update('email', v)} type="email" required />
              <Field label="Total Rooms" value={form.totalRooms} onChange={(v) => update('totalRooms', v)} type="number" />
              <Field label="Star Rating (1-5)" value={form.starRating} onChange={(v) => update('starRating', v)} type="number" />
              <div className="md:col-span-2">
                <Field label="Full Address *" value={form.address} onChange={(v) => update('address', v)} required />
              </div>
              <Field label="City *" value={form.city} onChange={(v) => update('city', v)} required />
              <Field label="Pincode" value={form.pincode} onChange={(v) => update('pincode', v)} />
            </CardContent>
          </Card>

          <Card className="border-amber-200/10">
            <CardHeader><CardTitle className="text-amber-400/90">Account Credentials</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Your First Name *" value={form.ownerFirstName} onChange={(v) => update('ownerFirstName', v)} required />
              <Field label="Your Last Name *" value={form.ownerLastName} onChange={(v) => update('ownerLastName', v)} required />
              <Field label="Login Email *" value={form.ownerEmail} onChange={(v) => update('ownerEmail', v)} type="email" required />
              <Field label="Phone" value={form.ownerPhone} onChange={(v) => update('ownerPhone', v)} />
              <div className="md:col-span-2">
                <Field label="Password (min 8 characters) *" value={form.ownerPassword} onChange={(v) => update('ownerPassword', v)} type="password" required />
              </div>
            </CardContent>
          </Card>

          <Button
            type="submit"
            disabled={loading}
            className="w-full py-6 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-900 font-semibold text-lg"
          >
            {loading ? 'Submitting...' : 'Submit Registration for Approval'}
          </Button>
        </form>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = 'text', required }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm text-slate-400 mb-1.5">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full px-4 py-2.5 rounded-lg bg-slate-800/80 border border-slate-700 text-white focus:outline-none focus:border-amber-500/50"
      />
    </div>
  );
}
