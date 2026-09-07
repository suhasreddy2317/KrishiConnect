import React from 'react';
import { cn } from '@/lib/utils';
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  AlertOctagon,
  RefreshCw,
  Award,
} from 'lucide-react';

export type StatusType =
  | 'verified-buyer'
  | 'kyc-verified'
  | 'trusted'
  | 'pending-verification'
  | 'warning'
  | 'dispute'
  | 'sync-pending'
  | 'grade'
  | 'active'
  | 'completed';

export interface StatusBadgeProps {
  status: StatusType;
  label?: string;
  size?: 'sm' | 'md';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  label,
  size = 'md',
  className,
}) => {
  const configs: Record<
    StatusType,
    { defaultLabel: string; icon: React.ElementType; colorClasses: string }
  > = {
    'verified-buyer': {
      defaultLabel: 'Verified Buyer',
      icon: ShieldCheck,
      colorClasses: 'bg-status-success/15 border-status-success/50 text-status-success',
    },
    'kyc-verified': {
      defaultLabel: 'KYC Verified',
      icon: CheckCircle2,
      colorClasses: 'bg-status-success/15 border-status-success/50 text-status-success',
    },
    trusted: {
      defaultLabel: 'High Trust',
      icon: Award,
      colorClasses: 'bg-status-success/15 border-status-success/50 text-status-success',
    },
    'pending-verification': {
      defaultLabel: 'Pending Review',
      icon: Clock,
      colorClasses: 'bg-status-warning/15 border-status-warning/50 text-status-warning',
    },
    warning: {
      defaultLabel: 'Action Required',
      icon: AlertTriangle,
      colorClasses: 'bg-status-warning/15 border-status-warning/50 text-status-warning',
    },
    dispute: {
      defaultLabel: 'Dispute Open',
      icon: AlertOctagon,
      colorClasses: 'bg-status-error/15 border-status-error/50 text-status-error',
    },
    'sync-pending': {
      defaultLabel: 'Sync Pending',
      icon: RefreshCw,
      colorClasses: 'bg-surface-raised border-border text-text-muted',
    },
    grade: {
      defaultLabel: 'Grade A',
      icon: Award,
      colorClasses: 'bg-surface-raised border-border text-text-main',
    },
    active: {
      defaultLabel: 'Live / Active',
      icon: Clock,
      colorClasses: 'bg-accent/15 border-accent/50 text-accent',
    },
    completed: {
      defaultLabel: 'Settled',
      icon: CheckCircle2,
      colorClasses: 'bg-status-success/15 border-status-success/50 text-status-success',
    },
  };

  const config = configs[status];
  const Icon = config.icon;
  const displayText = label || config.defaultLabel;

  const sizeStyles = {
    sm: 'text-[10px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center font-mono uppercase tracking-wider rounded-full border select-none font-semibold',
        config.colorClasses,
        sizeStyles[size],
        className
      )}
    >
      <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
      <span>{displayText}</span>
    </span>
  );
};
