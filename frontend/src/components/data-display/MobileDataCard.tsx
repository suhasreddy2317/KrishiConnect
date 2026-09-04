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
        'w-full rounded-xl bg-[#14152E] border border-[#2C2B73] p-4 transition-all',
        onClick && 'cursor-pointer hover:border-[#5B5E8C] active:scale-[0.99]',
        className
      )}
    >
      {/* Top row: Title and Status Badge */}
      <div className="flex items-start justify-between gap-2 pb-3 border-b border-[#2C2B73]/60">
        <div>
          <h3 className="text-sm font-semibold text-[#EEF0FA] leading-tight">
            {title}
          </h3>
          {subtitle && (
            <p className="text-xs text-[#A7ABC9] mt-0.5">{subtitle}</p>
          )}
        </div>
        {statusBadge && <div className="shrink-0">{statusBadge}</div>}
      </div>

      {/* Center row: Primary Value Highlight */}
      {primaryValue && (
        <div className="my-3 p-3 rounded-lg bg-[#1D1F3D] flex items-center justify-between">
          <span className="text-xs text-[#A7ABC9]">
            {primaryValue.label || 'Primary Value'}
          </span>
          <div className="flex items-baseline space-x-1 font-mono-data">
            <span className="text-lg font-bold text-[#C4FF4D]">
              {primaryValue.value}
            </span>
            {primaryValue.unit && (
              <span className="text-xs text-[#EEF0FA]">{primaryValue.unit}</span>
            )}
          </div>
        </div>
      )}

      {/* Bottom Key-Value Grid */}
      <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
        {details.map((item, idx) => (
          <div key={idx} className="space-y-0.5">
            <span className="text-[#A7ABC9] text-[11px] block">{item.label}</span>
            <span
              className={cn(
                'text-[#EEF0FA] font-medium block',
                item.isNumeric && 'font-mono-data'
              )}
            >
              {item.value}
            </span>
          </div>
        ))}
      </div>

      {onClick && (
        <div className="mt-3 pt-2.5 border-t border-[#2C2B73]/50 flex items-center justify-between text-xs text-[#C4FF4D] font-medium">
          <span>View full details</span>
          <ChevronRight className="w-4 h-4" />
        </div>
      )}
    </div>
  );
};
