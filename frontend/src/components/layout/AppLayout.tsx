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
    // Check backend health status
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

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col bg-[#0A0B1C] text-[#EEF0FA]">
      {/* Top Ledger Navigation Bar */}
      <header className="sticky top-0 z-50 bg-[#14152E]/90 backdrop-blur border-b border-[#2C2B73]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Brand Logo & Tag */}
            <div className="flex items-center space-x-3">
              <NavLink to="/" className="flex items-center space-x-2.5 group">
                <div className="w-9 h-9 rounded-md bg-[#2C2B73] border border-[#5B5E8C]/40 flex items-center justify-center text-[#C4FF4D] font-mono font-bold text-lg shadow-sm group-hover:border-[#C4FF4D]/60 transition-colors">
                  KC
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold tracking-tight text-white group-hover:text-[#C4FF4D] transition-colors">
                      KrishiConnect
                    </span>
                    <span className="text-[10px] uppercase font-mono tracking-wider px-1.5 py-0.5 rounded bg-[#2C2B73]/60 text-[#A7ABC9] border border-[#5B5E8C]/30">
                      Phase 1
                    </span>
                  </div>
                  <p className="text-[11px] text-[#A7ABC9] leading-none hidden sm:block">
                    AgriPulse Exchange • Trust Ledger
                  </p>
                </div>
              </NavLink>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
              <NavLink
                to="/"
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-sm text-xs font-medium transition-colors flex items-center space-x-1.5 ${
                    isActive
                      ? 'bg-[#2C2B73] text-[#C4FF4D] border border-[#5B5E8C]/40'
                      : 'text-[#A7ABC9] hover:text-[#EEF0FA] hover:bg-[#1D1F3D]'
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
                          ? 'bg-[#2C2B73] text-[#C4FF4D] border border-[#5B5E8C]/40'
                          : 'text-[#A7ABC9] hover:text-[#EEF0FA] hover:bg-[#1D1F3D]'
                      }`
                    }
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{item.name}</span>
                  </NavLink>
                );
              })}
            </nav>

            {/* Backend Status & Mobile Trigger */}
            <div className="flex items-center space-x-3">
              <div
                className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-mono border"
                style={{
                  backgroundColor:
                    backendStatus === 'healthy'
                      ? 'rgba(47, 191, 143, 0.1)'
                      : backendStatus === 'offline'
                      ? 'rgba(229, 72, 77, 0.1)'
                      : 'rgba(245, 166, 35, 0.1)',
                  borderColor:
                    backendStatus === 'healthy'
                      ? '#2FBF8F'
                      : backendStatus === 'offline'
                      ? '#E5484D'
                      : '#F5A623',
                }}
              >
                <span
                  className="w-2 h-2 rounded-full animate-pulse"
                  style={{
                    backgroundColor:
                      backendStatus === 'healthy'
                        ? '#2FBF8F'
                        : backendStatus === 'offline'
                        ? '#E5484D'
                        : '#F5A623',
                  }}
                />
                <span
                  className="hidden sm:inline"
                  style={{
                    color:
                      backendStatus === 'healthy'
                        ? '#2FBF8F'
                        : backendStatus === 'offline'
                        ? '#E5484D'
                        : '#F5A623',
                  }}
                >
                  API: {backendStatus}
                </span>
              </div>

              {user && (
                <button
                  type="button"
                  onClick={logout}
                  className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-mono border border-[#2C2B73] text-[#A7ABC9] hover:text-[#E5484D] hover:border-[#E5484D]/40 transition-colors"
                  aria-label="Logout"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              )}

              {/* Mobile Menu Button */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-1.5 rounded-md text-[#A7ABC9] hover:text-white hover:bg-[#1D1F3D] transition-colors"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[#2C2B73] bg-[#14152E] px-4 pt-3 pb-4 space-y-1">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium ${
                  isActive
                    ? 'bg-[#2C2B73] text-[#C4FF4D]'
                    : 'text-[#A7ABC9] hover:bg-[#1D1F3D] hover:text-white'
                }`
              }
            >
              <div className="flex items-center space-x-2.5">
                <Layers className="w-4 h-4" />
                <span>Overview Hub</span>
              </div>
              <span className="text-[10px] font-mono text-[#A7ABC9]">All Roles</span>
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
                        ? 'bg-[#2C2B73] text-[#C4FF4D]'
                        : 'text-[#A7ABC9] hover:bg-[#1D1F3D] hover:text-white'
                    }`
                  }
                >
                  <div className="flex items-center space-x-2.5">
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </div>
                  <span className="text-[10px] font-mono text-[#A7ABC9]">{item.roleTag}</span>
                </NavLink>
              );
            })}
          </div>
        )}
      </header>

      {/* Main Page Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-[#2C2B73]/60 bg-[#0A0B1C] py-6 text-xs text-[#A7ABC9]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <Activity className="w-3.5 h-3.5 text-[#2FBF8F]" />
            <span>KrishiConnect Decision Engine • SIH Prototype</span>
          </div>
          <div className="font-mono text-[11px] flex items-center space-x-4">
            <span>Theme: Trust Ledger</span>
            <span>•</span>
            <span>DB: SQLite (Portable)</span>
            <span>•</span>
            <span className="text-[#C4FF4D]">Phase 1 Foundation</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

