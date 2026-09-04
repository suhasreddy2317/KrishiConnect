import React from 'react';
import { cn } from '@/lib/utils';

export interface ScoreBarProps {
  value: number; // 0 to 100
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
    if (val >= 75) return 'bg-[#C4FF4D]';
    if (val >= 50) return 'bg-[#F5A623]';
    return 'bg-[#E5484D]';
  };

  return (
    <div className={cn('w-full space-y-1.5', className)}>
      {(label || showValue) && (
        <div className="flex items-center justify-between text-xs">
          {label && <span className="text-[#A7ABC9] font-medium">{label}</span>}
          {showValue && (
            <span className="font-mono-data font-bold text-[#EEF0FA]">
              {clamped}%
            </span>
          )}
        </div>
      )}

      {/* Track */}
      <div className="w-full h-2 rounded-full bg-[#1D1F3D] overflow-hidden p-0.5 border border-[#2C2B73]/60">
        <div
          className={cn('h-full rounded-full transition-all duration-500', getBarColor(clamped))}
          style={{ width: `${clamped}%` }}
        />
      </div>

      {(minLabel || maxLabel) && (
        <div className="flex items-center justify-between text-[10px] font-mono text-[#5B5E8C]">
          <span>{minLabel}</span>
          <span>{maxLabel}</span>
        </div>
      )}
    </div>
  );
};
