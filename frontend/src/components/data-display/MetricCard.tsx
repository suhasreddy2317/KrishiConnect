import React from 'react';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { DataFreshness } from '@/components/status/DataFreshness';

export interface MetricCardProps {
  label: string;
  value: string | number;
  unit?: string;
  change?: {
    value: string | number;
    isPositive?: boolean;
    isNeutral?: boolean;
    period?: string;
  };
  timestamp?: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'raised';
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  unit,
  change,
  timestamp,
  icon,
  variant = 'default',
  className,
}) => {
  return (
    <div
      className={cn(
        'rounded-xl border p-4 sm:p-5 flex flex-col justify-between transition-colors',
        variant === 'raised'
          ? 'bg-[#1D1F3D] border-[#5B5E8C]/30'
          : 'bg-[#14152E] border-[#2C2B73]',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <span className="text-xs font-medium text-[#A7ABC9] tracking-wide">
          {label}
        </span>
        {icon && <div className="text-[#A7ABC9]">{icon}</div>}
      </div>

      <div className="my-2">
        <div className="flex items-baseline space-x-1.5">
          <span className="font-mono-data text-2xl sm:text-3xl font-bold tracking-tight text-[#EEF0FA]">
            {value}
          </span>
          {unit && (
            <span className="font-mono-data text-xs text-[#A7ABC9] font-medium">
              {unit}
            </span>
          )}
        </div>

        {change && (
          <div className="flex items-center space-x-1 mt-1 text-xs font-mono">
            {change.isNeutral ? (
              <span className="text-[#A7ABC9] flex items-center">
                <Minus className="w-3 h-3 mr-0.5" />
                {change.value}
              </span>
            ) : change.isPositive ? (
              <span className="text-[#2FBF8F] flex items-center font-medium">
                <TrendingUp className="w-3 h-3 mr-0.5" />
                +{change.value}
              </span>
            ) : (
              <span className="text-[#E5484D] flex items-center font-medium">
                <TrendingDown className="w-3 h-3 mr-0.5" />
                -{change.value}
              </span>
            )}
            {change.period && (
              <span className="text-[#5B5E8C] ml-1">vs {change.period}</span>
            )}
          </div>
        )}
      </div>

      {timestamp && (
        <div className="pt-2 border-t border-[#2C2B73]/50">
          <DataFreshness timestamp={timestamp} />
        </div>
      )}
    </div>
  );
};
