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
      default: 'bg-[#14152E] border-[#2C2B73]/70 text-[#EEF0FA]', // Loam base elevation
      raised: 'bg-[#1D1F3D] border-[#5B5E8C]/30 text-[#EEF0FA]', // Topsoil elevation
      interactive:
        'bg-[#14152E] hover:bg-[#1D1F3D] border-[#2C2B73]/70 hover:border-[#5B5E8C] text-[#EEF0FA] cursor-pointer active:scale-[0.99]',
      flat: 'bg-transparent border-[#2C2B73]/50 text-[#EEF0FA]',
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
          <div className="flex items-start justify-between gap-3 pb-4 mb-4 border-b border-[#2C2B73]/60">
            <div>
              {title && (
                <div className="text-base font-semibold text-[#EEF0FA] tracking-tight">
                  {title}
                </div>
              )}
              {subtitle && (
                <div className="text-xs text-[#A7ABC9] mt-0.5">{subtitle}</div>
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
