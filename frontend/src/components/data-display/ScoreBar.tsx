import React from 'react';
import { cn } from '@/lib/utils';

export interface ScoreBarProps {
  value: number;
  label?: string;
  minLabel?: string;
  maxLabel?: string;
  showValue?: boolean;
  className?: string;
}

export const ScoreBar: React.FC<ScoreBarProps> = ({
  value,
  label,
  minLabel = '0',
  maxLabel = '100',
  showValue = true,
  className,
}) => {
  const clamped = Math.min(100, Math.max(0, value));

  const getBarColor = (val: number) => {
    if (val >= 75) return 'bg-accent';
    if (val >= 50) return 'bg-status-warning';
    return 'bg-status-error';
  };

  return (
    <div className={cn('w-full space-y-1.5', className)}>
      {(label || showValue) && (
        <div className="flex items-center justify-between text-xs">
          {label && <span className="text-text-muted font-medium">{label}</span>}
          {showValue && (
            <span className="font-mono-data font-bold text-text-main">
              {clamped}%
            </span>
          )}
        </div>
      )}

      <div className="w-full h-2 rounded-full bg-surface-raised overflow-hidden p-0.5 border border-border">
        <div
          className={cn('h-full rounded-full transition-all duration-500', getBarColor(clamped))}
          style={{ width: `${clamped}%` }}
        />
      </div>

      {(minLabel || maxLabel) && (
        <div className="flex items-center justify-between text-[10px] font-mono text-text-muted">
          <span>{minLabel}</span>
          <span>{maxLabel}</span>
        </div>
      )}
    </div>
  );
};
