import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  className,
}) => {
  return (
    <div
      className={cn(
        'rounded-2xl bg-[#14152E] border border-[#2C2B73] p-8 sm:p-12 text-center flex flex-col items-center justify-center max-w-lg mx-auto',
        className
      )}
    >
      {icon && (
        <div className="w-14 h-14 rounded-2xl bg-[#1D1F3D] border border-[#5B5E8C]/40 flex items-center justify-center text-[#C4FF4D] mb-4">
          {icon}
        </div>
      )}

      <h3 className="text-lg font-semibold text-[#EEF0FA] tracking-tight">
        {title}
      </h3>
      <p className="text-xs sm:text-sm text-[#A7ABC9] mt-2 mb-6 max-w-sm leading-relaxed">
        {description}
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
        {actionLabel && onAction && (
          <Button
            variant="primary"
            onClick={onAction}
            className="w-full sm:w-auto"
          >
            {actionLabel}
          </Button>
        )}
        {secondaryActionLabel && onSecondaryAction && (
          <Button
            variant="secondary"
            onClick={onSecondaryAction}
            className="w-full sm:w-auto"
          >
            {secondaryActionLabel}
          </Button>
        )}
      </div>
    </div>
  );
};
