import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { ROLE_CONFIGS, UserRole } from '@/config/navigation';
import { useTextSize } from '@/context/TextSizeContext';
import { NotificationPopover } from '@/components/navigation/NotificationPopover';
import { API_BASE_URL } from '@/lib/api';
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
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(2);
  const palette = ROLE_CONFIGS[currentRole].palette;

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

  const rolesList: UserRole[] = ['farmer', 'fpo', 'buyer', 'field-agent', 'admin'];

  return (
    <header
      className={cn(
        'shrink-0 z-40 h-16 bg-surface/95 backdrop-blur border-b border-border px-4 sm:px-6 lg:px-8 flex items-center justify-between',
        className
      )}
    >
      <div className="flex items-center space-x-3">
        <button
          type="button"
          onClick={onMobileMenuToggle}
          aria-label={isMobileMenuOpen ? 'Close navigation' : 'Open navigation'}
          className="md:hidden p-1.5 rounded-md text-text-muted hover:text-text-main hover:bg-surface-raised transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        <div>
          <h2 className="text-base sm:text-lg font-semibold text-text-main tracking-tight truncate">
            {title}
          </h2>
          <span className="text-[10px] font-mono text-text-muted hidden sm:inline">
            KrishiConnect • {ROLE_CONFIGS[currentRole].shortName} Terminal
          </span>
        </div>
      </div>

      <div className="flex items-center space-x-2 sm:space-x-3">
        {/* Role Switcher */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setRoleMenuOpen(!roleMenuOpen);
              if (notificationsOpen) setNotificationsOpen(false);
            }}
            className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-md bg-surface-raised hover:bg-border text-xs font-medium text-text-main border border-border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: ROLE_CONFIGS[currentRole].accentColor }}
            />
            <span className="hidden sm:inline">Role:</span>
            <span className="font-semibold">{ROLE_CONFIGS[currentRole].shortName}</span>
            <ChevronDown className="w-3.5 h-3.5 text-text-muted" />
          </button>

          {roleMenuOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setRoleMenuOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-52 rounded-xl bg-surface border border-border shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-2.5 py-1.5 text-[10px] font-mono uppercase tracking-wider text-text-muted border-b border-border">
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
                          ? 'bg-primary text-accent font-semibold'
                          : 'text-text-main hover:bg-surface-raised'
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

        {/* Text Size Control */}
        <button
          type="button"
          onClick={toggleLargeText}
          aria-label={isLargeText ? 'Standard text size' : 'Large text accessibility mode'}
          title={isLargeText ? 'Disable Large Text' : 'Enable Large Text (18px base)'}
          className={cn(
            'p-1.5 rounded-md text-xs font-mono font-bold transition-all border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring',
            isLargeText
              ? 'bg-primary text-white border-primary shadow-sm font-semibold'
              : 'bg-surface-raised text-text-muted hover:text-text-main border-border'
          )}
        >
          <div className="flex items-center space-x-1">
            <Type className="w-3.5 h-3.5" />
            <span className="text-[10px] hidden sm:inline">
              {isLargeText ? 'Large' : 'Std'}
            </span>
          </div>
        </button>

        {/* Backend Status */}
        <div
          className="flex items-center space-x-1.5 px-2 py-1 rounded-full text-xs font-mono border"
          style={{
            backgroundColor: palette.raised,
            borderColor: palette.border,
          }}
          title={`Backend status: ${backendStatus}`}
        >
          <span
            className="w-2 h-2 rounded-full animate-pulse"
            style={{
              backgroundColor: backendStatus === 'healthy' ? '#16A34A' : backendStatus === 'offline' ? '#DC2626' : '#D97706',
            }}
          />
          <span
            className="text-[10px] hidden md:inline font-semibold"
            style={{
              color: backendStatus === 'healthy' ? '#16A34A' : backendStatus === 'offline' ? '#DC2626' : '#D97706',
            }}
          >
            API: {backendStatus}
          </span>
        </div>

        {/* Notification Bell & Popover */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setNotificationsOpen((prev) => !prev);
              if (roleMenuOpen) setRoleMenuOpen(false);
            }}
            aria-label="Notifications"
            aria-expanded={notificationsOpen}
            className={cn(
              'p-1.5 rounded-md transition-colors relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring',
              notificationsOpen
                ? 'bg-surface-raised text-text-main ring-1 ring-border'
                : 'text-text-muted hover:text-text-main hover:bg-surface-raised'
            )}
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span
                className="absolute top-1 right-1 w-2 h-2 rounded-full ring-2 ring-surface animate-pulse"
                style={{ backgroundColor: palette.accent }}
              />
            )}
          </button>

          <NotificationPopover
            isOpen={notificationsOpen}
            onClose={() => setNotificationsOpen(false)}
            currentRole={currentRole}
            onUnreadCountChange={setUnreadCount}
          />
        </div>
      </div>
    </header>
  );
};
