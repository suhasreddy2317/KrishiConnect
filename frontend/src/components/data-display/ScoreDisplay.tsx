import React from 'react';
import { cn } from '@/lib/utils';

export interface ScoreDisplayProps {
  score: number;
  label: string;
  verdict?: string;
  size?: 'sm' | 'md' | 'lg';
  showBar?: boolean;
  className?: string;
}

export const ScoreDisplay: React.FC<ScoreDisplayProps> = ({
  score,
  label,
  verdict,
  size = 'md',
  showBar = false,
  className,
}) => {
  const getColor = (val: number) => {
    if (val >= 75) return { text: 'text-accent', bg: 'bg-accent', border: 'border-accent/40' };
    if (val >= 50) return { text: 'text-status-warning', bg: 'bg-status-warning', border: 'border-status-warning/40' };
    return { text: 'text-status-error', bg: 'bg-status-error', border: 'border-status-error/40' };
  };

  const colors = getColor(score);

  const sizeStyles = {
    sm: { number: 'text-2xl', label: 'text-xs', wrap: 'p-3' },
    md: { number: 'text-3xl sm:text-4xl', label: 'text-xs sm:text-sm', wrap: 'p-4' },
    lg: { number: 'text-5xl sm:text-6xl', label: 'text-sm sm:text-base', wrap: 'p-6' },
  };

  return (
    <div
      className={cn(
        'rounded-xl bg-surface border border-border flex flex-col justify-between',
        sizeStyles[size].wrap,
        className
      )}
    >
      <div>
        <span className={cn('font-medium text-text-muted block', sizeStyles[size].label)}>
          {label}
        </span>
        {verdict && (
          <span className={cn('font-semibold text-xs tracking-tight block mt-0.5', colors.text)}>
            {verdict}
          </span>
        )}
      </div>

      <div className="flex items-baseline space-x-1.5 my-2">
        <span
          className={cn(
            'font-mono-data font-bold tracking-tight',
            colors.text,
            sizeStyles[size].number
          )}
        >
          {score}
        </span>
        <span className="font-mono-data text-xs sm:text-sm text-text-muted font-semibold">
          / 100
        </span>
      </div>

      {showBar && (
        <div className="w-full h-1.5 rounded-full bg-surface-raised overflow-hidden mt-1">
          <div
            className={cn('h-full rounded-full transition-all duration-500', colors.bg)}
            style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
          />
        </div>
      )}
    </div>
  );
};
