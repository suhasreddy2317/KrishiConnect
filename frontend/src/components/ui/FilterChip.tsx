import React from 'react';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

export interface FilterChipProps {
  label: string;
  isSelected?: boolean;
  count?: number | string;
  onClick?: () => void;
  onRemove?: () => void;
  className?: string;
}

export const FilterChip: React.FC<FilterChipProps> = ({
  label,
  isSelected = false,
  count,
  onClick,
  onRemove,
  className,
}) => {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      }}
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-all select-none border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C4FF4D]',
        isSelected
          ? 'bg-[#C4FF4D]/15 text-[#C4FF4D] border-[#C4FF4D]/50 font-semibold'
          : 'bg-[#14152E] hover:bg-[#1D1F3D] text-[#A7ABC9] hover:text-[#EEF0FA] border-[#2C2B73]',
        className
      )}
    >
      <span>{label}</span>

      {count !== undefined && (
        <span
          className={cn(
            'font-mono text-[10px] px-1.5 py-0.2 rounded-full',
            isSelected
              ? 'bg-[#C4FF4D] text-[#0A0B1C] font-bold'
              : 'bg-[#1D1F3D] text-[#A7ABC9]'
          )}
        >
          {count}
        </span>
      )}

      {onRemove && (
        <button
          type="button"
          aria-label={`Remove filter ${label}`}
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="p-0.5 -mr-1 text-current hover:opacity-75 rounded-full focus:outline-none focus:ring-1 focus:ring-[#C4FF4D]"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </div>
  );
};
