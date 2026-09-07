import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  'aria-label': string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  icon: React.ReactNode;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      className,
      variant = 'ghost',
      size = 'md',
      icon,
      'aria-label': ariaLabel,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center rounded-md transition-all select-none disabled:opacity-50 disabled:pointer-events-none active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background';

    const variantStyles = {
      primary: 'bg-primary hover:bg-primary-hover text-white',
      secondary: 'bg-surface-raised hover:bg-border text-text-main border border-border',
      outline: 'bg-transparent hover:bg-surface-raised text-text-main border border-border',
      ghost: 'bg-transparent hover:bg-surface-raised text-text-muted hover:text-text-main',
      destructive: 'bg-status-error hover:bg-red-700 text-white',
    };

    const sizeStyles = {
      sm: 'w-8 h-8 p-1.5',
      md: 'w-10 h-10 p-2 min-h-[40px] min-w-[40px]',
      lg: 'w-12 h-12 p-3 min-h-[48px] min-w-[48px]',
    };

    return (
      <button
        ref={ref}
        aria-label={ariaLabel}
        disabled={disabled}
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        {...props}
      >
        {icon}
      </button>
    );
  }
);

IconButton.displayName = 'IconButton';
