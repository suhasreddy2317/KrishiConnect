import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { ROLE_CONFIGS, UserRole } from '@/config/navigation';
import { useTextSize } from '@/context/TextSizeContext';
import {
  Menu,
  X,
  Bell,
  Type,
  ChevronDown,
} from 'lucide-react';

export interface TopHeaderProps {
  currentRole: UserRole;
  title: string;
  onMobileMenuToggle: () => void;
  isMobileMenuOpen: boolean;
  className?: string;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  currentRole,
  title,
  onMobileMenuToggle,
  isMobileMenuOpen,
  className,
}) => {
  const navigate = useNavigate();
  const { isLargeText, toggleLargeText } = useTextSize();
  const [backendStatus, setBackendStatus] = useState<'checking' | 'healthy' | 'offline'>('checking');
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);

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

  const rolesList: UserRole[] = ['farmer', 'fpo', 'buyer', 'field-agent', 'admin'];

  return (
    <header
      className={cn(
        'sticky top-0 z-40 h-16 bg-[#14152E]/95 backdrop-blur border-b border-[#2C2B73] px-4 sm:px-6 lg:px-8 flex items-center justify-between',
        className
      )}
    >
      {/* Left side: Mobile menu toggle + Page title */}
      <div className="flex items-center space-x-3">
        <button
          type="button"
          onClick={onMobileMenuToggle}
          aria-label={isMobileMenuOpen ? 'Close navigation' : 'Open navigation'}
          className="md:hidden p-1.5 rounded-md text-[#A7ABC9] hover:text-[#EEF0FA] hover:bg-[#1D1F3D] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C4FF4D]"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        <div>
          <h2 className="text-base sm:text-lg font-semibold text-[#EEF0FA] tracking-tight truncate">
            {title}
          </h2>
          <span className="text-[10px] font-mono text-[#A7ABC9] hidden sm:inline">
            KrishiConnect • {ROLE_CONFIGS[currentRole].shortName} Terminal
          </span>
        </div>
      </div>

      {/* Right side: Role Switcher + Accessibility + API Status + Notifications */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        {/* Role Switcher Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setRoleMenuOpen(!roleMenuOpen)}
            className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-md bg-[#1D1F3D] hover:bg-[#2C2B73] text-xs font-medium text-[#EEF0FA] border border-[#5B5E8C]/40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C4FF4D]"
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: ROLE_CONFIGS[currentRole].accentColor }}
            />
            <span className="hidden sm:inline">Role:</span>
            <span className="font-semibold">{ROLE_CONFIGS[currentRole].shortName}</span>
            <ChevronDown className="w-3.5 h-3.5 text-[#A7ABC9]" />
          </button>

          {roleMenuOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setRoleMenuOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-52 rounded-xl bg-[#1D1F3D] border border-[#5B5E8C]/50 shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-2.5 py-1.5 text-[10px] font-mono uppercase tracking-wider text-[#A7ABC9] border-b border-[#2C2B73]">
                  Switch Workspace Role
                </div>
                {rolesList.map((r) => {
                  const cfg = ROLE_CONFIGS[r];
                  const isCurrent = r === currentRole;
                  return (
                    <button
                      key={r}
                      type="button"
                      onClick={() => {
                        setRoleMenuOpen(false);
                        navigate(cfg.basePath);
                      }}
                      className={cn(
                        'w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs transition-colors text-left',
                        isCurrent
                          ? 'bg-[#2C2B73] text-[#C4FF4D] font-semibold'
                          : 'text-[#EEF0FA] hover:bg-[#14152E]'
                      )}
                    >
                      <div className="flex items-center space-x-2">
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: cfg.accentColor }}
                        />
                        <span>{cfg.shortName}</span>
                      </div>
                      {isCurrent && (
                        <span className="text-[10px] font-mono uppercase">Active</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Large Text Mode Toggle */}
        <button
          type="button"
          onClick={toggleLargeText}
          aria-label={isLargeText ? 'Standard text size' : 'Large text accessibility mode'}
          title={isLargeText ? 'Disable Large Text' : 'Enable Large Text (18px base)'}
          className={cn(
            'p-1.5 rounded-md text-xs font-mono font-bold transition-colors border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C4FF4D]',
            isLargeText
              ? 'bg-[#C4FF4D] text-[#0A0B1C] border-[#C4FF4D]'
              : 'bg-[#1D1F3D] text-[#A7ABC9] hover:text-[#EEF0FA] border-[#5B5E8C]/40'
          )}
        >
          <div className="flex items-center space-x-1">
            <Type className="w-3.5 h-3.5" />
            <span className="text-[10px] hidden sm:inline">
              {isLargeText ? 'Large' : 'Std'}
            </span>
          </div>
        </button>

        {/* Live Backend Health Dot */}
        <div
          className="flex items-center space-x-1.5 px-2 py-1 rounded-full text-xs font-mono border"
          style={{
            backgroundColor:
              backendStatus === 'healthy'
                ? 'rgba(47, 191, 143, 0.12)'
                : backendStatus === 'offline'
                ? 'rgba(229, 72, 77, 0.12)'
                : 'rgba(245, 166, 35, 0.12)',
            borderColor:
              backendStatus === 'healthy'
                ? '#2FBF8F'
                : backendStatus === 'offline'
                ? '#E5484D'
                : '#F5A623',
          }}
          title={`Backend status: ${backendStatus}`}
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
            className="text-[10px] hidden md:inline font-semibold"
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

        {/* Notifications Icon Button */}
        <button
          type="button"
          aria-label="Notifications"
          className="p-1.5 rounded-md text-[#A7ABC9] hover:text-[#EEF0FA] hover:bg-[#1D1F3D] transition-colors relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C4FF4D]"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-[#C4FF4D]" />
        </button>
      </div>
    </header>
  );
};
