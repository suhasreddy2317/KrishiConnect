import React from 'react';
import { cn } from '@/lib/utils';
import { Check, RefreshCw, WifiOff, UploadCloud, AlertCircle } from 'lucide-react';

export type SyncStateType = 'Synced' | 'Syncing' | 'Offline' | 'Pending Upload' | 'Failed';

export interface SyncStatusProps {
  state: SyncStateType;
  lastSyncedTime?: string;
  className?: string;
}

export const SyncStatus: React.FC<SyncStatusProps> = ({
  state,
  lastSyncedTime,
  className,
}) => {
  const configs: Record<
    SyncStateType,
    { label: string; icon: React.ElementType; color: string; bg: string; border: string; spin?: boolean }
  > = {
    Synced: {
      label: 'Synced',
      icon: Check,
      color: 'text-status-success',
      bg: 'bg-status-success/10',
      border: 'border-status-success/30',
    },
    Syncing: {
      label: 'Syncing...',
      icon: RefreshCw,
      color: 'text-accent',
      bg: 'bg-accent/10',
      border: 'border-accent/30',
      spin: true,
    },
    Offline: {
      label: 'Offline Mode',
      icon: WifiOff,
      color: 'text-status-warning',
      bg: 'bg-status-warning/10',
      border: 'border-status-warning/30',
    },
    'Pending Upload': {
      label: 'Pending Upload (Local)',
      icon: UploadCloud,
      color: 'text-text-muted',
      bg: 'bg-surface-raised',
      border: 'border-border',
    },
    Failed: {
      label: 'Sync Failed',
      icon: AlertCircle,
      color: 'text-status-error',
      bg: 'bg-status-error/10',
      border: 'border-status-error/30',
    },
  };

  const config = configs[state];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        'inline-flex items-center space-x-2 px-2.5 py-1 rounded-full border text-xs font-mono select-none',
        config.bg,
        config.border,
        className
      )}
      title={lastSyncedTime ? `Last synced: ${lastSyncedTime}` : undefined}
    >
      <Icon className={cn('w-3.5 h-3.5', config.color, config.spin && 'animate-spin')} />
      <span className={cn('font-medium', config.color)}>{config.label}</span>
      {lastSyncedTime && (
        <span className="text-text-muted text-[11px] hidden sm:inline">
          ({lastSyncedTime})
        </span>
      )}
    </div>
  );
};
