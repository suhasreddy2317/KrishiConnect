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
      colorClasses: 'bg-[#2FBF8F]/15 border-[#2FBF8F]/50 text-[#2FBF8F]',
    },
    'kyc-verified': {
      defaultLabel: 'KYC Verified',
      icon: CheckCircle2,
      colorClasses: 'bg-[#2FBF8F]/15 border-[#2FBF8F]/50 text-[#2FBF8F]',
    },
    trusted: {
      defaultLabel: 'High Trust',
      icon: Award,
      colorClasses: 'bg-[#2FBF8F]/15 border-[#2FBF8F]/50 text-[#2FBF8F]',
    },
    'pending-verification': {
      defaultLabel: 'Pending Review',
      icon: Clock,
      colorClasses: 'bg-[#F5A623]/15 border-[#F5A623]/50 text-[#F5A623]',
    },
    warning: {
      defaultLabel: 'Action Required',
      icon: AlertTriangle,
      colorClasses: 'bg-[#F5A623]/15 border-[#F5A623]/50 text-[#F5A623]',
    },
    dispute: {
      defaultLabel: 'Dispute Open',
      icon: AlertOctagon,
      colorClasses: 'bg-[#E5484D]/15 border-[#E5484D]/50 text-[#E5484D]',
    },
    'sync-pending': {
      defaultLabel: 'Sync Pending',
      icon: RefreshCw,
      colorClasses: 'bg-[#5B5E8C]/20 border-[#5B5E8C]/50 text-[#A7ABC9]',
    },
    grade: {
      defaultLabel: 'Grade A',
      icon: Award,
      colorClasses: 'bg-[#1D1F3D] border-[#5B5E8C]/40 text-[#EEF0FA]',
    },
    active: {
      defaultLabel: 'Live / Active',
      icon: Clock,
      colorClasses: 'bg-[#C4FF4D]/15 border-[#C4FF4D]/50 text-[#C4FF4D]',
    },
    completed: {
      defaultLabel: 'Settled',
      icon: CheckCircle2,
      colorClasses: 'bg-[#2FBF8F]/15 border-[#2FBF8F]/50 text-[#2FBF8F]',
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
