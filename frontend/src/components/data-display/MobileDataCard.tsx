import React from 'react';
import { cn } from '@/lib/utils';
import { ChevronRight } from 'lucide-react';

export interface KeyValueItem {
  label: string;
  value: React.ReactNode;
  isNumeric?: boolean;
}

export interface MobileDataCardProps {
  title: string;
  subtitle?: string;
  statusBadge?: React.ReactNode;
  primaryValue?: {
    value: string | number;
    unit?: string;
    label?: string;
  };
  details: KeyValueItem[];
  onClick?: () => void;
  className?: string;
}

export const MobileDataCard: React.FC<MobileDataCardProps> = ({
  title,
  subtitle,
  statusBadge,
  primaryValue,
  details,
  onClick,
  className,
}) => {
  return (
    <div
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      className={cn(
        'w-full rounded-xl bg-surface border border-border p-4 transition-all',
        onClick && 'cursor-pointer hover:border-primary active:scale-[0.99]',
        className
      )}
    >
      <div className="flex items-start justify-between gap-2 pb-3 border-b border-border">
        <div>
          <h3 className="text-sm font-semibold text-text-main leading-tight">
            {title}
          </h3>
          {subtitle && (
            <p className="text-xs text-text-muted mt-0.5">{subtitle}</p>
          )}
        </div>
        {statusBadge && <div className="shrink-0">{statusBadge}</div>}
      </div>

      {primaryValue && (
        <div className="my-3 p-3 rounded-lg bg-surface-raised flex items-center justify-between">
          <span className="text-xs text-text-muted">
            {primaryValue.label || 'Primary Value'}
          </span>
          <div className="flex items-baseline space-x-1 font-mono-data">
            <span className="text-lg font-bold text-accent">
              {primaryValue.value}
            </span>
            {primaryValue.unit && (
              <span className="text-xs text-text-main">{primaryValue.unit}</span>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
        {details.map((item, idx) => (
          <div key={idx} className="space-y-0.5">
            <span className="text-text-muted text-[11px] block">{item.label}</span>
            <span
              className={cn(
                'text-text-main font-medium block',
                item.isNumeric && 'font-mono-data'
              )}
            >
              {item.value}
            </span>
          </div>
        ))}
      </div>

      {onClick && (
        <div className="mt-3 pt-2.5 border-t border-border flex items-center justify-between text-xs text-accent font-medium">
          <span>View full details</span>
          <ChevronRight className="w-4 h-4" />
        </div>
      )}
    </div>
  );
};
