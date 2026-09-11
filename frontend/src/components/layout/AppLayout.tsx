import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  Sprout,
  Users,
  Building2,
  MapPin,
  ShieldCheck,
  Activity,
  Menu,
  X,
  Layers,
  LogOut,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { API_BASE_URL } from '@/lib/api';

interface NavItem {
  name: string;
  path: string;
  icon: React.ElementType;
  roleTag: string;
}

const navItems: NavItem[] = [
  { name: 'Farmer', path: '/farmer', icon: Sprout, roleTag: 'Decision Engine' },
  { name: 'FPO Manager', path: '/fpo', icon: Users, roleTag: 'Aggregation' },
  { name: 'Buyer', path: '/buyer', icon: Building2, roleTag: 'Procurement' },
  { name: 'Field Agent', path: '/field-agent', icon: MapPin, roleTag: 'Field Assist' },
  { name: 'Admin', path: '/admin', icon: ShieldCheck, roleTag: 'Governance' },
];

export const AppLayout: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [backendStatus, setBackendStatus] = useState<'checking' | 'healthy' | 'offline'>('checking');
  const location = useLocation();
  const { user, logout } = useAuth();

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/health`);
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

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col bg-background text-text-main">
      <header className="sticky top-0 z-50 bg-surface/90 backdrop-blur border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
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
            </div>

            <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
              <NavLink
                to="/"
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-sm text-xs font-medium transition-colors flex items-center space-x-1.5 ${
                    isActive
                      ? 'bg-primary text-white border border-border'
                      : 'text-text-muted hover:text-text-main hover:bg-surface-raised'
                  }`
                }
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Overview</span>
              </NavLink>

              {navItems.map((item) => {
                const Icon = item.icon;
                return (
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
                    <Icon className="w-3.5 h-3.5" />
                    <span>{item.name}</span>
                  </NavLink>
                );
              })}
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

              {user && (
                <button
                  type="button"
                  onClick={logout}
                  className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-mono border border-border text-text-muted hover:text-status-error hover:border-status-error/40 transition-colors"
                  aria-label="Logout"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              )}

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
            <NavLink
              to="/"
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium ${
                  isActive
                    ? 'bg-primary text-white'
                    : 'text-text-muted hover:bg-surface-raised hover:text-text-main'
                }`
              }
            >
              <div className="flex items-center space-x-2.5">
                <Layers className="w-4 h-4" />
                <span>Overview Hub</span>
              </div>
              <span className="text-[10px] font-mono text-text-muted">All Roles</span>
            </NavLink>

            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium ${
                      isActive
                        ? 'bg-primary text-white'
                        : 'text-text-muted hover:bg-surface-raised hover:text-text-main'
                    }`
                  }
                >
                  <div className="flex items-center space-x-2.5">
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </div>
                  <span className="text-[10px] font-mono text-text-muted">{item.roleTag}</span>
                </NavLink>
              );
            })}
          </div>
        )}
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      <footer className="border-t border-border bg-background py-6 text-xs text-text-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Activity className="w-3.5 h-3.5 text-status-success" />
            <span>KrishiConnect • Trust Ledger</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
