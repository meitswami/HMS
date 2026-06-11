'use client';

import { useState, ReactNode } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/lib/api';
import { saveSession, redirectAfterLogin, canAccessPortal, AuthUser } from '@/lib/auth';
import { PortalType } from '@hms/shared';

interface LoginFormProps {
  portal: PortalType;
  title: string;
  subtitle: string;
  icon: ReactNode;
  theme?: 'police' | 'hotel' | 'admin';
  defaultEmail?: string;
  footer?: ReactNode;
}

export function LoginForm({
  portal,
  title,
  subtitle,
  icon,
  theme = 'police',
  defaultEmail = '',
  footer,
}: LoginFormProps) {
  const [email, setEmail] = useState(defaultEmail);
  const [password, setPassword] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [requiresMfa, setRequiresMfa] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const cardClass = theme === 'hotel'
    ? 'border-amber-200/20 bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/30 shadow-2xl shadow-amber-900/10'
    : theme === 'admin'
      ? 'border-violet-500/20 bg-gradient-to-br from-slate-900 to-violet-950/20'
      : 'border-blue-500/20';

  const btnClass = theme === 'hotel'
    ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-900 font-semibold'
    : theme === 'admin'
      ? 'bg-violet-600 hover:bg-violet-500'
      : '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await api.login(email, password, mfaCode || undefined);
      if (result.requiresMfa) {
        setRequiresMfa(true);
        return;
      }

      const user = result.user as AuthUser;
      if (!canAccessPortal(user.role, portal)) {
        setError('Your account does not have access to this portal. Please use the correct login page.');
        return;
      }

      saveSession(result.accessToken, result.refreshToken, user);
      window.location.href = redirectAfterLogin(user.role, portal);
    } catch (err) {
      setError((err as Error).message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className={`w-full max-w-md ${cardClass}`}>
      <CardHeader className="text-center">
        <div className="mx-auto mb-4">{icon}</div>
        <CardTitle className="text-2xl">{title}</CardTitle>
        <p className="text-sm text-slate-400 mt-1">{subtitle}</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm text-slate-400 mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1.5">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-blue-500 pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {requiresMfa && (
            <div>
              <label className="block text-sm text-slate-400 mb-1.5">MFA Code</label>
              <input
                type="text"
                value={mfaCode}
                onChange={(e) => setMfaCode(e.target.value)}
                maxLength={6}
                className="w-full px-4 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-blue-500 text-center tracking-widest text-lg"
                placeholder="000000"
              />
            </div>
          )}

          <Button type="submit" className={`w-full ${btnClass}`} disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>
        {footer && <div className="mt-6 text-center text-sm">{footer}</div>}
      </CardContent>
    </Card>
  );
}
