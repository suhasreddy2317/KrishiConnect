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
    <div className="min-h-screen bg-[#0A0B1C] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#EEF0FA] tracking-tight">KrishiConnect</h1>
          <p className="text-[#A7ABC9] mt-2 text-sm">Agricultural market intelligence & trading platform</p>
        </div>

        <div className="bg-[#14152E] border border-[#2C2B73] rounded-lg p-6 space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-[#EEF0FA]">Sign in</h2>
            <p className="text-xs text-[#A7ABC9] mt-1">Enter your phone number and password to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label htmlFor="identifier" className="block text-xs font-medium text-[#A7ABC9]">
                Phone Number
              </label>
              <input
                id="identifier"
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full rounded-md border border-[#2C2B73] bg-[#0A0B1C] px-3 py-2 text-sm text-[#EEF0FA] placeholder:text-[#5B5E8C] focus:outline-none focus:ring-1 focus:ring-[#C4FF4D]"
                placeholder="+919876543210"
                required
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="password" className="block text-xs font-medium text-[#A7ABC9]">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-md border border-[#2C2B73] bg-[#0A0B1C] px-3 py-2 text-sm text-[#EEF0FA] placeholder:text-[#5B5E8C] focus:outline-none focus:ring-1 focus:ring-[#C4FF4D]"
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <div className="rounded-md border border-[#E5484D]/30 bg-[#E5484D]/10 p-3 text-xs text-[#E5484D]">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-md bg-[#C4FF4D] px-4 py-2.5 text-sm font-semibold text-[#0A0B1C] hover:bg-[#AEE83A] focus:outline-none focus:ring-2 focus:ring-[#C4FF4D] focus:ring-offset-2 focus:ring-offset-[#14152E] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <div className="rounded-md border border-[#2C2B73]/60 bg-[#1D1F3D] p-3">
            <p className="text-xs font-medium text-[#EEF0FA] mb-2">Demo Accounts</p>
            <div className="space-y-1 text-xs text-[#A7ABC9]">
              <div className="flex justify-between"><span>Farmer:</span><span className="text-[#EEF0FA]">+919876543210</span></div>
              <div className="flex justify-between"><span>FPO Manager:</span><span className="text-[#EEF0FA]">+919876543211</span></div>
              <div className="flex justify-between"><span>Buyer:</span><span className="text-[#EEF0FA]">+919876543212</span></div>
              <div className="flex justify-between"><span>Field Agent:</span><span className="text-[#EEF0FA]">+919876543213</span></div>
              <div className="flex justify-between"><span>Admin:</span><span className="text-[#EEF0FA]">+919876543214</span></div>
              <div className="mt-2 pt-2 border-t border-[#2C2B73]/60 text-[#A7ABC9]">
                Password for all accounts: <span className="text-[#EEF0FA] font-mono">demo-password</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
