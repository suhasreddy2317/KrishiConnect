import React from 'react';
import { cn } from '@/lib/utils';

export interface ScoreDisplayProps {
  score: number; // 0 to 100
  label: string; // e.g. "Sale Window Score" or "Buyer Confidence"
  verdict?: string; // e.g. "Strong Sell Window" or "High Trust Tier"
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
  // Determine color threshold
  const getColor = (val: number) => {
    if (val >= 75) return { text: 'text-[#C4FF4D]', bg: 'bg-[#C4FF4D]', border: 'border-[#C4FF4D]/40' };
    if (val >= 50) return { text: 'text-[#F5A623]', bg: 'bg-[#F5A623]', border: 'border-[#F5A623]/40' };
    return { text: 'text-[#E5484D]', bg: 'bg-[#E5484D]', border: 'border-[#E5484D]/40' };
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
        'rounded-xl bg-[#14152E] border border-[#2C2B73] flex flex-col justify-between',
        sizeStyles[size].wrap,
        className
      )}
    >
      <div>
        <span className={cn('font-medium text-[#A7ABC9] block', sizeStyles[size].label)}>
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
        <span className="font-mono-data text-xs sm:text-sm text-[#5B5E8C] font-semibold">
          / 100
        </span>
      </div>

      {showBar && (
        <div className="w-full h-1.5 rounded-full bg-[#1D1F3D] overflow-hidden mt-1">
          <div
            className={cn('h-full rounded-full transition-all duration-500', colors.bg)}
            style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
          />
        </div>
      )}
    </div>
  );
};
