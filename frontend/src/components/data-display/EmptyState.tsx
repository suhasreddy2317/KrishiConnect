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
        'rounded-2xl bg-surface border border-border p-8 sm:p-12 text-center flex flex-col items-center justify-center max-w-lg mx-auto',
        className
      )}
    >
      {icon && (
        <div className="w-14 h-14 rounded-2xl bg-surface-raised border border-border flex items-center justify-center text-accent mb-4">
          {icon}
        </div>
      )}

      <h3 className="text-lg font-semibold text-text-main tracking-tight">
        {title}
      </h3>
      <p className="text-xs sm:text-sm text-text-muted mt-2 mb-6 max-w-sm leading-relaxed">
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
