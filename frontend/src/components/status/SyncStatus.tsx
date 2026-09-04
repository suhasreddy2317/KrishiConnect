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
      color: 'text-[#2FBF8F]',
      bg: 'bg-[#2FBF8F]/10',
      border: 'border-[#2FBF8F]/30',
    },
    Syncing: {
      label: 'Syncing...',
      icon: RefreshCw,
      color: 'text-[#C4FF4D]',
      bg: 'bg-[#C4FF4D]/10',
      border: 'border-[#C4FF4D]/30',
      spin: true,
    },
    Offline: {
      label: 'Offline Mode',
      icon: WifiOff,
      color: 'text-[#F5A623]',
      bg: 'bg-[#F5A623]/10',
      border: 'border-[#F5A623]/30',
    },
    'Pending Upload': {
      label: 'Pending Upload (Local)',
      icon: UploadCloud,
      color: 'text-[#A7ABC9]',
      bg: 'bg-[#5B5E8C]/20',
      border: 'border-[#5B5E8C]/40',
    },
    Failed: {
      label: 'Sync Failed',
      icon: AlertCircle,
      color: 'text-[#E5484D]',
      bg: 'bg-[#E5484D]/10',
      border: 'border-[#E5484D]/30',
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
        <span className="text-[#A7ABC9] text-[11px] hidden sm:inline">
          ({lastSyncedTime})
        </span>
      )}
    </div>
  );
};
