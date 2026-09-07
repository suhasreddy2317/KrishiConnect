import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'secondary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium transition-all select-none disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background';

    const variantStyles = {
      primary: 'bg-primary hover:bg-primary-hover text-white font-semibold border border-transparent',
      secondary: 'bg-surface-raised hover:bg-border text-text-main border border-border',
      outline: 'bg-transparent hover:bg-surface-raised text-text-main border border-border hover:border-text-muted',
      ghost: 'bg-transparent hover:bg-surface-raised text-text-muted hover:text-text-main',
      destructive: 'bg-status-error hover:bg-red-700 text-white font-medium border border-transparent',
    };

    const sizeStyles = {
      sm: 'text-xs h-8 px-3 rounded-sm gap-1.5',
      md: 'text-sm h-10 px-4 rounded-md gap-2 min-h-[40px]',
      lg: 'text-base h-12 px-6 rounded-md gap-2.5 min-h-[48px]',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          baseStyles,
          variantStyles[variant],
          sizeStyles[size],
          fullWidth && 'w-full',
          className
        )}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin text-current" />
        ) : (
          leftIcon
        )}
        <span>{children}</span>
        {!isLoading && rightIcon}
      </button>
    );
  }
);

Button.displayName = 'Button';
