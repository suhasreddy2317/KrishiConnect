import React, { useState, useEffect } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import {
  Users,
  Brain,
  Handshake,
  Truck,
  ArrowRight,
  Cpu,
  Database,
  Layers,
  Menu,
  X,
  Leaf,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

const valueCards = [
  {
    icon: Users,
    title: '5 Connected Roles',
    description: 'Farmers, Buyers, FPOs, Field Agents & Admins working together in one platform.',
    color: '#16A34A',
    bg: '#F0FDF4',
    border: '#BBF7D0',
  },
  {
    icon: Brain,
    title: 'Explainable Decisions',
    description: 'AI-driven insights using market prices, demand, storage and quality signals.',
    color: '#7C3AED',
    bg: '#F5F3FF',
    border: '#DDD6FE',
  },
  {
    icon: Handshake,
    title: 'Verified Market Links',
    description: 'Connect with trusted buyers, compare offers and negotiate with confidence.',
    color: '#D97706',
    bg: '#FFFBEB',
    border: '#FDE68A',
  },
  {
    icon: Truck,
    title: 'End-to-End Tracking',
    description: 'Track lots, logistics, payments and delivery from farm to market.',
    color: '#2563EB',
    bg: '#EFF6FF',
    border: '#BFDBFE',
  },
];

const navItems = [
  { name: 'Overview', path: '/' },
  { name: 'Farmer', path: '/farmer' },
  { name: 'FPO Manager', path: '/fpo' },
  { name: 'Buyer', path: '/buyer' },
  { name: 'Field Agent', path: '/field-agent' },
  { name: 'Admin', path: '/admin' },
];

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [backendStatus, setBackendStatus] = useState<'checking' | 'healthy' | 'offline'>('checking');

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await fetch('http://127.0.0.1:8000/api/health');
        if (res.ok) {
          const data = await res.json();
          if (data.status === 'healthy') {
            setBackendStatus('healthy');
            return;
          }
        }
        setBackendStatus('offline');
      } catch {
        setBackendStatus('offline');
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-background text-text-main">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-surface/95 backdrop-blur border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <NavLink to="/" className="flex items-center space-x-2.5 group">
              <div className="w-9 h-9 rounded-md bg-primary border border-border flex items-center justify-center text-white font-mono font-bold text-lg shadow-sm group-hover:border-accent transition-colors">
                KC
              </div>
              <div>
                <span className="font-semibold tracking-tight text-text-main group-hover:text-primary transition-colors">
                  KrishiConnect
                </span>
                <p className="text-[11px] text-text-muted leading-none hidden sm:block">
                  AgriPulse Exchange • Trust Ledger
                </p>
              </div>
            </NavLink>

            <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `px-3 py-1.5 rounded-sm text-xs font-medium transition-colors flex items-center space-x-1.5 ${
                      isActive
                        ? 'bg-primary text-white border border-border'
                        : 'text-text-muted hover:text-text-main hover:bg-surface-raised'
                    }`
                  }
                >
                  <span>{item.name}</span>
                </NavLink>
              ))}
            </nav>

            <div className="flex items-center space-x-3">
              <div
                className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-mono border"
                style={{
                  backgroundColor: 'rgb(var(--surface-raised) / 0.8)',
                  borderColor: 'rgb(var(--border))',
                }}
              >
                <span
                  className="w-2 h-2 rounded-full animate-pulse"
                  style={{
                    backgroundColor: backendStatus === 'healthy' ? '#16A34A' : backendStatus === 'offline' ? '#DC2626' : '#D97706',
                  }}
                />
                <span
                  className="hidden sm:inline"
                  style={{
                    color: backendStatus === 'healthy' ? '#16A34A' : backendStatus === 'offline' ? '#DC2626' : '#D97706',
                  }}
                >
                  API: {backendStatus}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-1.5 rounded-md text-text-muted hover:text-text-main hover:bg-surface-raised transition-colors"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-surface px-4 pt-3 pb-4 space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                    isActive
                      ? 'bg-primary text-white'
                      : 'text-text-muted hover:bg-surface-raised hover:text-text-main'
                  }`
                }
              >
                <span>{item.name}</span>
              </NavLink>
            ))}
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 pb-4">
        <div className="max-w-7xl mx-auto">
          <div className="relative rounded-3xl overflow-hidden min-h-[480px] sm:min-h-[520px] lg:min-h-[560px]" style={{ backgroundColor: '#F0FDF4' }}>
            <img
              src="/krishiconnect-hero.png"
              alt=""
              className="absolute inset-0 w-full h-full object-cover object-[60%] sm:object-center"
              aria-hidden="true"
            />

            <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/50 to-transparent sm:from-white/80 sm:via-white/40 lg:from-white/85 lg:via-white/50" />

            <div className="relative z-10 flex flex-col lg:flex-row items-center">
              <div className="w-full lg:flex-1 p-8 sm:p-10 lg:p-14 space-y-6">
                <Badge variant="lime" size="sm" className="font-mono">
                  Trust Ledger OS
                </Badge>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-text-main leading-tight">
                  Decision-Engine First.
                  <br />
                  <span className="text-primary">Transaction Layer Second.</span>
                </h1>

                <p className="text-text-muted text-sm sm:text-base leading-relaxed max-w-xl">
                  KrishiConnect transforms agricultural commodity trade from distress selling into a transparent, verified transaction network. Built to answer the essential farmer question:
                  <span className="block text-text-main font-medium mt-2 text-base">
                    "What should I do right now, and why?"
                  </span>
                </p>

                <div className="flex flex-wrap gap-2 text-xs font-mono">
                  <div className="px-3 py-1.5 rounded-md bg-white border border-border text-text-main flex items-center space-x-2">
                    <Cpu className="w-3.5 h-3.5 text-primary" />
                    <span>FastAPI Backend</span>
                  </div>
                  <div className="px-3 py-1.5 rounded-md bg-white border border-border text-text-main flex items-center space-x-2">
                    <Database className="w-3.5 h-3.5 text-status-success" />
                    <span>SQLAlchemy (Portable DB)</span>
                  </div>
                  <div className="px-3 py-1.5 rounded-md bg-white border border-border text-text-main flex items-center space-x-2">
                    <Layers className="w-3.5 h-3.5 text-primary" />
                    <span>Trust Ledger Shell</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Four Value Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {valueCards.map((card) => {
            const Icon = card.icon;
            return (
              <Card
                key={card.title}
                variant="default"
                padding="lg"
                className="hover:border-primary/30 transition-all"
                style={{ backgroundColor: card.bg, borderColor: card.border }}
              >
                <div className="space-y-4">
                  <div
                    className="w-12 h-12 rounded-xl border flex items-center justify-center"
                    style={{ backgroundColor: card.color + '20', borderColor: card.color + '40', color: card.color }}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-text-main">{card.title}</h3>
                    <p className="text-sm text-text-muted mt-1 leading-relaxed">{card.description}</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* About KrishiConnect */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
          <div className="flex-1 space-y-4">
            <h2 className="text-2xl sm:text-3xl font-semibold text-text-main">
              About <span className="text-primary">KrishiConnect</span>
            </h2>
            <p className="text-text-muted text-sm sm:text-base leading-relaxed">
              KrishiConnect is a farmer-first decision-support and agricultural trading platform that helps farmers decide when to sell, where to sell, and whom to sell to. By combining market prices, demand trends, quality grading, storage and logistics factors, the platform provides explainable recommendations and connects farmers with verified buyers — bringing the entire agricultural trade journey into one transparent workflow.
            </p>
          </div>
          <div className="flex-shrink-0">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-primary/10 flex items-center justify-center">
              <Leaf className="w-12 h-12 sm:w-14 sm:h-14 text-primary" />
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <div className="space-y-6">
          <Button
            variant="primary"
            size="lg"
            rightIcon={<ArrowRight className="w-4 h-4" />}
            onClick={() => navigate('/farmer')}
          >
            Explore the Platform
          </Button>
          <p className="text-xs sm:text-sm text-text-muted font-mono">
            From Farm to Market &nbsp;|&nbsp; Transparent &nbsp;|&nbsp; Trusted &nbsp;|&nbsp; Together
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-surface py-8 text-xs text-text-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span>© 2026 KrishiConnect. All rights reserved.</span>
          </div>
          <div className="flex items-center space-x-6">
            <NavLink to="/" className="hover:text-text-main transition-colors">About</NavLink>
            <NavLink to="/" className="hover:text-text-main transition-colors">Contact</NavLink>
            <NavLink to="/" className="hover:text-text-main transition-colors">Privacy</NavLink>
            <NavLink to="/" className="hover:text-text-main transition-colors">Terms</NavLink>
          </div>
        </div>
      </footer>
    </div>
  );
};
