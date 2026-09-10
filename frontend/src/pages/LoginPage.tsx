import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

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

        <Card variant="default" padding="lg" title="Sign in" subtitle="Enter your phone number and password to continue">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              id="identifier"
              type="text"
              label="Phone Number"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="+919876543210"
              required
            />

            <Input
              id="password"
              type="password"
              label="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />

            {error && (
              <div className="rounded-md border border-status-error/30 bg-status-error/10 p-3 text-xs text-status-error">
                {error}
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              isLoading={isSubmitting}
            >
              {isSubmitting ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>

        </Card>
      </div>
    </div>
  );
};
