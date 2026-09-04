import React from 'react';
import { cn } from '@/lib/utils';
import { AlertTriangle, AlertOctagon, CheckCircle2, Info, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export interface AlertBannerProps {
  variant?: 'warning' | 'error' | 'success' | 'info';
  title?: string;
  message: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  onDismiss?: () => void;
  className?: string;
}

export const AlertBanner: React.FC<AlertBannerProps> = ({
  variant = 'info',
  title,
  message,
  actionLabel,
  onAction,
  onDismiss,
  className,
}) => {
  const configs = {
    warning: {
      border: 'border-[#F5A623]/50',
      bg: 'bg-[#F5A623]/10',
      textColor: 'text-[#F5A623]',
      icon: AlertTriangle,
    },
    error: {
      border: 'border-[#E5484D]/50',
      bg: 'bg-[#E5484D]/10',
      textColor: 'text-[#E5484D]',
      icon: AlertOctagon,
    },
    success: {
      border: 'border-[#2FBF8F]/50',
      bg: 'bg-[#2FBF8F]/10',
      textColor: 'text-[#2FBF8F]',
      icon: CheckCircle2,
    },
    info: {
      border: 'border-[#2C2B73]',
      bg: 'bg-[#14152E]',
      textColor: 'text-[#C4FF4D]',
      icon: Info,
    },
  };

  const config = configs[variant];
  const Icon = config.icon;

  return (
    <div
      role="alert"
      className={cn(
        'w-full rounded-lg border p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-sm',
        config.bg,
        config.border,
        className
      )}
    >
      <div className="flex items-start space-x-3">
        <Icon className={cn('w-5 h-5 shrink-0 mt-0.5', config.textColor)} />
        <div>
          {title && (
            <h4 className={cn('font-semibold tracking-tight', config.textColor)}>
              {title}
            </h4>
          )}
          <div className="text-xs sm:text-sm text-[#EEF0FA]">{message}</div>
        </div>
      </div>

      <div className="flex items-center space-x-2 shrink-0 self-end sm:self-auto">
        {actionLabel && onAction && (
          <Button size="sm" variant="outline" onClick={onAction}>
            {actionLabel}
          </Button>
        )}
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Dismiss banner"
            className="p-1 rounded text-[#A7ABC9] hover:text-[#EEF0FA] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C4FF4D]"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
