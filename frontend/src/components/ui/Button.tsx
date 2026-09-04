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
    // Base styles: dark-mode first, strong font, accessible focus ring
    const baseStyles =
      'inline-flex items-center justify-center font-medium transition-all select-none disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C4FF4D] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0B1C]';

    // Variant mapping: Cyber Lime is strictly primary CTA
    const variantStyles = {
      primary:
        'bg-[#C4FF4D] hover:bg-[#AEE83A] text-[#0A0B1C] font-semibold lime-glow hover:shadow-[0_0_18px_rgba(196,255,77,0.38)] border border-transparent',
      secondary:
        'bg-[#1D1F3D] hover:bg-[#2C2B73] text-[#EEF0FA] border border-[#5B5E8C]/40 hover:border-[#5B5E8C]',
      outline:
        'bg-transparent hover:bg-[#1D1F3D] text-[#EEF0FA] border border-[#5B5E8C]/60 hover:border-[#EEF0FA]/60',
      ghost:
        'bg-transparent hover:bg-[#14152E] text-[#A7ABC9] hover:text-[#EEF0FA]',
      destructive:
        'bg-[#E5484D] hover:bg-[#c93b40] text-[#EEF0FA] font-medium border border-transparent',
    };

    // Size mapping with touch target conscious heights (minimum 44px for standard mobile interactions)
    const sizeStyles = {
      sm: 'text-xs h-8 px-3 rounded-sm gap-1.5',
      md: 'text-sm h-10 px-4 rounded-md gap-2 min-h-[40px]',
      lg: 'text-base h-12 px-6 rounded-md gap-2.5 min-h-[48px]', // Farmer touch friendly
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
