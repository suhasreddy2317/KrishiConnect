import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface CardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  variant?: 'default' | 'raised' | 'interactive' | 'flat';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  headerAction?: React.ReactNode;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      variant = 'default',
      padding = 'md',
      title,
      subtitle,
      headerAction,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles = 'rounded-xl border transition-colors';

    const variantStyles = {
      default: 'bg-surface border-border text-text-main',
      raised: 'bg-surface-raised border-border text-text-main',
      interactive:
        'bg-surface hover:bg-surface-raised border-border hover:border-primary text-text-main cursor-pointer active:scale-[0.99]',
      flat: 'bg-transparent border-border text-text-main',
    };

    const paddingStyles = {
      none: '',
      sm: 'p-3 sm:p-4',
      md: 'p-4 sm:p-6',
      lg: 'p-6 sm:p-8',
    };

    const hasHeader = title || subtitle || headerAction;

    return (
      <div
        ref={ref}
        className={cn(baseStyles, variantStyles[variant], paddingStyles[padding], className)}
        {...props}
      >
        {hasHeader && (
          <div className="flex items-start justify-between gap-3 pb-4 mb-4 border-b border-border">
            <div>
              {title && (
                <div className="text-base font-semibold text-text-main tracking-tight">
                  {title}
                </div>
              )}
              {subtitle && (
                <div className="text-xs text-text-muted mt-0.5">{subtitle}</div>
              )}
            </div>
            {headerAction && <div className="shrink-0">{headerAction}</div>}
          </div>
        )}
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';
