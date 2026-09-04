import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  'aria-label': string; // Mandatory for accessibility
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
      'inline-flex items-center justify-center rounded-md transition-all select-none disabled:opacity-50 disabled:pointer-events-none active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C4FF4D] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0B1C]';

    const variantStyles = {
      primary: 'bg-[#C4FF4D] hover:bg-[#AEE83A] text-[#0A0B1C] lime-glow',
      secondary: 'bg-[#1D1F3D] hover:bg-[#2C2B73] text-[#EEF0FA] border border-[#5B5E8C]/40',
      outline: 'bg-transparent hover:bg-[#1D1F3D] text-[#EEF0FA] border border-[#5B5E8C]/50',
      ghost: 'bg-transparent hover:bg-[#1D1F3D] text-[#A7ABC9] hover:text-[#EEF0FA]',
      destructive: 'bg-[#E5484D] hover:bg-[#c93b40] text-[#EEF0FA]',
    };

    const sizeStyles = {
      sm: 'w-8 h-8 p-1.5',
      md: 'w-10 h-10 p-2 min-h-[40px] min-w-[40px]',
      lg: 'w-12 h-12 p-3 min-h-[48px] min-w-[48px]', // Touch target friendly
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
