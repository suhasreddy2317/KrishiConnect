import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

export const LoginPage: React.FC = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await login(identifier, password);
      const role = localStorage.getItem('kc_user') ? JSON.parse(localStorage.getItem('kc_user')!).role : 'farmer';
      const redirects: Record<string, string> = {
        farmer: '/farmer',
        fpo_manager: '/fpo',
        buyer: '/buyer',
        field_agent: '/field-agent',
        admin: '/admin',
      };
      navigate(redirects[role] || '/farmer', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-text-main tracking-tight">KrishiConnect</h1>
          <p className="text-text-muted mt-2 text-sm">Agricultural market intelligence & trading platform</p>
        </div>

        <div className="bg-surface border border-border rounded-lg p-6 space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-text-main">Sign in</h2>
            <p className="text-xs text-text-muted mt-1">Enter your phone number and password to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label htmlFor="identifier" className="block text-xs font-medium text-text-muted">
                Phone Number
              </label>
              <input
                id="identifier"
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-text-main placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent"
                placeholder="+919876543210"
                required
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="password" className="block text-xs font-medium text-text-muted">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-text-main placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent"
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <div className="rounded-md border border-status-error/30 bg-status-error/10 p-3 text-xs text-status-error">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-md bg-accent px-4 py-2.5 text-sm font-semibold text-background hover:bg-accent/80 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <div className="rounded-md border border-border bg-surface-raised p-3">
            <p className="text-xs font-medium text-text-main mb-2">Demo Accounts</p>
            <div className="space-y-1 text-xs text-text-muted">
              <div className="flex justify-between"><span>Farmer:</span><span className="text-text-main">+919876543210</span></div>
              <div className="flex justify-between"><span>FPO Manager:</span><span className="text-text-main">+919876543211</span></div>
              <div className="flex justify-between"><span>Buyer:</span><span className="text-text-main">+919876543212</span></div>
              <div className="flex justify-between"><span>Field Agent:</span><span className="text-text-main">+919876543213</span></div>
              <div className="flex justify-between"><span>Admin:</span><span className="text-text-main">+919876543214</span></div>
              <div className="mt-2 pt-2 border-t border-border text-text-muted">
                Password for all accounts: <span className="text-text-main font-mono">demo-password</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
