import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { ROLE_CONFIGS, UserRole } from '@/config/navigation';
import { useTextSize } from '@/context/TextSizeContext';
import { NotificationPopover } from '@/components/navigation/NotificationPopover';
import {
  Menu,
  X,
  Bell,
  Type,
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
  const { isLargeText, toggleLargeText } = useTextSize();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(2);
  const palette = ROLE_CONFIGS[currentRole].palette;

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

        {/* Notification Bell & Popover */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setNotificationsOpen((prev) => !prev);
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
